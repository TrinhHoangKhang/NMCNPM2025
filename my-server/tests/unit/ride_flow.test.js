
import { jest } from '@jest/globals';
import request from 'supertest';

// 1. MOCK SETUP
// We need to mock dependencies BEFORE importing app
const mockDbState = new Map(); // Simulates Firestore
const mockSocketEmit = jest.fn();
const mockSocketTo = jest.fn(() => ({
    emit: mockSocketEmit,
    socketsLeave: jest.fn()
}));
const mockIo = {
    to: mockSocketTo,
    emit: mockSocketEmit,
    in: mockSocketTo, // Alias for 'to' often used
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

// Mock Firebase
jest.unstable_mockModule('../../src/config/firebaseConfig.js', () => ({
    admin: {
        auth: () => ({
            verifyIdToken: jest.fn(async (token) => {
                if (token === 'rider-token') return { uid: 'rider123', email: 'rider@test.com', role: 'RIDER' };
                if (token === 'driver-token') return { uid: 'driver123', email: 'driver@test.com', role: 'DRIVER' };
                throw new Error('Invalid token');
            }),
            getUser: jest.fn(),
        }),
        messaging: () => ({ send: jest.fn() }),
        firestore: {
            FieldValue: {
                increment: jest.fn()
            }
        }
    },
    // Stateful Firestore Mock
    db: {
        collection: (colName) => ({
            doc: (docId) => {
                const id = docId || 'auto_gen_id_' + Date.now();
                return {
                    id: id,
                    set: jest.fn(async (data, opts) => {
                        // console.log(`[MOCK DB] SET ${colName}/${id}`, data);
                        const existing = mockDbState.get(`${colName}/${id}`) || {};
                        const merged = opts?.merge ? { ...existing, ...data } : data;
                        merged.id = id;
                        mockDbState.set(`${colName}/${id}`, merged);
                    }),
                    update: jest.fn(async (data) => {
                        // console.log(`[MOCK DB] UPDATE ${colName}/${id}`, data);
                        const key = `${colName}/${id}`;
                        if (!mockDbState.has(key)) throw new Error(`Doc ${key} not found`);
                        const existing = mockDbState.get(key);
                        const updated = { ...existing, ...data };
                        mockDbState.set(key, updated);
                    }),
                    get: jest.fn(async () => {
                        // console.log(`[MOCK DB] GET ${colName}/${id}`);
                        const data = mockDbState.get(`${colName}/${id}`);
                        return {
                            exists: !!data,
                            data: () => data,
                            id: id
                        };
                    })
                };
            },
            where: () => {
                const queryMock = {
                    where: () => queryMock,
                    limit: () => queryMock,
                    orderBy: () => queryMock,
                    get: jest.fn(async () => ({ empty: true, docs: [] }))
                };
                return queryMock;
            },
            add: jest.fn(async (data) => {
                const id = 'trip_' + Date.now();
                mockDbState.set(`${colName}/${id}`, { id, ...data });
                return { id, get: async () => ({ id, data: () => ({ id, ...data }) }) };
            })
        })
    }
}));

// Mock Driver Service (available driver)
jest.unstable_mockModule('../../src/services/driverService.js', () => ({
    default: {
        getDriver: jest.fn(async (id) => ({
            uid: id,
            vehicle: { type: 'MOTORBIKE', plate: 'TEST-PLATE' },
            status: 'ONLINE'
        })),
        updateStatus: jest.fn()
    }
}));

// Mock Maps (return distinct values)
jest.unstable_mockModule('../../src/services/mapsService.js', () => ({
    default: {
        calculateRoute: jest.fn(async () => ({
            distance: { value: 5000, text: '5 km' },
            duration: { value: 600, text: '10 mins' },
            geometry: { coordinates: [] }
        }))
    }
}));

// Mock Ranking Service
jest.unstable_mockModule('../../src/services/rankingService.js', () => ({
    default: {
        updateScore: jest.fn()
    }
}));

// Mock Presence (sockets)
jest.unstable_mockModule('../../src/services/presenceService.js', () => ({
    default: {
        getUserSocketIds: jest.fn(async () => ['socket_123']),
        addUserSocket: jest.fn()
    }
}));

// Import App after mocks
const app = (await import('../../src/app.js')).default;
app.set('socketio', mockIo); // Inject mock IO

describe('Order Ride Flow Acceptance', () => {

    beforeEach(() => {
        mockDbState.clear();
        mockSocketEmit.mockClear();
        // Setup initial user data
        mockDbState.set('users/rider123', { uid: 'rider123', email: 'rider@test.com', role: 'RIDER', name: 'Rider User' });
        mockDbState.set('users/driver123', { uid: 'driver123', email: 'driver@test.com', role: 'DRIVER', name: 'Driver User' });
        mockDbState.set('drivers/driver123', {
            uid: 'driver123',
            email: 'driver@test.com',
            role: 'DRIVER',
            name: 'Driver User',
            vehicle: { type: 'MOTORBIKE', plate: 'TEST-PLATE' },
            rating: 5.0,
            status: 'ONLINE'
        });
    });

    it('Scenario 1: Complete Flow (Request -> Accept -> Complete) and Verify Data', async () => {
        // --- STEP 1: RIDER REQUESTS TRIP ---
        const tripData = {
            pickupLocation: { lat: 10.762, lng: 106.660, address: "Home" },
            dropoffLocation: { lat: 10.776, lng: 106.700, address: "Work" },
            vehicleType: "MOTORBIKE",
            paymentMethod: "CASH"
        };

        const reqRes = await request(app)
            .post('/api/trips/request')
            .set('Authorization', 'Bearer rider-token') // Mocked to be rider123
            .send(tripData);

        expect(reqRes.statusCode).toBe(201);
        const tripId = reqRes.body.id;
        expect(tripId).toBeDefined();

        // Verify DB State after Request
        expect(mockDbState.has(`trips/${tripId}`)).toBe(true);
        const tripAfterReq = mockDbState.get(`trips/${tripId}`);
        expect(tripAfterReq.status).toBe('REQUESTED');
        expect(tripAfterReq.riderId).toBe('rider123');
        expect(tripAfterReq.fare).toBeGreaterThan(0);

        // Verify Socket Broadcast to "drivers" room
        expect(mockSocketTo).toHaveBeenCalledWith('drivers');
        expect(mockSocketEmit).toHaveBeenCalledWith('new_ride_request', expect.objectContaining({
            id: tripId,
            vehicleType: 'MOTORBIKE'
        }));


        // --- STEP 2: DRIVER ACCEPTS TRIP ---
        const acceptRes = await request(app)
            .patch(`/api/trips/${tripId}/accept`)
            .set('Authorization', 'Bearer driver-token') // Mocked to be driver123
            .send({});

        expect(acceptRes.statusCode).toBe(200);

        // Verify DB State after Accept
        const tripAfterAccept = mockDbState.get(`trips/${tripId}`);
        expect(tripAfterAccept.status).toBe('ACCEPTED');
        expect(tripAfterAccept.driverId).toBe('driver123');

        // Verify Socket Notification to Rider
        // We know mockPresense returns ['socket_123'] for any user
        expect(mockSocketEmit).toHaveBeenCalledWith('trip_accepted', expect.anything());


        // --- STEP 3: DRIVER COMPLETES TRIP ---
        const completeRes = await request(app)
            .patch(`/api/trips/${tripId}/complete`)
            .set('Authorization', 'Bearer driver-token')
            .send({ cashCollected: true });

        expect(completeRes.statusCode).toBe(200);


        // --- STEP 4: FINAL DATA VERIFICATION ---
        const finalTrip = mockDbState.get(`trips/${tripId}`);

        // "Check if that trip data in database and has enough field"
        const requiredFields = [
            'id', 'riderId', 'driverId', 'pickupLocation', 'dropoffLocation',
            'vehicleType', 'status', 'fare', 'distance', 'duration',
            'createdAt', 'acceptedAt', 'completedAt', 'paymentStatus'
        ];

        requiredFields.forEach(field => {
            if (finalTrip[field] === undefined || finalTrip[field] === null) {
                console.error(`Missing Field: ${field}`, finalTrip);
            }
            expect(finalTrip[field]).toBeDefined();
        });

        expect(finalTrip.status).toBe('COMPLETED');
        expect(finalTrip.paymentStatus).toBe('PAID');
        // Ensure geometry is saved
        expect(finalTrip.path).toBeDefined();
    });

    it('Scenario 2: Abandon/Cancel Flow', async () => {
        // 1. Create
        const reqRes = await request(app)
            .post('/api/trips/request')
            .set('Authorization', 'Bearer rider-token')
            .send({
                pickupLocation: { lat: 10, lng: 10, address: "A" },
                dropoffLocation: { lat: 11, lng: 11, address: "B" },
                vehicleType: "MOTORBIKE",
                paymentMethod: "CASH"
            });
        const tripId = reqRes.body.id;

        // 2. Accept
        await request(app).patch(`/api/trips/${tripId}/accept`).set('Authorization', 'Bearer driver-token');

        // 3. Cancel (by Rider)
        const cancelRes = await request(app)
            .patch('/api/trips/cancel')
            .set('Authorization', 'Bearer rider-token')
            .send({ tripId }); // Specific trip ID

        expect(cancelRes.statusCode).toBe(200);

        // 4. Verify Final State
        const finalTrip = mockDbState.get(`trips/${tripId}`);
        expect(finalTrip.status).toBe('CANCELLED');
        expect(finalTrip.cancelledBy).toBe('rider123');
    });

});
