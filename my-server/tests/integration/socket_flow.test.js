import { jest } from '@jest/globals';
import { io } from "socket.io-client";
import axios from "axios";
import { spawn } from 'child_process';
import path from 'path';

// Increase timeout for integration test
jest.setTimeout(30000);

const PORT = 3009; // Use distinctive port
const BASE_URL = `http://localhost:${PORT}/api`;
const SOCKET_URL = `http://localhost:${PORT}`;

describe('Socket Flow Integration', () => {
    let serverProcess;

    beforeAll(async () => {
        // Start Server in separate process
        // We use a promise to wait for "Server running" log
        return new Promise((resolve, reject) => {
            console.log("Starting Test Server...");
            serverProcess = spawn('node', ['server.js'], {
                cwd: path.resolve(''),
                env: { ...process.env, PORT: PORT, NODE_ENV: 'integration' },
                detached: false
            });

            serverProcess.stdout.on('data', (data) => {
                const str = data.toString();
                // console.log(`[Server]: ${str}`); 
                if (str.includes(`Server running on port ${PORT}`)) {
                    // Give it a second to fully bind
                    setTimeout(resolve, 3000);
                }
            });

            serverProcess.stderr.on('data', (data) => {
                console.error(`[Server Error]: ${data}`);
            });

            serverProcess.on('error', (err) => {
                reject(err);
            });
        });
    });

    afterAll(() => {
        if (serverProcess) {
            console.log("Stopping Test Server...");
            serverProcess.kill();
        }
    });

    const generateUser = (role) => {
        const timestamp = Date.now();
        return {
            email: `test_${role}_${timestamp}@test.com`,
            password: "password123",
            name: `Test ${role}`,
            phone: `09${Math.floor(Math.random() * 100000000)}`,
            role: role.toUpperCase(),
            vehicleType: "MOTORBIKE",
            licensePlate: "TEST-INTEG"
        };
    };

    async function authenticate(user) {
        try {
            await axios.post(`${BASE_URL}/auth/register`, user);
            const res = await axios.post(`${BASE_URL}/auth/login`, {
                email: user.email,
                password: user.password
            });
            const token = res.data.token || res.data.user?.token;
            // Handle structure variations
            const uid = res.data.user?.uid || res.data.data?.uid || (res.data.user ? res.data.user.uid : null);
            return { token, uid };
        } catch (error) {
            console.error(`Auth Error (${user.role}):`, error.response?.data?.message || error.message);
            throw error;
        }
    }

    it('should complete a full ride flow (Request -> Accept -> Complete) with Socket events', async () => {
        // 1. Setup
        const riderData = generateUser("rider");
        const driverData = generateUser("driver");

        const riderAuth = await authenticate(riderData);
        const driverAuth = await authenticate(driverData);

        // 2. Connect Sockets
        const riderSocket = io(SOCKET_URL, {
            auth: { token: riderAuth.token },
            transports: ['websocket'],
            forceNew: true
        });

        const driverSocket = io(SOCKET_URL, {
            auth: { token: driverAuth.token },
            transports: ['websocket'],
            forceNew: true
        });

        await new Promise((resolve) => {
            let connected = 0;
            const check = () => { connected++; if (connected === 2) resolve(); };
            riderSocket.on("connect", check);
            driverSocket.on("connect", check);
        });

        // 3. Request Trip
        const tripRes = await axios.post(`${BASE_URL}/trips/request`, {
            pickupLocation: { lat: 10, lng: 10, address: "A" },
            dropoffLocation: { lat: 11, lng: 11, address: "B" },
            vehicleType: "MOTORBIKE",
            paymentMethod: "CASH"
        }, { headers: { Authorization: `Bearer ${riderAuth.token}` } });

        const tripId = tripRes.data.id || tripRes.data._id;
        expect(tripId).toBeDefined();

        // 4. Listen for Events
        const flightRecorder = [];
        const eventPromise = new Promise((resolve) => {
            let events = 0;
            const checkEvents = () => {
                events++;
                if (events >= 3) resolve();
            };

            riderSocket.on("trip_accepted", (data) => {
                if (data.tripId === tripId) {
                    flightRecorder.push("trip_accepted");
                    checkEvents();
                }
            });

            riderSocket.on("trip_completed", (data) => {
                if (data.tripId === tripId) {
                    flightRecorder.push("rider_completed");
                    checkEvents();
                }
            });

            driverSocket.on("trip_completed", (data) => {
                if (data.tripId === tripId) {
                    flightRecorder.push("driver_completed");
                    checkEvents();
                }
            });

            // Timeout safety
            setTimeout(() => resolve(), 25000);
        });

        // 5. Accept
        await axios.patch(`${BASE_URL}/trips/${tripId}/accept`, {
            driverId: driverAuth.uid,
            vehicleType: "MOTORBIKE"
        }, { headers: { Authorization: `Bearer ${driverAuth.token}` } });

        // 6. Complete
        await new Promise(r => setTimeout(r, 1000));
        await axios.patch(`${BASE_URL}/trips/${tripId}/complete`, {
            driverId: driverAuth.uid
        }, { headers: { Authorization: `Bearer ${driverAuth.token}` } });

        await eventPromise;

        // Note: If Redis is down, these might fail.
        // We add soft assertions or conditional logging if expected to fail in some envs.
        expect(flightRecorder).toContain("trip_accepted");
        expect(flightRecorder).toContain("rider_completed");
        expect(flightRecorder).toContain("driver_completed");

        riderSocket.disconnect();
        driverSocket.disconnect();
    });
});
