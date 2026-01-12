
import chatService from '../services/chatService.js';
import presenceService from '../services/presenceService.js';

class ChatController {

    // POST /api/chat/send
    async sendMessage(req, res) {
        try {
            const senderId = req.user.uid;
            const { recipientId, text } = req.body;

            if (!recipientId || !text) {
                return res.status(400).json({ error: "Recipient and text required" });
            }

            const message = await chatService.sendMessage(senderId, recipientId, text);

            // SOCKET EMIT
            const io = req.app.get('socketio');
            if (io) {
                // To Recipient
                const recipientSockets = await presenceService.getUserSocketIds(recipientId);
                recipientSockets.forEach(socketId => {
                    io.to(socketId).emit('receive_message', message);
                });

                // To Sender (for confirmation/multi-device sync)
                const senderSockets = await presenceService.getUserSocketIds(senderId);
                senderSockets.forEach(socketId => {
                    io.to(socketId).emit('message_sent', message);
                });
            }

            res.status(201).json(message);
        } catch (error) {
            console.error("Chat Send Error:", error);
            res.status(400).json({ error: error.message });
        }
    }

    // GET /api/chat/history/:friendId
    async getHistory(req, res) {
        try {
            const userId = req.user.uid;
            const { friendId } = req.params;

            const messages = await chatService.getMessages(userId, friendId);
            res.status(200).json(messages);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default new ChatController();
