import aiService from '../services/aiService.js';

class AIController {
    /**
     * POST /api/ai/command
     * Nhận lệnh giọng nói/văn bản và trả về chỉ thị cấu trúc
     */
    async getCommandInstruction(req, res) {
        try {
            // Nhận thêm userLocation (lat, lng) từ App gửi lên để tìm kiếm chính xác hơn
            const { text, userLocation } = req.body;
            
            console.log("🔥 [AI CONTROLLER] Nhận lệnh:", text);
            if (userLocation) {
                console.log(`📍 [AI CONTROLLER] Vị trí người dùng: ${userLocation.lat}, ${userLocation.lng}`);
            }

            // 1. Kiểm tra đầu vào
            if (!text || typeof text !== 'string' || text.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    response_type: "ERROR",
                    message: "Vui lòng cung cấp câu lệnh hợp lệ."
                });
            }

            console.log("⏳ [AI CONTROLLER] Đang gửi sang Gemini...");

            // 2. Bước 1: Cho Gemini phân tích Intent và trích xuất địa danh
            const aiResult = await aiService.parseUserCommand(text.trim());

            // 3. Bước 2: Nếu có lệnh liên quan đến địa điểm, tiến hành Geocoding lấy tọa độ thực
            if (aiResult.success && aiResult.data && aiResult.data.steps) {
                for (let step of aiResult.data.steps) {
                    if (step.cmd === 'SET_DESTINATION' || step.cmd === 'SET_LOCATION') {
                        console.log(`⏳ [AI CONTROLLER] Đang Geocoding: "${step.value}"...`);
                        
                        // Gọi hàm Geocode đã nâng cấp (có kèm userLocation để ưu tiên vùng miền)
                        const coords = await aiService.geocodeLocation(step.value, userLocation);
                        
                        if (coords) {
                            console.log(`✅ [AI CONTROLLER] Tìm thấy: [${coords.lat}, ${coords.lng}]`);
                            step.lat = coords.lat;
                            step.lng = coords.lng;
                            // Cập nhật lại tên địa chỉ đầy đủ từ Google để App hiển thị đẹp hơn
                            step.value = coords.address; 
                        }
                    }
                }
            }

            console.log("🤖 [AI CONTROLLER] Kết quả cuối cùng:", JSON.stringify(aiResult, null, 2));
            return res.status(aiResult.success ? 200 : 400).json(aiResult);

        } catch (error) {
            console.error('❌ [AI CONTROLLER] Lỗi hệ thống:', error);
            return res.status(500).json({
                success: false,
                response_type: "ERROR",
                message: "Máy chủ AI đang bận, vui lòng thử lại sau."
            });
        }
    }

    /**
     * POST /api/ai/query
     * Trả lời các câu hỏi về lịch sử chuyến đi
     */
    async getQueryResponse(req, res) {
        try {
            const { text, query } = req.body;
            const userText = text || query;
            const userId = req.user?.uid;

            if (!userId) {
                return res.status(401).json({ success: false, message: "Bạn cần đăng nhập." });
            }

            if (!text) {
                return res.status(400).json({ success: false, message: "Nội dung trống." });
            }

            // Gọi service xử lý trả lời bằng Gemini
            const answer = await aiService.answerTripHistoryQuery(userId, text.trim());

            return res.status(200).json({
                success: true,
                response_type: "TEXT",
                message: answer
            });

        } catch (error) {
            console.error('❌ [AI QUERY ERROR]:', error);
            return res.status(500).json({ success: false, message: "Lỗi xử lý câu hỏi." });
        }
    }


}

export default new AIController();