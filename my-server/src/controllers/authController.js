import authService from '../services/authService.js';

export const register = async (req, res) => {
    try {
        const { email, password, name, phone, role, vehicleType, licensePlate } = req.body;

        // ... (validation logic kept or skipped) ...
        // We need to keep lines 7-9 validation. 

        if (!email || !password || !name || !role) {
            return res.status(400).json({ error: "Email, password, name, and role are required" });
        }

        if (role && !['RIDER', 'DRIVER', 'ADMIN'].includes(role.toUpperCase())) {
            return res.status(400).json({ error: "Invalid role" });
        }

        if (role && role.toUpperCase() === 'DRIVER') {
            if (!vehicleType || !licensePlate) {
                return res.status(400).json({ error: "Driver must provide vehicleType and licensePlate" });
            }
        }

        const newUser = await authService.registerUser({
            email, password, name, phone, role, vehicleType, licensePlate
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: newUser
        });

    } catch (error) {
        console.error("Register Error:", error);

        // Map Firebase Auth Errors to 400
        if (error.code && error.code.startsWith('auth/')) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

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