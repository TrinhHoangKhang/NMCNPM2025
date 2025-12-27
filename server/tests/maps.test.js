import { jest } from '@jest/globals';
import request from 'supertest';

// 1. Mock the module BEFORE importing it
jest.unstable_mockModule('../src/modules/maps/mapsService.js', () => ({
    default: {
        calculateRoute: jest.fn(),
    },
}));

// 2. Dynamically import after mocking
const { default: mapsService } = await import('../src/modules/maps/mapsService.js');
const { default: app } = await import('../src/app.js');

describe('Maps API', () => {
    describe('POST /api/maps/calculate-route', () => {
        it('should return distance and duration', async () => {
            const mockResult = {
                distance: { text: "10 km", value: 10000 },
                duration: { text: "15 mins", value: 900 }
            };
            mapsService.calculateRoute.mockResolvedValue(mockResult);

            const res = await request(app)
                .post('/api/maps/calculate-route')
                .send({ origin: "A", destination: "B" });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toEqual(mockResult);
        });

        it('should return 400 if missing parameters', async () => {
            const res = await request(app)
                .post('/api/maps/calculate-route')
                .send({ origin: "A" }); // Missing destination

            expect(res.statusCode).toBe(400);
        });
    });
});
