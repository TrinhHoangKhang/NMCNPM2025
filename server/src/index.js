import app from './app.js';
import dotenv from 'dotenv';
import http from 'http';
import { initSocket } from './shared/services/socketService.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Clean up: Reset all users to offline on startup
const cleanupPresence = async () => {
    try {
        const { db } = await import('./core/loaders/firebaseLoader.js');
        const usersRef = db.collection('users');
        const onlineUsers = await usersRef.where('is_online', '==', true).get();

        if (!onlineUsers.empty) {
            const batch = db.batch();
            onlineUsers.docs.forEach(doc => {
                batch.update(doc.ref, { is_online: false });
            });
            await batch.commit();
            console.log(`Cleanup: Reset ${onlineUsers.size} users to offline status.`);
        }
    } catch (err) {
        console.error('Cleanup Presence Error:', err.message);
    }
};

// Start the server
server.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    await cleanupPresence();
});
