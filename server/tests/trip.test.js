import { jest } from '@jest/globals';
import request from 'supertest';

// 1. Mock the modules BEFORE importing them
jest.unstable_mockModule('../src/modules/maps/mapsService.js', () => ({
    default: {
        calculateRoute: jest.fn(),
        getDistanceMatrix: jest.fn(),
    },
}));

// Create state to hold mock data
let mockTripStatus = 'REQUESTED';

const queryMock = {
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({ empty: true, docs: [] })
};

jest.unstable_mockModule('../src/core/loaders/firebaseLoader.js', () => ({
    admin: {
        auth: () => ({
            verifyIdToken: jest.fn(async (token) => {
                if (token.includes('driver-token')) return { uid: 'driver123', email: 'driver@example.com', role: 'DRIVER' };
                return { uid: 'user123', email: 'test@example.com', role: 'RIDER' };
            }),
            getUser: jest.fn().mockResolvedValue({ uid: 'user123', email: 'test@example.com' }),
        }),
    },
    db: {
        collection: (coll) => ({
            doc: (id) => ({
                set: jest.fn(),
                get: jest.fn(async () => ({
                    exists: true,
                    data: () => ({
                        role: (coll === 'drivers' || id === 'driver123') ? 'DRIVER' : 'RIDER',
                        status: mockTripStatus
                    })
                })),
                update: jest.fn(async (updateData) => {
                    if (updateData.status) mockTripStatus = updateData.status;
                })
            }),
            where: () => queryMock,
            orderBy: () => queryMock,
            limit: () => queryMock,
            get: () => queryMock.get(),
            add: jest.fn().mockResolvedValue({ id: 'mock-trip-id' })
        })
    }
}));

// 2. Dynamically import after mocking
const { default: mapsService } = await import('../src/modules/maps/mapsService.js');
const { default: app } = await import('../src/app.js');

describe('Trip API', () => {

    describe('POST /api/rides/request', () => {
        it('should create a trip with calculated fare', async () => {
            // Mock Maps API response
            mapsService.calculateRoute.mockResolvedValue({
                distance: { text: "10 km", value: 10000 },
                duration: { text: "20 mins", value: 1200 }, // 20 mins
                geometry: "some-geometry"
            });

            const res = await request(app)
                .post('/api/rides/request')
                .set('Authorization', 'Bearer user-token')
                .send({
                    riderId: "user123",
                    pickupLocation: { lat: 10, lng: 10 },
                    dropoffLocation: { lat: 11, lng: 11 },
                    vehicleType: "4 SEAT",
                    paymentMethod: "CASH"
                });

            if (res.statusCode !== 201) {
                console.log("RESPONSE BODY:", JSON.stringify(res.body));
            }

            expect(res.statusCode).toBe(201);
            expect(res.body.fare).toBe(12.00);
        });
    });

    describe('PUT /api/rides/:id/accept', () => {
        it('should allow driver to accept trip', async () => {
            mockTripStatus = 'REQUESTED'; // Reset for this test
            const res = await request(app)
                .put('/api/rides/trip123/accept')
                .set('Authorization', 'Bearer driver-token')
                .send({ driverId: "driver123" });

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe("ACCEPTED");
        });
    });

});
