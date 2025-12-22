// src/services/aiService.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

function extractJsonArray(text) {
    // Strip code fences if present
    let t = text.trim();
    if (t.startsWith('```')) {
        // remove first fence line
        const firstNl = t.indexOf('\n');
        t = t.substring(firstNl + 1);
        // remove ending fence
        const fenceIdx = t.lastIndexOf('```');
        if (fenceIdx !== -1) t = t.substring(0, fenceIdx).trim();
    }
    // Try to find the first [...] block
    const start = t.indexOf('[');
    const end = t.lastIndexOf(']');
    if (start !== -1 && end !== -1 && end > start) {
        t = t.substring(start, end + 1);
    }
    return JSON.parse(t);
}

class AIService {
    constructor() {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not set');
        }
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    }

    async generateCommands(userText, context = {}) {
        const system = `You are an assistant for a ride-hailing app. 
    Return ONLY a compact JSON array of commands with no prose.

    Commands allowed:
    - { "type": "NAVIGATE", "target": "HOME|BOOKING|TRIP_HISTORY|PAYMENT_HISTORY|PROFILE|SETTINGS" }
    - { "type": "SET_DESTINATION", "data": { "name": "..."} }
    - { "type": "SELECT_VEHICLE", "data": "MOTORBIKE|4 SEAT|7 SEAT" } // Default is MOTORBIKE if not specified
    - { "type": "REQUEST_TRIP", "data": { "paymentMethod": "CASH|WALLET" } } //  Defaults to CASH if not specified

    Rules:
    - For history requests (e.g., "Where did I go?", "Past trips"), use NAVIGATE to TRIP_HISTORY.
    - For money/transaction requests (e.g., "Wallet balance", "Payment history"), use NAVIGATE to PAYMENT_HISTORY.
    - For profile/account requests (e.g., "My info", "Show profile"), use NAVIGATE to PROFILE.
    - For booking requests (e.g., "Go to X"), use a sequence: NAVIGATE to BOOKING, then SET_DESTINATION, then SELECT_VEHICLE, then REQUEST_TRIP.
    - Always return an array [] with one or more command objects.
    - Use valid JSON, no comments, no trailing commas, no code fences.`;

        const user = `User: ${userText}`;
        const ctx = context?.userId ? `Context: userId=${context.userId} role=${context.role || ''}` : '';

        const prompt = [system, ctx, user].filter(Boolean).join('\n\n');

        const result = await this.model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }]}] });

        try {
            const raw = result.response.text();
            // Utility to clean AI output if it includes markdown blocks
            const jsonString = raw.replace(/```json|```/g, "").trim();
            const parsed = JSON.parse(jsonString);
            
            if (!Array.isArray(parsed)) throw new Error('AI did not return an array');
            return parsed;
        } catch (e) {
            throw new Error(`Failed to parse AI response as JSON array: ${e.message}`);
        }
    }
}
module.exports = new AIService();