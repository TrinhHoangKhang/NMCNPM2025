// Legacy (Gemini) import kept for reference:
// import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import tripService from './tripService.js';
import Groq from 'groq-sdk';

class AIService {
    constructor() {
        // --- Legacy Gemini setup (commented out, kept for reference) ---
        // if (!process.env.GEMINI_API_KEY) {
        //     throw new Error('GEMINI_API_KEY is not set');
        // }
        // const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // this.model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // --- Current Groq setup ---
        if (!process.env.GROQ_API_KEY) {
            throw new Error('GROQ_API_KEY is not set');
        }
        this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        this.modelName = 'llama-3.3-70b-versatile';
        this.geocodingApiKey = process.env.GRAPHHOPPER_API_KEY;
        this.geocodingBaseUrl = 'https://graphhopper.com/api/1/geocode';
    }

    /**
     * Geocode a location name to get coordinates
     * @param {string} locationName - The name of the location to geocode
     * @returns {Promise<{lat: number, lng: number}>} Coordinates
     */
    async geocodeLocation(locationName) {
        if (!this.geocodingApiKey) {
            throw new Error('GRAPHHOPPER_API_KEY is missing');
        }

        try {
            const response = await axios.get(this.geocodingBaseUrl, {
                params: {
                    q: locationName,
                    locale: 'vi',
                    key: this.geocodingApiKey,
                    limit: 1
                },
                timeout: 5000
            });

            const hits = response.data?.hits;
            if (!hits || hits.length === 0) {
                throw new Error(`Location not found: ${locationName}`);
            }

            const point = hits[0].point;
            return {
                lat: point.lat,
                lng: point.lng
            };
        } catch (error) {
            console.error('Geocoding error:', error.message);
            throw new Error(`Failed to geocode location: ${locationName}`);
        }
    }

    /**
     * Parse user command using AI and return structured JSON
     * @param {string} userText - User's command text
     * @returns {Promise<Object>} Structured response with intent and steps
     */
    async parseUserCommand(userText) {
        const systemPrompt = `Bạn là Trợ lý Điều hướng AI của ứng dụng RideGo. 
Nhiệm vụ của bạn là phân tích câu lệnh của người dùng và chuyển đổi chúng thành cấu trúc lệnh JSON chính xác để ứng dụng Mobile thực thi.

### DANH SÁCH INTENT VÀ CÔNG VIỆC HỢP LỆ:

1. Intent "BOOK_TRIP" (Đặt chuyến xe):
   - Các lệnh đi kèm: SET_DESTINATION (bắt buộc), SET_VEHICLE, SET_PAYMENT_METHOD.
   - Quy tắc SET_VEHICLE: "xe máy" -> "BIKE", "ô tô/xe hơi/4 chỗ" -> "4_SEATS", "7 chỗ" -> "7_SEATS". Không nhắc đến thì để trống.
   - Quy tắc SET_PAYMENT_METHOD: "tiền mặt" -> "CASH", "ví/chuyển khoản" -> "WALLET". Không nhắc đến thì để trống

2. Intent "ADD_FAVORITE_LOCATION" (Thêm địa điểm yêu thích):
   - Lệnh đi kèm: SET_LOCATION (bắt buộc).

3. Intent "OPEN_TRIP_HISTORY" (Mở lịch sử chuyến đi):
   - Không có lệnh đi kèm trong "steps".

### QUY TẮC ĐẦU RA (CHỈ TRẢ VỀ JSON):
- KHÔNG giải thích, KHÔNG chào hỏi. Luôn trả về JSON hợp lệ.
- Trường "message" là câu phản hồi ngắn gọn cho người dùng.
- Đối với các lệnh SET_DESTINATION hoặc SET_LOCATION: Phải cung cấp tên địa điểm ("value"). KHÔNG thêm trường lat, lng vào đây.

### CẤU TRÚC JSON MẪU:
{
  "success": true,
  "response_type": "ACTION",
  "message": "Thông báo ngắn gọn",
  "data": {
    "intent": "TÊN_INTENT",
    "steps": [
      { "cmd": "TÊN_LỆNH", "value": "Giá trị"}
    ]
  }
}

### VÍ DỤ:
User: "Lấy cho tôi một cái ô tô 4 chỗ đi sân bay Tân Sơn Nhất trả bằng tiền mặt"
Output:
{
  "success": true,
  "response_type": "ACTION",
  "message": "Đang chuẩn bị xe ô tô đưa bạn đến sân bay Tân Sơn Nhất...",
  "data": {
    "intent": "BOOK_TRIP",
    "steps": [
      { "cmd": "SET_DESTINATION", "value": "Sân bay Tân Sơn Nhất"},
      { "cmd": "SET_VEHICLE", "value": "4_SEATS" },
      { "cmd": "SET_PAYMENT_METHOD", "value": "CASH" }
    ]
  }
}

User: "Lưu địa chỉ Chợ Bến Thành vào danh sách yêu thích của tôi"
Output:
{
  "success": true,
  "response_type": "ACTION",
  "message": "Đang thêm Chợ Bến Thành vào địa điểm yêu thích...",
  "data": {
    "intent": "ADD_FAVORITE_LOCATION",
    "steps": [
      { "cmd": "SET_LOCATION", "value": "Chợ Bến Thành"}
    ]
  }
}

User: "Cho tôi xem mấy chuyến xe tôi đã đi trước đây"
Output:
{
  "success": true,
  "response_type": "ACTION",
  "message": "Đang mở lịch sử chuyến đi của bạn...",
  "data": {
    "intent": "OPEN_TRIP_HISTORY",
    "steps": []
  }
}`;
        try {
            // --- Groq (current) ---
            const completion = await this.groq.chat.completions.create({
                model: this.modelName,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userText }
                ],
                temperature: 0.2,
                max_tokens: 512
            });

