import { jest } from '@jest/globals';
import request from 'supertest';

// 1. Mock the module BEFORE importing it
jest.unstable_mockModule('../src/modules/users/userService.js', () => ({
    default: {
        getUser: jest.fn(),
        updateUser: jest.fn(),
    },
}));

// 2. Dynamically import after mocking
const { default: userService } = await import('../src/modules/users/userService.js');
const { default: app } = await import('../src/app.js');

describe('User API', () => {

    describe('GET /api/users/:id', () => {
        it('should return user data when found', async () => {
            const mockUser = {
                id: "user123",
                name: "Test User",
                email: "test@example.com",
                role: "RIDER"
            };
            userService.getUser.mockResolvedValue(mockUser);

            const res = await request(app).get('/api/users/user123');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toEqual(mockUser);
        });

        it('should return 404 if user not found', async () => {
            userService.getUser.mockRejectedValue(new Error("User not found"));

            const res = await request(app).get('/api/users/unknown');
            expect(res.statusCode).toBe(404);
            expect(res.body.error).toBe("User not found");
        });
    });

    describe('PATCH /api/users/:id', () => {
        it('should update user successfully', async () => {
            const updatedUser = { id: "user123", name: "New Name" };
            userService.updateUser.mockResolvedValue(updatedUser);

            const res = await request(app)
                .patch('/api/users/user123')
                .send({ name: "New Name" });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.name).toBe("New Name");
        });
    });

});
