
import friendService from '../services/friendService.js';

class FriendController {

    // POST /api/friends/request
    async sendRequest(req, res) {
        try {
            const fromId = req.user.uid;
            const { toEmail } = req.body;

            if (!toEmail) return res.status(400).json({ error: "Email required" });

            const result = await friendService.sendRequest(fromId, toEmail);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // GET /api/friends/requests
    async getPendingRequests(req, res) {
        try {
            const userId = req.user.uid;
            const requests = await friendService.getPendingRequests(userId);
            res.status(200).json(requests);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // PUT /api/friends/requests/:id
    async respondToRequest(req, res) {
        try {
            const userId = req.user.uid;
            const requestId = req.params.id;
            const { action } = req.body; // 'ACCEPT' or 'REJECT'

            if (!['ACCEPT', 'REJECT'].includes(action)) {
                return res.status(400).json({ error: "Action must be ACCEPT or REJECT" });
            }

            const result = await friendService.respondToRequest(requestId, userId, action);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    // GET /api/friends
    async getFriends(req, res) {
        try {
            const userId = req.user.uid;
            const friends = await friendService.getFriends(userId);
            res.status(200).json(friends);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default new FriendController();