            const responseText = completion.choices?.[0]?.message?.content || '';

            // Clean the response (remove markdown code blocks if present)
            let cleanedText = responseText.trim();
            if (cleanedText.startsWith('```json')) {
                cleanedText = cleanedText.replace(/```json\s*/, '').replace(/```\s*$/, '');
            } else if (cleanedText.startsWith('```')) {
                cleanedText = cleanedText.replace(/```\s*/, '').replace(/```\s*$/, '');
            }

            const parsed = JSON.parse(cleanedText);
            
            // Validate the response structure
            if (!parsed.success || !parsed.data || !parsed.data.intent) {
                throw new Error('Invalid AI response structure');
            }

            return parsed;

            // --- Legacy Gemini (commented out, kept for reference) ---
            // const result = await this.model.generateContent({
            //     contents: [{
            //         role: 'user',
            //         parts: [{ text: `${systemPrompt}\n\nUser: ${userText}` }]
            //     }]
            // });
            // const legacyText = result.response.text();
            // let legacyClean = legacyText.trim();
            // if (legacyClean.startsWith('```json')) {
            //     legacyClean = legacyClean.replace(/```json\s*/, '').replace(/```\s*$/, '');
            // } else if (legacyClean.startsWith('```')) {
            //     legacyClean = legacyClean.replace(/```\s*/, '').replace(/```\s*$/, '');
            // }
            // const legacyParsed = JSON.parse(legacyClean);
            // return legacyParsed;
        } catch (error) {
            console.error('AI parsing error:', error.message);
            throw new Error(`Failed to parse user command: ${error.message}`);
        }
    }

    /**
     * Parse various date formats from Firestore or strings
     * @param {any} value - Timestamp, Date, or string
     * @returns {Date|null}
     */
    parseTripDate(value) {
        try {
            if (!value) return null;
            if (value.toDate) return value.toDate(); // Firestore Timestamp
            if (value instanceof Date) return value;
            if (typeof value === 'string') {
                // Normalize common Firestore string format: "January 3, 2026 at 9:56:58 AM UTC+7"
                const cleaned = value
                    .replace(' at ', ' ')
                    .replace(/\u202f/g, ' ')
                    .replace(/UTC\+(\d+)/, '+$1:00');
                const parsed = new Date(cleaned);
                if (!isNaN(parsed.getTime())) return parsed;
            }
            const parsed = new Date(value);
            return isNaN(parsed.getTime()) ? null : parsed;
        } catch (e) {
            return null;
        }
    }

    /**
     * Format date as DD/MM/YYYY HH:mm
     * @param {Date} date
     * @returns {string}
     */
    formatDateTime(date) {
        if (!date) return '';
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
        const hh = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
    }

    /**
     * Format date as DD/MM/YYYY
     * @param {Date} date
     * @returns {string}
     */
    formatDate(date) {
        if (!date) return '';
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    }

    /**
     * Format number to VND string
     * @param {number} amount
     * @returns {string}
     */
    formatCurrency(amount) {
        if (typeof amount !== 'number') return '';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(amount);
    }

    /**
     * Compress trip history into compact lines for LLM prompt
     * @param {Array} trips
     * @returns {string}
     */
    compressTripHistory(trips) {
        return trips.map((trip) => {
            const tripDate = this.parseTripDate(trip.completedAt || trip.createdAt);
            const timeStr = this.formatDateTime(tripDate);
            const vehicle = trip.vehicleType || trip.vehicle_type || trip.vehicle || 'N/A';

            // Support multiple field names + common typos from DB
            const pickup = trip.pickup?.address
                || trip.pickup?.adrress
                || trip.pickupLocation?.address
                || trip.pickupLocation?.name
                || trip.pickup?.name
                || 'Không rõ điểm đón';

            const dropoff = trip.destination?.address
                || trip.destination?.adrress
                || trip.dropoffLocation?.address
                || trip.dropoffLocation?.name
                || trip.destination?.name
                || 'Không rõ điểm đến';

            const price = this.formatCurrency(trip.fare || 0);
            const payment = (trip.paymentMethod || 'UNKNOWN').toUpperCase();

            return `[Date ${timeStr} | ${vehicle} | ${pickup} -> ${dropoff} | ${price} | ${payment}]`;
        }).join('\n');
    }

    /**
     * Build prompt for trip history analysis
     * @param {string} historyText
     * @param {string} currentDate
     * @param {string} userQuestion
     * @returns {string}
     */
    buildHistoryPrompt(historyText, currentDate, userQuestion) {
        return `Bạn là Trợ lý Phân tích Dữ liệu của RideGo. Hôm nay là ngày ${currentDate}.
Dưới đây là lịch sử chuyến đi của người dùng trong 3 tháng qua (tối đa).

### CẤU TRÚC DỮ LIỆU LỊCH SỬ:
[Thời gian (DD/MM/YYYY HH:mm) | Loại xe | Điểm đón -> Điểm đến | Giá tiền | Thanh toán | Trạng thái]

### DỮ LIỆU:
${historyText}

### NHIỆM VỤ:
1. Trả lời các câu hỏi về thống kê (tổng tiền, số chuyến, tháng này đi mấy chuyến), thói quen (giờ hay đi, loại xe hay dùng).
2. Nếu người dùng hỏi về thời gian (hôm qua, tuần trước), hãy đối chiếu với ngày hiện tại (${currentDate}).
3. Nếu không có dữ liệu, hãy trả lời: "Tôi không tìm thấy thông tin chuyến đi nào trong khoảng thời gian này".
4. Câu trả lời cần ngắn gọn, thân thiện và trả về dạng VĂN BẢN THUẦN (TEXT), không trả về JSON.

### CÂU HỎI CỦA NGƯỜI DÙNG:
${userQuestion}`;
    }

    /**
     * Answer user's trip history query using LLM
     * @param {string} userId
     * @param {string} userQuestion
     * @returns {Promise<string>}
     */
    async answerTripHistoryQuery(userId, userQuestion) {
        // Fetch trips: completed in last 3 months
        const now = new Date();

        const recentCompleted = await tripService.getUserCompletedTripsWithinMonths(userId, 3, 200);

        if (recentCompleted.length === 0) {
            return 'Tôi không tìm thấy thông tin chuyến đi nào trong khoảng thời gian này';
        }

        // Limit to avoid long prompts
        const limitedTrips = recentCompleted
            .sort((a, b) => {
                const da = this.parseTripDate(a.completedAt || a.createdAt)?.getTime() || 0;
                const db = this.parseTripDate(b.completedAt || b.createdAt)?.getTime() || 0;
                return db - da;
            })
            .slice(0, 100);

        const historyText = this.compressTripHistory(limitedTrips);
        const currentDateStr = this.formatDate(now);
        const prompt = this.buildHistoryPrompt(historyText, currentDateStr, userQuestion);

        // --- Groq (current) ---
        const completion = await this.groq.chat.completions.create({
            model: this.modelName,
            messages: [
                { role: 'system', content: 'Bạn là Trợ lý Phân tích Dữ liệu của RideGo.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.2,
            max_tokens: 512
        });

        const text = completion.choices?.[0]?.message?.content?.trim();
        return text || 'Tôi không tìm thấy thông tin chuyến đi nào trong khoảng thời gian này';

        // --- Legacy Gemini (commented out, kept for reference) ---
        // const result = await this.model.generateContent({
        //     contents: [{
        //         role: 'user',
        //         parts: [{ text: prompt }]
        //     }]
        // });
        // const legacyText = result.response.text()?.trim();
        // return legacyText || 'Tôi không tìm thấy thông tin chuyến đi nào trong khoảng thời gian này';
    }

    /**
     * Apply default values for BOOK_TRIP commands
     * @param {Object} aiResponse - The response from parseUserCommand
     * @returns {Object} Response with default values applied
     */
    applyDefaultValues(aiResponse) {
        const intent = aiResponse.data?.intent;
        const steps = aiResponse.data?.steps || [];

        // Only apply defaults for BOOK_TRIP
        if (intent !== 'BOOK_TRIP') {
            return aiResponse;
        }

        // Check if SET_VEHICLE exists
        const hasVehicle = steps.some(step => step.cmd === 'SET_VEHICLE');
        
        // Check if SET_PAYMENT_METHOD exists
        const hasPayment = steps.some(step => step.cmd === 'SET_PAYMENT_METHOD');

        // Add defaults if missing
        const enhancedSteps = [...steps];
        
        if (!hasVehicle) {
            enhancedSteps.push({
                cmd: 'SET_VEHICLE',
                value: 'MOTORBIKE'
            });
        }

        if (!hasPayment) {
            enhancedSteps.push({
                cmd: 'SET_PAYMENT_METHOD',
                value: 'WALLET'
            });
        }

        return {
            ...aiResponse,
            data: {
                ...aiResponse.data,
                steps: enhancedSteps
            }
        };
    }

    /**
     * Process the AI response and add geocoding for location-based commands
     * @param {Object} aiResponse - The response from parseUserCommand
     * @returns {Promise<Object>} Enhanced response with coordinates
     */
    async enhanceWithCoordinates(aiResponse) {
        const intent = aiResponse.data?.intent;
        const steps = aiResponse.data?.steps || [];

        // Only process for BOOK_TRIP and ADD_FAVORITE_LOCATION
        if (intent !== 'BOOK_TRIP' && intent !== 'ADD_FAVORITE_LOCATION') {
            return aiResponse;
        }

        // Find location-based commands and add coordinates
        const enhancedSteps = await Promise.all(
            steps.map(async (step) => {
                const needsGeocoding = 
                    step.cmd === 'SET_DESTINATION' || 
                    step.cmd === 'SET_LOCATION';

                if (needsGeocoding && step.value) {
                    try {
                        const coords = await this.geocodeLocation(step.value);
                        return {
                            ...step,
                            lat: coords.lat,
                            lng: coords.lng
                        };
                    } catch (error) {
                        console.error(`Failed to geocode "${step.value}":`, error.message);
                        // Return step without coordinates if geocoding fails
                        return step;
                    }
                }

                return step;
            })
        );

        return {
            ...aiResponse,
            data: {
                ...aiResponse.data,
                steps: enhancedSteps
            }
        };
    }

    /**
     * Main method to process user command - combines parsing, defaults, and geocoding
     * @param {string} userText - User's command text
     * @returns {Promise<Object>} Complete response with intent, steps, and coordinates
     */
    async processCommand(userText) {
        try {
            // Step 1: Parse user intent
            const aiResponse = await this.parseUserCommand(userText);
            
            // Step 2: Apply default values (MOTORBIKE and WALLET for BOOK_TRIP)
            const responseWithDefaults = this.applyDefaultValues(aiResponse);
            
            // Step 3: Add coordinates for location-based commands
            const enhancedResponse = await this.enhanceWithCoordinates(responseWithDefaults);
            
            return enhancedResponse;
        } catch (error) {
            console.error('Command processing error:', error.message);
            
            // Return error response
            return {
                success: false,
                response_type: "ERROR",
                message: "Xin lỗi, tôi không hiểu yêu cầu của bạn. Vui lòng thử lại.",
                error: error.message
            };
        }
    }
}

export default new AIService();
