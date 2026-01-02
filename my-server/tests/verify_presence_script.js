import { io } from "socket.io-client";
import Redis from "ioredis";

const SOCKET_URL = "http://localhost:3001";
const REDIS_URL = "redis://localhost:6379";

// Mock User Token (JWT) - You might need a valid token if auth is enforced.
// For now, I'll assume I can bypass or need to generate one.
// Validating tokens requires a secret. The server uses 'admin' from firebase-admin or jwt.decode in dev.
// In dev mode (server.js line 36), it decodes without verification if verify fails?
// "DEV MODE: Decoding socket token without verification..."
// So I can just sign a dummy token if I know the structure.
// Or effectively just pass { sub: 'test-user', email: 'test@example.com' } in a non-verified way?
// Actually the server tries `admin.auth().verifyIdToken`. If that fails, AND dev mode, it does `jwt.decode`.
// So I can pass a fake JWT.

const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJ0ZXN0LXVzZXItMTIzIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIn0.signature";

async function verify() {
    console.log("Starting Verification...");

    // 1. Connect Redis
    const redis = new Redis(REDIS_URL);

    // 2. Connect Socket
    const socket = io(SOCKET_URL, {
        auth: { token: fakeToken }
    });

    socket.on("connect", async () => {
        console.log("Socket connected:", socket.id);

        // Allow time for server to process connection (SADD)
        await new Promise(r => setTimeout(r, 1000));

        // Check SADD
        const isMember = await redis.sismember("user_sockets:test-user-123", socket.id);
        console.log(`Redis SADD Check (Socket in set): ${isMember === 1 ? 'PASS' : 'FAIL'}`);

        // Check Initial Presence (from connection)
        const presence = await redis.get("user_presence:test-user-123");
        console.log(`Redis Initial Presence Check: ${presence === 'online' ? 'PASS' : 'FAIL'}`);

        // 3. Send Heartbeat
        console.log("Sending Heartbeat...");
        socket.emit("heartbeat");

        // Wait bit
        await new Promise(r => setTimeout(r, 500));

        // TTL Check
        const ttl = await redis.ttl("user_presence:test-user-123");
        console.log(`Redis TTL Check (Should be ~35): ${ttl}s`);

        // 4. Disconnect
        socket.disconnect();
        await new Promise(r => setTimeout(r, 1000));

        // Check SREM
        const isMemberAfter = await redis.sismember("user_sockets:test-user-123", socket.id);
        console.log(`Redis SREM Check (Socket removed): ${isMemberAfter === 0 ? 'PASS' : 'FAIL'}`);

        redis.disconnect();
        process.exit(0);
    });

    socket.on("connect_error", (err) => {
        console.error("Connection Error:", err.message);
        redis.disconnect();
        process.exit(1);
    });
}

verify();
