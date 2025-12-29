import authService from '../services/authService.js';

export const register = async (req, res) => {
    try {
        const { email, password, name, phone, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const newUser = await authService.registerUser({
            email, password, name, phone, role
        });

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

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const user = await authService.loginUser(email, password);

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