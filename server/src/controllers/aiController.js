import aiService from '../services/aiService.js';

class AIController {
    async generateCommands(req, res) {
        try {
            const { text } = req.body || {};
            if (!text || typeof text !== 'string') {
                return res.status(400).json({ error: 'Missing required field: text' });
            }

            const user = req.user || {};
            const commands = await aiService.generateCommands(text, {
                userId: user.uid,
                role: user.role
            });

            if (!Array.isArray(commands)) {
                return res.status(502).json({ error: 'AI did not return a commands array' });
            }

            return res.status(200).json({ commands });
        } catch (err) {
            return res.status(500).json({ error: err.message || 'AI processing failed' });
        }
    }
}

export default new AIController();