const authService = require('../services/authService');

exports.register = async (req, res) => {
    try {
        // 1. Get data from the Mobile App (Client sends ID Token now)
        const { idToken, name, phone, role } = req.body;

        // 2. Validate
        if (!idToken) {
            return res.status(400).json({ error: "Missing ID Token" });
        }

        // 3. Call the Service
        const newUser = await authService.registerUser({
            idToken, name, phone, role
        });

        // 4. Send Success Response
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: newUser
        });

    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.login = async (req, res) => {
    try {
        // 1. Unpack the request
        const { idToken } = req.body;

        // 2. Validate input
        if (!idToken) {
            return res.status(400).json({ error: "Missing ID Token" });
        }

        // 3. Call the Service to verify token and get user data
        const user = await authService.loginUser(idToken);

        // 4. Send Response
        // Note: We DO NOT mint a new token. The client uses the Firebase ID Token.
        res.status(200).json({
            success: true,
            message: "Login successful",
            user: user
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(401).json({
            success: false,
            error: error.message
        });
    }
};

// Google Callback is likely not needed if the client handles the OAuth flow and sends the ID token.
// Keeping it commented out or removing it if it was for server-side OAuth flow which we are abandoning.
// exports.googleCallback = ...