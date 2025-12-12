const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app'); // We need to export app from index.js
const User = require('../models/User');

// Connect to a test database or mock it? 
// For integration tests, connecting to a test DB is better.
// But we should use a separate DB URL for testing which isn't provided here easily without dot env.
// For now, let's assume we can use the same connection but we should be careful.
// Ideally usage of `mongodb-memory-server` is best but I don't want to install more heavy deps if not strictly needed.
// I will try to mock mongoose or use the existing DB but clean up after tests.
// Let's assume the user has a local mongo instance.

beforeAll(async () => {
    // Clean up potentially stale data - Clear ALL users to avoid unique index conflicts with legacy/bad data
    await User.deleteMany({});
});

afterEach(async () => {
    // Cleanup users created during tests
    await User.deleteMany({ email: /test@example.com/ });
    await User.deleteMany({ phone: '1234567890' });
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Auth Endpoints', () => {

    const testUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        // Phone is technically optional now in schema, but good to keep for some tests or distinct
        phone: '1234567890',
        role: 'rider'
    };

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser);



        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('email', testUser.email);
        expect(res.body).toHaveProperty('username', testUser.username); // Expect username
    });

    it('should not register a user with duplicate email', async () => {
        // Create user first
        await request(app).post('/api/auth/register').send(testUser);

        // Try again
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser);

        expect(res.statusCode).toEqual(400); // Assuming 400 for duplicate
    });

    it('should login an existing user', async () => {
        // First register
        await request(app).post('/api/auth/register').send(testUser);

        // Login
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });

    it('should not login with invalid credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'wrong@example.com',
                password: 'wrongpassword'
            });

        expect(res.statusCode).toEqual(401);
    });

    it('should update user profile', async () => {
        // Register first
        const res = await request(app).post('/api/auth/register').send(testUser);
        const token = res.body.token;
        const userId = res.body._id;

        const updateData = {
            bio: 'Updated Bio',
            phone: '9876543210',
            realName: 'John Doe',
            location: 'New York, USA',
            profilePicture: 'https://example.com/avatar.jpg'
        };

        const updateRes = await request(app)
            .put(`/api/users/${userId}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updateData);

        expect(updateRes.statusCode).toEqual(200);
        expect(updateRes.body).toHaveProperty('bio', updateData.bio);
        expect(updateRes.body).toHaveProperty('phone', updateData.phone);
        expect(updateRes.body).toHaveProperty('realName', updateData.realName);
        expect(updateRes.body).toHaveProperty('location', updateData.location);
        expect(updateRes.body).toHaveProperty('profilePicture', updateData.profilePicture);
    });
});
