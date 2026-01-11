import aiService from '../services/aiService.js';

class AIController {
    /**
     * POST /api/ai/command
     * Process user's natural language command and return structured instructions
     * 
     * Request body:
     * {
     *   "text": "User's command text in Vietnamese"
     * }
     * 
     * Response:
     * {
     *   "success": true,
     *   "response_type": "ACTION",
     *   "message": "Confirmation message",
     *   "data": {
     *     "intent": "BOOK_TRIP|ADD_FAVORITE_LOCATION|OPEN_TRIP_HISTORY",
     *     "steps": [
     *       { "cmd": "SET_DESTINATION", "value": "Location name", "lat": 10.123, "lng": 106.456 }
     *     ]
     *   }
     * }
     */
    async getCommandInstruction(req, res) {
        try {
            const { text } = req.body;

            // Validate input
            if (!text || typeof text !== 'string' || text.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    response_type: "ERROR",
                    message: "Vui lòng cung cấp câu lệnh hợp lệ.",
                    error: "Missing or invalid 'text' field"
                });
            }

            // Process the command using AI service
            const result = await aiService.processCommand(text.trim());

            // Return appropriate status code based on success
            const statusCode = result.success ? 200 : 400;
            
            return res.status(statusCode).json(result);

        } catch (error) {
            console.error('AI Controller Error:', error);
            
            return res.status(500).json({
                success: false,
                response_type: "ERROR",
                message: "Đã xảy ra lỗi khi xử lý yêu cầu. Vui lòng thử lại.",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * POST /api/ai/query
     * Answer user queries about trip history using LLM
     */
    async getQueryResponse(req, res) {
        try {
            const { text } = req.body;
            const userId = req.user?.uid;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    response_type: "ERROR",
                    message: "Người dùng chưa được xác thực.",
                    error: "Missing user id"
                });
            }

            if (!text || typeof text !== 'string' || text.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    response_type: "ERROR",
                    message: "Vui lòng cung cấp câu hỏi hợp lệ.",
                    error: "Missing or invalid 'text' field"
                });
            }

            const answer = await aiService.answerTripHistoryQuery(userId, text.trim());

            return res.status(200).json({
                success: true,
                response_type: "TEXT",
                message: answer
            });

        } catch (error) {
            console.error('AI Query Error:', error);
            return res.status(500).json({
                success: false,
                response_type: "ERROR",
                message: "Đã xảy ra lỗi khi xử lý câu hỏi. Vui lòng thử lại.",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    
}

export default new AIController();
