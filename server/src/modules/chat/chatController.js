import chatService from './chatService.js';

/**
 * Handles chat messages between riders and drivers
 */
export const chat = async (req, res) => {
    // TODO: Implement actual chat routing logic
    res.status(501).json({
        message: "Chat functionality is currently in development.",
        hint: "This module will soon support real-time messaging between riders and drivers."
    });
};
