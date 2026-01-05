
import { jest } from '@jest/globals';
import request from 'supertest';

// --- MOCKS SETUP ---

const mockDbState = new Map(); // Global DB State
const mockSocketEmit = jest.fn();
const mockSocketTo = jest.fn(() => ({ emit: mockSocketEmit }));
const mockIo = {
    to: mockSocketTo,
    emit: mockSocketEmit,
    in: mockSocketTo,
    sockets: {
        sockets: {
            get: jest.fn(() => ({
                join: jest.fn(),
                emit: mockSocketEmit,
                leave: jest.fn()
            }))
        }
    }
};
// Add missing method to mockSocketTo return value to handle io.in().socketsLeave
mockSocketTo.mockImplementation(() => ({
    emit: mockSocketEmit,
    socketsLeave: jest.fn()
}));

// 1. Mock Firebase
jest.unstable_mockModule('../../src/config/firebaseConfig.js', () => ({
    admin: {
        auth: () => ({
            verifyIdToken: jest.fn(async (token) => {
                // Mock tokens: rider-token-1..5, driver-token-1..5
                if (token.startsWith('rider-token-')) {
                    const id = token.split('rider-token-')[1];
                    return { uid: `rider_${id}`, email: `rider${id}@test.com`, role: 'RIDER' };
                }
                if (token.startsWith('driver-token-')) {
                    const id = token.split('driver-token-')[1];
                    return { uid: `driver_${id}`, email: `driver${id}@test.com`, role: 'DRIVER' };
                }
                throw new Error('Invalid token');
            }),
            getUser: jest.fn(),
        }),
        messaging: () => ({ send: jest.fn() }),
        firestore: { FieldValue: { increment: jest.fn() } }
    },
    db: {
        collection: (colName) => ({
            doc: (docId) => {
                const id = docId || `${colName}_${Date.now()}_${Math.random()}`;
                return {
                    id,
                    set: jest.fn(async (data, opts) => {
                        const existing = mockDbState.get(`${colName}/${id}`) || {};
                        const merged = opts?.merge ? { ...existing, ...data } : data;
                        merged.id = id;
                        mockDbState.set(`${colName}/${id}`, merged);
                    }),
                    update: jest.fn(async (data) => {
                        const key = `${colName}/${id}`;
                        if (!mockDbState.has(key)) throw new Error(`Doc ${key} not found`);
                        const existing = mockDbState.get(key);
                        mockDbState.set(key, { ...existing, ...data });
                    }),
                    get: jest.fn(async () => {
                        const data = mockDbState.get(`${colName}/${id}`);
                        return { exists: !!data, data: () => data, id };
                    })
                };
            },
            where: () => ({
                where: () => ({
                    limit: () => ({
                        get: jest.fn(async () => ({ empty: true, docs: [] }))
                    })
                }),
                get: jest.fn(async () => ({ empty: true, docs: [] }))
            })
        })
    }
}));

// 2. Mock Services
jest.unstable_mockModule('../../src/services/driverService.js', () => ({
    default: {
        getDriver: jest.fn(async (id) => ({
            uid: id,
            vehicle: { type: 'MOTORBIKE', plate: `PLATE-${id}` },
            status: 'ONLINE',
            name: `Driver ${id.split('_')[1]}`
        })),
        updateStatus: jest.fn().mockResolvedValue(true)
    }
}));

jest.unstable_mockModule('../../src/services/mapsService.js', () => ({
    default: {
        calculateRoute: jest.fn(async () => ({
            distance: { value: 5000, text: '5 km' },
            duration: { value: 600, text: '10 mins' },
            geometry: { coordinates: [] }
        }))
    }
}));

jest.unstable_mockModule('../../src/services/rankingService.js', () => ({
    default: { updateScore: jest.fn() }
}));

jest.unstable_mockModule('../../src/services/presenceService.js', () => ({
    default: {
        getUserSocketIds: jest.fn(async () => ['socket_123']),
        addUserSocket: jest.fn()
    }
}));

