import axios from 'axios';
import tripService from './tripService.js';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

class AIService {
    constructor() {
        // --- Cấu hình Groq (Giữ nguyên con chat cũ) ---
        if (!process.env.GROQ_API_KEY) {
            throw new Error('GROQ_API_KEY is not set in .env');
        }
        this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        this.modelName = 'llama-3.3-70b-versatile';

        // --- Cấu hình Google Maps Geocoding (Thay thế GraphHopper) ---
        this.googleApiKey = process.env.GOOGLE_MAPS_API_KEY; // Dùng key này
        this.geocodingBaseUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
    }

    /**
     * Tìm tọa độ bằng Google Maps API
     * @param {string} locationName - Tên địa điểm
     * @param {Object} userLocation - Vị trí hiện tại {lat, lng} để tìm chính xác hơn
     */
    async geocodeLocation(locationName, userLocation = null) {
        if (!this.googleApiKey) {
            throw new Error('GOOGLE_MAPS_API_KEY is missing in .env');
        }

        try {
            const params = {
                address: locationName,
                key: this.googleApiKey,
                language: 'vi',
                region: 'vn' // Ưu tiên kết quả tại Việt Nam
            };

            // Nếu có tọa độ GPS người dùng, ưu tiên tìm trong bán kính 50km
            if (userLocation && userLocation.lat && userLocation.lng) {
                params.location = `${userLocation.lat},${userLocation.lng}`;
                params.radius = 50000;
            }

            const response = await axios.get(this.geocodingBaseUrl, { params, timeout: 5000 });

            if (response.data.status === 'OK') {
                const result = response.data.results[0];
                return {
                    lat: result.geometry.location.lat,
                    lng: result.geometry.location.lng,
                    address: result.formatted_address // Trả về địa chỉ chuẩn từ Google
                };
            } else {
                console.error(`⚠️ Google Geocoding Status: ${response.data.status}`);
                return null;
            }
        } catch (error) {
            console.error('❌ [GOOGLE GEOCODING ERROR]:', error.message);
            return null;
        }
    }

    /**
     * Phân tích câu lệnh bằng Groq
     */
    async parseUserCommand(userText) {
        const systemPrompt = `Bạn là Trợ lý AI cấp cao của RideGo. Nhiệm vụ của bạn là chuyển đổi ngôn ngữ tự nhiên thành JSON để điều khiển ứng dụng.

### CHIẾN THUẬT TRÍCH XUẤT ĐỊA ĐIỂM (CỰC KỲ QUAN TRỌNG):
- KHÔNG ĐƯỢC rút gọn tên địa danh. Phải giữ nguyên văn các từ chỉ cơ sở, chi nhánh, quận huyện (Ví dụ: "ĐH Khoa học Tự nhiên cơ sở Thủ Đức" -> Giữ nguyên, KHÔNG được viết thành "Khoa học Tự nhiên").
- Nếu người dùng nói "đến [tên địa điểm]", hãy lấy toàn bộ phần nằm sau chữ "đến".
- Ưu tiên các thực thể địa lý có độ chi tiết cao.

### QUY TẮC MÃ HÓA PHƯƠNG TIỆN & THANH TOÁN:
1. SET_VEHICLE: 
   - "xe máy", "moto", "2 bánh" -> "BIKE"
   - "4 chỗ", "ô tô", "xe hơi", "taxi" -> "4_SEATS"
   - "7 chỗ", "xe lớn", "cao cấp" -> "7_SEATS"
2. SET_PAYMENT_METHOD:
   - "tiền mặt", "trả sau" -> "CASH"
   - "ví", "chuyển khoản", "thẻ", "momo", "zalopay" -> "WALLET"

### CẤU TRÚC ĐẦU RA:
- CHỈ TRẢ VỀ JSON. KHÔNG giải thích. KHÔNG chào hỏi.
- "message": Viết một câu phản hồi xác nhận đầy đủ thông tin (Ví dụ: "Đang đặt xe 4 chỗ đưa bạn đến ĐH Khoa học Tự nhiên Thủ Đức...").

### VÍ DỤ CHUẨN:
User: "đặt xe máy đi khoa học tự nhiên thủ đức trả bằng ví"
Output:
{
  "success": true,
  "response_type": "ACTION",
  "message": "Đang tìm xe máy đưa bạn đến Khoa học Tự nhiên Thủ Đức, thanh toán qua ví...",
  "data": {
    "intent": "BOOK_TRIP",
    "steps": [
      { "cmd": "SET_DESTINATION", "value": "Khoa học Tự nhiên Thủ Đức" },
      { "cmd": "SET_VEHICLE", "value": "BIKE" },
      { "cmd": "SET_PAYMENT_METHOD", "value": "WALLET" }
    ]
  }
}`;

        try {
            const completion = await this.groq.chat.completions.create({
                model: this.modelName,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userText }
                ],
                temperature: 0.1,
                max_tokens: 512
            });

