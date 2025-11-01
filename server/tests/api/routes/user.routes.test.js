const request = require('supertest'); // A library to make fake HTTP requests
const app = require('../../src/index'); // Import your entire Express app
const mongoose = require('mongoose');
const User = require('../../src/api/models/user.model');

describe('API: /api/users', () => {
    
    // Connect to a special test database before any tests run
    beforeAll(async () => {
        await mongoose.connect(process.env.TEST_DATABASE_URL);
    });

    // Clear the test database after each test
    afterEach(async () => {
        await User.deleteMany({});
    });

    // Disconnect from the database after all tests are done
    afterAll(async () => {
        await mongoose.connection.close();
    });


    describe('POST /api/users/register', () => {
        test('should register a new user successfully with valid data', async () => {
            const validUserData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            };

            // 1. Make a REAL HTTP request to the running app
            const response = await request(app)
                .post('/api/users/register')
                .send(validUserData);

            // 2. Check the HTTP response
            expect(response.statusCode).toBe(201);
            expect(response.body.user.username).toBe('testuser');

            // 3. Check the DATABASE to be 100% sure
            const dbUser = await User.findOne({ email: 'test@example.com' });
            expect(dbUser).not.toBeNull();
            expect(dbUser.username).toBe('testuser');
        });

        test('should return 400 if email is missing', async () => {
            const invalidUserData = { username: 'testuser', password: 'password123' };

            const response = await request(app)
                .post('/api/users/register')
                .send(invalidUserData);

            // Check that the error response is correct
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe('All fields are required');
        });
    });
});