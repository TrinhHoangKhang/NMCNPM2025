const request = require('supertest');
const app = require('../src/app');
const mapsService = require('../src/services/mapsService');

// Mock specific services
jest.mock('../src/services/mapsService');
jest.mock('../src/config/firebaseConfig', () => ({
    db: {
        collection: () => ({
            doc: () => ({
                set: jest.fn(),
                get: jest.fn().mockResolvedValue({
                    exists: true,
                    data: () => ({ status: 'REQUESTED' })
                }),
                update: jest.fn()
            })
        })
    }
}));

describe('Trip API', () => {

    describe('POST /api/trips/request', () => {
        it('should create a trip with calculated fare', async () => {
            // Mock Maps API response
            mapsService.calculateRoute.mockResolvedValue({
                distance: { text: "10 km", value: 10000 },
                duration: { text: "20 mins", value: 1200 } // 20 mins
            });

            const res = await request(app)
                .post('/api/trips/request')
                .send({
                    riderId: "user123",
                    pickup: { lat: 10, lng: 10 },
                    dropoff: { lat: 11, lng: 11 }
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            // Fare = 2.00 + (10 * 1.00) + (20 * 0.25) = 2 + 10 + 5 = 17.00
            expect(res.body.data.fare).toBe(17.00);
        });
    });

    describe('PATCH /api/trips/:id/accept', () => {
        it('should allow driver to accept trip', async () => {
            const res = await request(app)
                .patch('/api/trips/trip123/accept')
                .send({ driverId: "driver999" });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.status).toBe("ACCEPTED");
        });
    });

});