            const responseText = completion.choices?.[0]?.message?.content || '';
            let cleanedText = responseText.trim().replace(/```json\s?|```/g, '');
            return JSON.parse(cleanedText);
        } catch (error) {
            console.error('❌ [GROQ PARSING ERROR]:', error.message);
            throw new Error(`Failed to parse user command: ${error.message}`);
        }
    }

    /**
     * Xử lý câu hỏi lịch sử chuyến đi bằng Groq
     */
    async answerTripHistoryQuery(userId, userQuestion) {
        const recentCompleted = await tripService.getUserCompletedTripsWithinMonths(userId, 3, 50);

        if (recentCompleted.length === 0) {
            return 'Tôi không tìm thấy thông tin chuyến đi nào trong khoảng thời gian này';
        }

        const historyText = this.compressTripHistory(recentCompleted);
        const currentDateStr = this.formatDate(new Date());
        const prompt = this.buildHistoryPrompt(historyText, currentDateStr, userQuestion);

        try {
            const completion = await this.groq.chat.completions.create({
                model: this.modelName,
                messages: [
                    { role: 'system', content: 'Bạn là Trợ lý Phân tích Dữ liệu của RideGo.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.2
            });

            return completion.choices?.[0]?.message?.content?.trim() || 'Tôi không tìm thấy dữ liệu.';
        } catch (error) {
            console.error('❌ [GROQ HISTORY ERROR]:', error.message);
            return 'Lỗi khi truy xuất lịch sử.';
        }
    }

    /**
     * Hàm tổng hợp: Parse lệnh + Gán tọa độ Google Maps
     */
    async processCommand(userText, userLocation = null) {
        try {
            // Bước 1: Groq phân tích intent
            const aiResponse = await this.parseUserCommand(userText);
            
            // Bước 2: Áp dụng giá trị mặc định cho xe máy và ví
            const responseWithDefaults = this.applyDefaultValues(aiResponse);
            
            // Bước 3: Tìm tọa độ bằng Google Maps
            const enhancedResponse = await this.enhanceWithCoordinates(responseWithDefaults, userLocation);
            
            return enhancedResponse;
        } catch (error) {
            return {
                success: false,
                response_type: "ERROR",
                message: "Xin lỗi, tôi không hiểu yêu cầu của bạn.",
                error: error.message
            };
        }
    }

    async enhanceWithCoordinates(aiResponse, userLocation = null) {
        const steps = aiResponse.data?.steps || [];
        const enhancedSteps = await Promise.all(
            steps.map(async (step) => {
                if ((step.cmd === 'SET_DESTINATION' || step.cmd === 'SET_LOCATION') && step.value) {
                    const coords = await this.geocodeLocation(step.value, userLocation);
                    if (coords) {
                        return { ...step, lat: coords.lat, lng: coords.lng, value: coords.address };
                    }
                }
                return step;
            })
        );
        return { ...aiResponse, data: { ...aiResponse.data, steps: enhancedSteps } };
    }

    applyDefaultValues(aiResponse) {
        if (aiResponse.data?.intent !== 'BOOK_TRIP') return aiResponse;
        const steps = aiResponse.data?.steps || [];
        const enhancedSteps = [...steps];
        if (!steps.some(s => s.cmd === 'SET_VEHICLE')) enhancedSteps.push({ cmd: 'SET_VEHICLE', value: 'MOTORBIKE' });
        if (!steps.some(s => s.cmd === 'SET_PAYMENT_METHOD')) enhancedSteps.push({ cmd: 'SET_PAYMENT_METHOD', value: 'WALLET' });
        return { ...aiResponse, data: { ...aiResponse.data, steps: enhancedSteps } };
    }

    // --- Các hàm hỗ trợ format (Giữ nguyên của bạn) ---
    parseTripDate(v) { if (!v) return null; if (v.toDate) return v.toDate(); return new Date(v); }
    formatDate(d) { return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`; }
    formatCurrency(a) { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(a); }
    compressTripHistory(trips) {
        return trips.map(t => `[${this.formatDate(this.parseTripDate(t.createdAt))} | ${t.pickup?.address} -> ${t.destination?.address} | ${this.formatCurrency(t.fare)}]`).join('\n');
    }
    buildHistoryPrompt(h, c, q) { return `Hôm nay: ${c}. Lịch sử: ${h}. Trả lời câu hỏi: ${q}`; }
}

export default new AIService();