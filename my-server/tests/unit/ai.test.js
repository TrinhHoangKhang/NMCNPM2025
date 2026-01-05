import { jest } from '@jest/globals';

// =====================================================
// SET ENVIRONMENT BEFORE IMPORTS
// =====================================================
process.env.GROQ_API_KEY = 'test_groq_key';
process.env.GRAPHHOPPER_API_KEY = 'test_graphhopper_key';

// =====================================================
// SETUP MOCKS
// =====================================================

// Mock Groq API
const mockGroqCreate = jest.fn();
const mockGroq = jest.fn(() => ({
    chat: {
        completions: {
            create: mockGroqCreate
        }
    }
}));

// Mock tripService
const mockGetUserCompletedTripsWithinMonths = jest.fn();

jest.unstable_mockModule('../../src/services/tripService.js', () => ({
    default: {
        getUserCompletedTripsWithinMonths: mockGetUserCompletedTripsWithinMonths
    }
}));

jest.unstable_mockModule('groq-sdk', () => ({
    default: mockGroq
}));

jest.unstable_mockModule('../../src/config/firebaseConfig.js', () => ({
    admin: {},
    db: {}
}));

// ====================================================
// IMPORTS & SETUP
// =====================================================

const { default: aiService } = await import('../../src/services/aiService.js');

// Helper to setup Groq response
const mockGroqResponse = (content) => ({
    choices: [{
        message: { content }
    }]
});

// =====================================================
// TESTS
// =====================================================

describe('AI Service Tests', () => {
    // Suppress console.error during tests
    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterAll(() => {
        console.error.mockRestore();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('parseUserCommand', () => {
        // Test 1: Parse BOOK_TRIP command
        it('should parse BOOK_TRIP command correctly', async () => {
            const aiResponse = {
                success: true,
                response_type: "ACTION",
                message: "Đang chuẩn bị xe...",
                data: {
                    intent: "BOOK_TRIP",
                    steps: [
                        { cmd: "SET_DESTINATION", value: "Sân bay Tân Sơn Nhất" },
                        { cmd: "SET_VEHICLE", value: "4_SEATS" },
                        { cmd: "SET_PAYMENT_METHOD", value: "CASH" }
                    ]
                }
            };

            mockGroqCreate.mockResolvedValueOnce(
                mockGroqResponse(JSON.stringify(aiResponse))
            );

            const result = await aiService.parseUserCommand("Lấy cho tôi ô tô 4 chỗ đi sân bay");

            expect(result.data.intent).toBe('BOOK_TRIP');
            expect(result.data.steps.length).toBeGreaterThan(0);
            expect(result.success).toBe(true);
        });

        // Test 2: Parse ADD_FAVORITE_LOCATION command
        it('should parse ADD_FAVORITE_LOCATION command', async () => {
            const aiResponse = {
                success: true,
                response_type: "ACTION",
                message: "Đang thêm địa điểm yêu thích...",
                data: {
                    intent: "ADD_FAVORITE_LOCATION",
                    steps: [
                        { cmd: "SET_LOCATION", value: "Chợ Bến Thành" }
                    ]
                }
            };

            mockGroqCreate.mockResolvedValueOnce(
                mockGroqResponse(JSON.stringify(aiResponse))
            );

            const result = await aiService.parseUserCommand("Lưu Chợ Bến Thành vào yêu thích");

            expect(result.data.intent).toBe('ADD_FAVORITE_LOCATION');
            expect(result.success).toBe(true);
        });

        // Test 3: Handle invalid response
        it('should throw error on invalid JSON response', async () => {
            mockGroqCreate.mockResolvedValueOnce(
                mockGroqResponse("invalid json")
            );

            await expect(
                aiService.parseUserCommand("Bất cứ lệnh gì")
            ).rejects.toThrow('Failed to parse user command');
        });
    });

    describe('processCommand', () => {
        // Test 4: Process command with defaults
        it('should apply default values for BOOK_TRIP', async () => {
            const aiResponse = {
                success: true,
                response_type: "ACTION",
                message: "Đang chuẩn bị...",
                data: {
                    intent: "BOOK_TRIP",
                    steps: [
                        { cmd: "SET_DESTINATION", value: "Nhà đất" }
                    ]
                }
            };

            mockGroqCreate.mockResolvedValueOnce(
                mockGroqResponse(JSON.stringify(aiResponse))
            );

            const result = await aiService.processCommand("Đi nhà đất");

            expect(result.data.steps.some(s => s.cmd === 'SET_VEHICLE')).toBe(true);
            expect(result.data.steps.some(s => s.cmd === 'SET_PAYMENT_METHOD')).toBe(true);
        });

        // Test 5: Handle processing error gracefully
        it('should handle processing errors', async () => {
            mockGroqCreate.mockRejectedValueOnce(new Error('API Error'));

            const result = await aiService.processCommand("Test command");

            expect(result.success).toBe(false);
            expect(result.response_type).toBe('ERROR');
        });
    });

    describe('answerTripHistoryQuery', () => {
        // Test 6: Answer trip history query
        it('should answer trip history query', async () => {
            const trips = [
                {
                    fare: 100000,
                    vehicleType: 'MOTORBIKE',
                    pickupLocation: { address: 'Điểm A' },
                    dropoffLocation: { address: 'Điểm B' },
                    completedAt: new Date(),
                    paymentMethod: 'CASH'
                }
            ];

            mockGetUserCompletedTripsWithinMonths.mockResolvedValueOnce(trips);
            mockGroqCreate.mockResolvedValueOnce(
                mockGroqResponse("Bạn đã đi 1 chuyến")
            );

            const result = await aiService.answerTripHistoryQuery('user1', 'Tôi đi mấy chuyến?');

            expect(result).toBe("Bạn đã đi 1 chuyến");
        });

        // Test 7: Return message when no trips found
        it('should return no trips message when empty', async () => {
            mockGetUserCompletedTripsWithinMonths.mockResolvedValueOnce([]);

            const result = await aiService.answerTripHistoryQuery('user1', 'Lịch sử?');

            expect(result).toContain('không tìm thấy');
        });
    });

    describe('Utility functions', () => {
        // Test 8: Format currency
        it('should format currency to VND', () => {
            const formatted = aiService.formatCurrency(100000);

            expect(formatted).toContain('100');
        });

        // Test 9: Format date
        it('should format date correctly', () => {
            const date = new Date(2026, 0, 5); // Jan 5, 2026
            const formatted = aiService.formatDate(date);

            expect(formatted).toMatch(/05\/01\/2026/);
        });

        // Test 10: Parse trip date
        it('should parse date from object', () => {
            const date = new Date(2026, 0, 5);
            const parsed = aiService.parseTripDate(date);

            expect(parsed).toEqual(date);
        });
    });
});
