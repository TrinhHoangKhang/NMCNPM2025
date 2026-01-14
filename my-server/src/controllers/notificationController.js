import presenceService from '../services/presenceService.js';
import userService from '../services/userService.js';

class NotificationController {

    // POST /api/notifications/send
    async sendNotification(req, res) {
        try {
            const { userId, message, title } = req.body;

            if (!userId || !message) {
                return res.status(400).json({ success: false, error: "userId and message are required" });
            }

            // 1. Verify User Exists
            try {
                await userService.getUser(userId);
            } catch (e) {
                return res.status(404).json({ success: false, error: "User not found" });
            }

            // 2. Get Socket IDs
            const socketIds = await presenceService.getUserSocketIds(userId);

            if (!socketIds || socketIds.length === 0) {
                return res.status(200).json({ success: false, message: "User is offline (no active sockets). Notification not sent." });
            }

            // 3. Emit Event
            const io = req.app.get('socketio');
            if (io) {
                socketIds.forEach(socketId => {
                    io.to(socketId).emit('server_notification', {
                        title: title || "Notification",
                        message: message,
                        timestamp: new Date().toISOString()
                    });
                });
                console.log(`Notification sent to User ${userId} (Sockets: ${socketIds.length})`);
                return res.status(200).json({ success: true, message: "Notification sent successfully" });
            } else {
                return res.status(500).json({ success: false, error: "Socket.IO not initialized" });
            }

        } catch (error) {
            console.error("Send Notification Error:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

export default new NotificationController();
