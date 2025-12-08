const request = require('supertest');
const app = require('../app');
const driverService = require('../src/services/driverService');

// Mock the Service to avoid calling real Firebase
jest.mock('../src/services/driverService');

describe('Driver API', () => {

    describe('GET /api/drivers/:id', () => {
        it('should return driver data when found', async () => {
            const mockDriver = { name: "Test Driver", status: "OFFLINE" };
            driverService.getDriver.mockResolvedValue(mockDriver);

            const res = await request(app).get('/api/drivers/driver123');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toEqual(mockDriver);
        });

        it('should return 404 if driver not found', async () => {
            driverService.getDriver.mockRejectedValue(new Error("Driver not found"));

            const res = await request(app).get('/api/drivers/unknown');
            expect(res.statusCode).toBe(404);
            expect(res.body.error).toBe("Driver not found");
        });
    });

    describe('PATCH /api/drivers/:id/status', () => {
        it('should update status successfully', async () => {
            driverService.updateStatus.mockResolvedValue({ success: true, status: "ONLINE" });

            const res = await request(app).patch('/api/drivers/driver123/status').send({ status: "ONLINE" });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.status).toBe("ONLINE");
        });
    });
});
