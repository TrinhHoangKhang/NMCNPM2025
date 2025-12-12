const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Mocks
jest.mock('../config/db', () => jest.fn()); // Disable real DB connection
jest.mock('../models/User');
jest.mock('../models/Driver');
jest.mock('../middleware/authMiddleware', () => ({
    protect: (req, res, next) => {
        // Mock authenticated user
        req.user = { _id: 'mockUserId', role: 'rider' };
        next();
    },
    authorize: (...roles) => (req, res, next) => next()
}));

const app = require('../app');
const Driver = require('../models/Driver');
const User = require('../models/User');

describe('Server Integration Tests (Mocked DB)', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // 1. Health Check
    it('GET / should return 200 and active status', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toEqual('active');
    });

    // 2. Driver Registration Test
    it('POST /api/drivers should create a driver profile', async () => {
        // Mock Driver.findOne to return null (not existing)
        Driver.findOne.mockResolvedValue(null);
        // Mock Driver.create to return new driver
        Driver.create.mockResolvedValue({
            _id: 'newDriverId',
            vehicle: { make: 'Toyota', model: 'Camry' },
            currentLocation: { type: 'Point', coordinates: [0, 0] }
        });
        // Mock User update
        User.findByIdAndUpdate.mockResolvedValue({});

        const res = await request(app)
            .post('/api/drivers')
            .send({
                vehicle: { make: 'Toyota', model: 'Camry', plate: 'TEST-123', color: 'White', type: 'standard' },
                currentLocation: { type: 'Point', coordinates: [0, 0] }
            });

        expect(res.statusCode).toEqual(200);
        expect(Driver.create).toHaveBeenCalled();
        expect(User.findByIdAndUpdate).toHaveBeenCalledWith('mockUserId', { role: 'driver' });
    });

    // 3. Nearby Drivers Test
    it('GET /api/drivers/nearby should return list of drivers', async () => {
        // Mock Driver.find chain
        const mockDrivers = [{
            _id: 'd1',
            user: { _id: 'u1', realName: 'John Doe' },
            currentLocation: { coordinates: [-122.4, 37.7] },
            vehicle: { type: 'standard' }
        }];

        // Mocking chainable methods: find -> limit -> populate
        const mockPopulate = jest.fn().mockResolvedValue(mockDrivers);
        const mockLimit = jest.fn().mockReturnValue({ populate: mockPopulate });
        Driver.find.mockReturnValue({ limit: mockLimit });

        const res = await request(app).get('/api/drivers/nearby?lat=37.7&lng=-122.4');

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body[0].name).toEqual('John Doe');
    });

    afterAll(async () => {
        await mongoose.disconnect(); // Just in case
    });
});
