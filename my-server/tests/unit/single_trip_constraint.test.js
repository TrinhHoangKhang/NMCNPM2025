
import { jest } from '@jest/globals';
import request from 'supertest';

// --- MOCKS SETUP ---

const mockDbState = new Map(); // Global DB State
const mockSocketEmit = jest.fn();
const mockSocketTo = jest.fn(() => ({ emit: mockSocketEmit, socketsLeave: jest.fn() }));
const mockIo = {
    to: mockSocketTo,
    emit: mockSocketEmit,
    in: mockSocketTo,
    sockets: {
        adapter: {
            rooms: {
                get: jest.fn(() => ({ size: 0, has: jest.fn() }))
            }
        },
        sockets: {
            get: jest.fn(() => ({
                join: jest.fn(),
                emit: mockSocketEmit,
                leave: jest.fn()
            }))
        }
    }
};

// 1. Mock Firebase
jest.unstable_mockModule('../../src/config/firebaseConfig.js', () => ({
    admin: {
        auth: () => ({
            verifyIdToken: jest.fn(async (token) => {
                if (token === 'rider-token-1') return { uid: 'rider_1', email: 'rider1@test.com', role: 'RIDER' };
                if (token === 'rider-token-2') return { uid: 'rider_2', email: 'rider2@test.com', role: 'RIDER' };
                if (token === 'driver-token-1') return { uid: 'driver_1', email: 'driver1@test.com', role: 'DRIVER' };
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
            where: (field, op, val) => {
                // VERY BASIC Query Mock for getCurrentTripForUser
                // We need to filter the MockDBState based on params
                // This is checking if active trip matches
                const matches = [];
                for (const [key, value] of mockDbState.entries()) {
                    if (key.startsWith('trips/')) {
                        if (value[field] === val && ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS'].includes(value.status)) {
                            matches.push(value);
                        }
                    }
                }

                return {
                    where: (f2, o2, v2) => {
                        // Chain filtering not perfectly accurate here but enough for "status in list"
                        return {
                            limit: () => ({
                                get: jest.fn(async () => ({
                                    empty: matches.length === 0,
                                    docs: matches.map(m => ({ id: m.id, data: () => m }))
                                }))
                            })
                        };
                    },
                    get: jest.fn(async () => ({
                        empty: matches.length === 0,
                        docs: matches.map(m => ({ id: m.id, data: () => m }))
                    }))
                };
            }
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
describe('Trip Constraint: One Active Trip Limit', () => {

    beforeEach(() => {
        mockDbState.clear();
        // Setup Users
        mockDbState.set(`users/rider_1`, { uid: `rider_1`, role: 'RIDER', name: `Rider 1` });
        mockDbState.set(`users/rider_2`, { uid: `rider_2`, role: 'RIDER', name: `Rider 2` });
        mockDbState.set(`users/driver_1`, { uid: `driver_1`, role: 'DRIVER', name: `Driver 1`, email: 'driver1@test.com' });
        mockDbState.set(`drivers/driver_1`, {
            uid: `driver_1`,
            role: 'DRIVER',
            name: `Driver 1`,
            vehicle: { type: 'MOTORBIKE', plate: `PLATE-driver_1` },
            status: 'ONLINE'
        });
    });

    it('Rider cannot create a trip if they already have one pending/active', async () => {
        // 1. Create Trip A
        const res1 = await request(app)
            .post('/api/trips/request')
            .set('Authorization', 'Bearer rider-token-1')
            .send({
                pickupLocation: { lat: 10, lng: 10, address: "A" },
                dropoffLocation: { lat: 11, lng: 11, address: "B" },
                vehicleType: "MOTORBIKE",
                paymentMethod: "CASH"
            });
        expect(res1.statusCode).toBe(201);
        const tripA = res1.body.id;

        // 2. Try to Create Trip B
        const res2 = await request(app)
            .post('/api/trips/request')
            .set('Authorization', 'Bearer rider-token-1')
            .send({
                pickupLocation: { lat: 20, lng: 20, address: "C" },
                dropoffLocation: { lat: 21, lng: 21, address: "D" },
                vehicleType: "MOTORBIKE",
                paymentMethod: "WALLET"
            });

        // Expect Failure
        expect(res2.statusCode).toBe(400);
        expect(res2.body.error).toMatch(/ongoing trip/i);
    });

    it('Driver cannot accept a trip if they are already on a trip', async () => {
        // 1. Setup: Create Trip A for Rider 1
        const tripAData = {
            id: 'trip_A',
            riderId: 'rider_1',
            status: 'REQUESTED',
            vehicleType: 'MOTORBIKE',
            createdAt: new Date().toISOString()
        };
        mockDbState.set(`trips/${tripAData.id}`, tripAData);

        // 2. Setup: Create Trip B for Rider 2
        const tripBData = {
            id: 'trip_B',
            riderId: 'rider_2',
            status: 'REQUESTED',
            vehicleType: 'MOTORBIKE',
            createdAt: new Date().toISOString()
        };
        mockDbState.set(`trips/${tripBData.id}`, tripBData);

        // 3. Driver accepts Trip A -> Success
        const res1 = await request(app)
            .patch(`/api/trips/${tripAData.id}/accept`)
            .set('Authorization', 'Bearer driver-token-1')
            .send({});

        expect(res1.statusCode).toBe(200);
        expect(mockDbState.get(`trips/${tripAData.id}`).status).toBe('ACCEPTED');

        // 4. Driver attempts to accept Trip B -> Fail
        const res2 = await request(app)
            .patch(`/api/trips/${tripBData.id}/accept`)
            .set('Authorization', 'Bearer driver-token-1')
            .send({});

        // Expect Failure
        expect(res2.statusCode).toBe(400);
        // Note: The specific error message might vary, assuming "ongoing trip" or similar
        // If system is unimplemented, this will fail with 200
        expect(res2.body.error).toBeDefined();
    });

});
