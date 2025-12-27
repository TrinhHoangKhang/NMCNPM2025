import * as authService from './authService.js';

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

export const registerTraditional = async (req, res) => {
    try {
        const { email, password, name, phone, role } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: "Missing required fields (email, password, name)" });
        }

        const newUser = await authService.registerUserTraditional({
            email, password, name, phone, role
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: newUser
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const loginTraditional = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and Password are required" });
        }

        const user = await authService.loginUserTraditional(email, password);

        res.status(200).json({
            success: true,
            message: "Login successful",
            idToken: user.idToken,
            user: {
                id: user.uid,
                name: user.name,
                role: user.role
            }
        });

    } catch (error) {
        const statusCode = error.message === "INVALID_LOGIN" ? 401 : 500;
        res.status(statusCode).json({
            success: false,
            error: error.message === "INVALID_LOGIN" ? "Invalid email or password" : error.message
        });
    }
};