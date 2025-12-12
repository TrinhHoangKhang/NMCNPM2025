const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Trip = require('../models/Trip');
const Driver = require('../models/Driver');

describe('Ride Endpoints', () => {
    let riderToken, driverToken, riderId, driverId, riderUser, driverUser;

    beforeAll(async () => {
        // Register Rider
        riderUser = {
            username: 'Rider User',
            email: 'rider@test.com',
            password: 'password123',
            phone: '1111111111',
            role: 'rider'
        };
        const riderRes = await request(app).post('/api/auth/register').send(riderUser);
        riderToken = riderRes.body.token;
        riderId = riderRes.body._id;

        // Register Driver
        driverUser = {
            username: 'Driver User',
            email: 'driver@test.com',
            password: 'password123',
            phone: '2222222222',
            role: 'driver'
        };
        const driverRes = await request(app).post('/api/auth/register').send(driverUser);
        driverToken = driverRes.body.token;
        driverId = driverRes.body._id;

        // Create Driver Profile
        // Assuming there is an endpoint or we seed it directly. 
        // Direct seed is safer for "Ride" tests to key isolation.
        await Driver.create({
            user: driverId,
            vehicle: { model: 'Toyota Prius', plate: 'ABC-123', type: 'standard' },
            currentLocation: { type: 'Point', coordinates: [-122.4324, 37.78825] },
            isOnline: true,
            status: 'available'
        });
    });

    afterAll(async () => {
        await User.deleteMany({ email: /@test.com/ });
        await User.deleteMany({ phone: { $in: ['1111111111', '2222222222'] } });
        await Trip.deleteMany({});
        await Driver.deleteMany({ user: driverId });
        await mongoose.connection.close();
    });

    it('should request a ride successfully', async () => {
        const res = await request(app)
            .post('/api/rides/request')
            .set('Authorization', `Bearer ${riderToken}`)
            .send({
                pickupLocation: { type: 'Point', coordinates: [-122.4324, 37.78825] },
                dropoffLocation: { type: 'Point', coordinates: [-122.4000, 37.79000] },
                vehicleType: 'standard',
                distance: 5,
                duration: 15
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.rider).toEqual(riderId);
        expect(res.body.fare).toBeGreaterThan(0);
    });

    it('should accept a ride', async () => {
        // Create trip first
        const trip = await Trip.create({
            rider: riderId,
            pickupLocation: { type: 'Point', coordinates: [-122.4324, 37.78825] },
            dropoffLocation: { type: 'Point', coordinates: [-122.4000, 37.79000] },
            fare: 20,
            distance: 5,
            duration: 15,
            status: 'requested'
        });

        const res = await request(app)
            .post(`/api/rides/${trip._id}/accept`)
            .set('Authorization', `Bearer ${driverToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'accepted');
        expect(res.body.driver).toBeDefined();
    });
});