// Import App
const app = (await import('../../src/app.js')).default;
app.set('socketio', mockIo);

// --- TEST SUITE ---
describe('Concurrency Simulation: 5 Riders & 5 Drivers', () => {

    // Store Trip IDs created during tests
    const tripIds = {};

    beforeAll(() => {
        mockDbState.clear();
        // Setup Users in DB
        for (let i = 1; i <= 5; i++) {
            mockDbState.set(`users/rider_${i}`, { uid: `rider_${i}`, role: 'RIDER', name: `Rider ${i}` });
            // Driver must exist in USERS collection for checkAuth role verification
            mockDbState.set(`users/driver_${i}`, { uid: `driver_${i}`, role: 'DRIVER', name: `Driver ${i}`, email: `driver${i}@test.com` });

            mockDbState.set(`drivers/driver_${i}`, {
                uid: `driver_${i}`,
                role: 'DRIVER',
                name: `Driver ${i}`,
                vehicle: { type: 'MOTORBIKE', plate: `PLATE-driver_${i}` },
                status: 'ONLINE'
            });
        }
    });

    // --- PHASE 1: CREATION (5 Tests) ---
    for (let i = 1; i <= 5; i++) {
        it(`Test ${i}: Rider ${i} creates a trip request`, async () => {
            const res = await request(app)
                .post('/api/trips/request')
                .set('Authorization', `Bearer rider-token-${i}`)
                .send({
                    pickupLocation: { lat: 10, lng: 10, address: "A" },
                    dropoffLocation: { lat: 11, lng: 11, address: "B" },
                    vehicleType: "MOTORBIKE",
                    paymentMethod: "CASH"
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.id).toBeDefined();
            tripIds[i] = res.body.id;

            // Verify DB
            const trip = mockDbState.get(`trips/${tripIds[i]}`);
            expect(trip.status).toBe('REQUESTED');
            expect(trip.riderId).toBe(`rider_${i}`);
        });
    }

    // --- PHASE 2: ACCEPTANCE (5 Tests) ---
    for (let i = 1; i <= 5; i++) {
        it(`Test ${i + 5}: Driver ${i} accepts Trip ${i}`, async () => {
            const tripId = tripIds[i];
            const res = await request(app)
                .patch(`/api/trips/${tripId}/accept`)
                .set('Authorization', `Bearer driver-token-${i}`)
                .send({});

            expect(res.statusCode).toBe(200);

            const trip = mockDbState.get(`trips/${tripId}`);
            expect(trip.status).toBe('ACCEPTED');
            expect(trip.driverId).toBe(`driver_${i}`);
            // Check response body for driverId instead of trip object prop which is not saved to DB
            expect(res.body.driverId).toBe(`driver_${i}`);
        });
    }

    // --- PHASE 3: PICKUP (5 Tests) ---
    for (let i = 1; i <= 5; i++) {
        it(`Test ${i + 10}: Driver ${i} marks Trip ${i} as IN_PROGRESS (Pickup)`, async () => {
            const tripId = tripIds[i];
            const res = await request(app)
                .patch(`/api/trips/${tripId}/pickup`)
                .set('Authorization', `Bearer driver-token-${i}`)
                .send({});

            expect(res.statusCode).toBe(200);

            const trip = mockDbState.get(`trips/${tripId}`);
            expect(trip.status).toBe('IN_PROGRESS');
        });
    }

    // --- PHASE 4: COMPLETION (5 Tests) ---
    for (let i = 1; i <= 5; i++) {
        it(`Test ${i + 15}: Driver ${i} completes Trip ${i}`, async () => {
            const tripId = tripIds[i];
            const res = await request(app)
                .patch(`/api/trips/${tripId}/complete`)
                .set('Authorization', `Bearer driver-token-${i}`)
                .send({ cashCollected: true });

            expect(res.statusCode).toBe(200);

            const trip = mockDbState.get(`trips/${tripId}`);
            expect(trip.status).toBe('COMPLETED');
            expect(trip.paymentStatus).toBe('PAID');
        });
    }

});
