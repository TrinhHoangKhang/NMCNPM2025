import * as authService from './authService.js';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
    try {
        const { idToken, name, phone, role } = req.body;

        if (!idToken || !name) {
            return res.status(400).json({ error: "Missing required fields (idToken, name)" });
        }

        // Verify the token to get the UID and Email
        const newUser = await authService.registerUserSync({
            idToken, name, phone, role
        });

        res.status(201).json({
            success: true,
            message: "User profile created successfully",
            data: newUser
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const login = async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ error: "ID Token is required" });
        }

        const user = await authService.verifyAndFetchProfile(idToken);

        res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user.uid,
                name: user.name,
                role: user.role
            }
        });

    } catch (error) {
        const statusCode = error.message === "USER_NOT_FOUND" ? 404 : 401;
        res.status(statusCode).json({
            success: false,
            error: error.message
        });
    }
};


export const googleCallback = async (req, res) => {
    // 1. Get the user data (from your previous Google Auth step)
    const user = req.user;

    // 2. Create the Payload (What info do you want inside the token?)
    // Keep it small! Don't put the whole user history here.
    const payload = {
        userId: user.uid,
        email: user.email,
        role: "DRIVER" // or "RIDER"
    };

    // 3. Sign the Token
    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '7d' } // Token dies in 7 days
    );

    // 4. Send it to the Mobile App
    res.status(200).json({
        success: true,
        token: token,
        message: "Login successful"
    });
};