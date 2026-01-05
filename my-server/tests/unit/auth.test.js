import { jest } from '@jest/globals';

// 1. Mock Auth
const mockAuth = {
    // verifyIdToken: jest.fn(), // Not used in this specific controller flow usually, but good to have
    createUser: jest.fn()
};

// 2. Mock Firestore
const mockFirestore = {
    collection: jest.fn(() => ({
        doc: jest.fn(() => ({
            get: jest.fn(),
            set: jest.fn(),
            update: jest.fn()
        })),
        where: jest.fn(() => ({
            get: jest.fn()
        }))
    }))
};

jest.unstable_mockModule('../../src/config/firebaseConfig.js', () => ({
    admin: {
        auth: () => mockAuth,
        credential: { cert: jest.fn() },
        apps: []
    },
    db: mockFirestore
}));

// 3. Mock Ranking/Redis/Presence to isolate Auth
jest.unstable_mockModule('../../src/services/rankingService.js', () => ({
    default: { updateScore: jest.fn(), getTopDrivers: jest.fn().mockResolvedValue([]) }
}));
jest.unstable_mockModule('../../src/services/presenceService.js', () => ({
    default: { addUserSocket: jest.fn(), removeUserSocket: jest.fn(), isUserOnline: jest.fn() }
}));

// 4. Imports
const { default: request } = await import('supertest');
const { default: app } = await import('../../src/app.js');
const { admin, db } = await import('../../src/config/firebaseConfig.js');

describe('Auth API Unit Tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // =================================================================
    // POST /api/auth/register
    // Global mockSet to track calls across tests
    const mockSet = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockSet.mockReset();
        mockSet.mockResolvedValue({}); // Default success

        // Setup Firestore Mock to always use this mockSet
        // We ensure chain: db.collection() -> doc() -> { set: mockSet, ... }
        db.collection.mockImplementation(() => ({
            doc: jest.fn(() => ({
                set: mockSet,
                get: jest.fn(),
                update: jest.fn()
            })),
            where: jest.fn(() => ({
                get: jest.fn()
            }))
        }));
    });

    describe('POST /api/auth/register', () => {

        // --- SUCCESS CASES ---
        it('1. should register a valid rider successfully', async () => {
            admin.auth().createUser.mockResolvedValue({ uid: 'rider1' });

            const res = await request(app).post('/api/auth/register').send({
                email: 'rider1@test.com', password: 'pass', name: 'Rider One', role: 'RIDER', phone: '111'
            });
            expect(res.statusCode).toBe(201);
            expect(res.body.user.uid).toBe('rider1');
            expect(mockSet).toHaveBeenCalled();
        });

        it('2. should register a valid driver with vehicle', async () => {
            admin.auth().createUser.mockResolvedValue({ uid: 'driver1' });

            const res = await request(app).post('/api/auth/register').send({
                email: 'driver1@test.com', password: 'pass', name: 'Driver One', role: 'DRIVER', phone: '222',
                vehicleType: 'MOTORBIKE', licensePlate: '59-X1'
            });
            expect(res.statusCode).toBe(201);

            // Verify driver collection write includes vehicle
            // mockSet is called twice (users and drivers). Checking "drivers" call.
            expect(mockSet).toHaveBeenCalledWith(
                expect.objectContaining({ vehicle: expect.objectContaining({ type: 'MOTORBIKE' }) }),
                expect.any(Object)
            );
        });

        // --- VALIDATION ERROR CASES ---
        const missingFieldCases = [
            ['email', { password: 'p', name: 'n', role: 'RIDER' }],
            ['password', { email: 'e', name: 'n', role: 'RIDER' }],
            ['name', { email: 'e', password: 'p', role: 'RIDER' }],
            ['role', { email: 'e', password: 'p', name: 'n' }]
        ];
        test.each(missingFieldCases)('3-6. should fail if %s is missing', async (field, payload) => {
            const res = await request(app).post('/api/auth/register').send(payload);
            expect(res.statusCode).toBe(400);
        });

        it('7. should fail if role is invalid', async () => {
            const res = await request(app).post('/api/auth/register').send({
                email: 'e@e.com', password: 'p', name: 'n', role: 'INVALID_ROLE'
            });
            expect(res.statusCode).toBe(400);
        });

        it('8. should fail if driver registers without vehicle details', async () => {
            const res = await request(app).post('/api/auth/register').send({
                email: 'd_bad@t.com', password: 'p', name: 'D Bad', role: 'DRIVER'
            });
            expect(res.statusCode).toBe(400);
        });

        // --- FIREBASE ERROR CASES ---
        it('9. should fail if email already exists (Firebase Auth Error)', async () => {
            admin.auth().createUser.mockRejectedValue({ code: 'auth/email-already-exists', message: 'Exists' });

            const res = await request(app).post('/api/auth/register').send({
                email: 'dup@test.com', password: 'p', name: 'n', role: 'RIDER'
            });
            expect(res.statusCode).toBe(400);
            expect(res.body.error).toMatch(/Exists/);
        });

        it('10. should fail if password is too weak (Firebase Auth Error)', async () => {
            admin.auth().createUser.mockRejectedValue({ code: 'auth/weak-password', message: 'Weak' });

            const res = await request(app).post('/api/auth/register').send({
                email: 'weak@test.com', password: '123', name: 'n', role: 'RIDER'
            });
            expect(res.statusCode).toBe(400);
            expect(res.body.error).toMatch(/Weak/);
        });

        it('11. should fail if Firestore write fails', async () => {
            admin.auth().createUser.mockResolvedValue({ uid: 'fs_fail_user' });
            mockSet.mockRejectedValue(new Error("Firestore Down"));

            const res = await request(app).post('/api/auth/register').send({
                email: 'fs@test.com', password: 'p', name: 'n', role: 'RIDER'
            });
            expect(res.statusCode).toBe(500); // Controller catches generic errors as 500
        });

        it('12. should handle invalid email format (Firebase)', async () => {
            admin.auth().createUser.mockRejectedValue({ code: 'auth/invalid-email', message: 'Bad Email' });
            const res = await request(app).post('/api/auth/register').send({
                email: 'not-an-email', password: 'p', name: 'n', role: 'RIDER'
            });
            expect(res.statusCode).toBe(400);
        });
    });

    // Login Tests would go here...

    // =================================================================
    // POST /api/auth/login
    // =================================================================
    describe('POST /api/auth/login', () => {
        // Need to mock how login works. 
        // Logic: authController -> authService.login -> axios call to Google Identity Toolkit
        // We need to mock AXIOS used in authService if it's imported there.
        // OR mock authService.login directly? 
        // The implementation uses `axios`. We need to mock axios in the import chain.
        // BUT unit tests here are mocking `authService` functions OR we are testing `authController` calling real `authService` calling `axios`.
        // `auth.test.js` imports `authController` indirectly via `app`.
        // We should mock `axios` to simulate Firebase REST API responses.
    });
});
