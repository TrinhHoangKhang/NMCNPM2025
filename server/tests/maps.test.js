const request = require('supertest');
const app = require('../src/app');
const mapsService = require('../src/services/mapsService');

jest.mock('../src/services/mapsService');

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
