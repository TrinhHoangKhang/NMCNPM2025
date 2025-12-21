const authService = require('../services/authService');
const jwt = require('jsonwebtoken'); // You need: npm install jsonwebtoken

exports.register = async (req, res) => {
    try {
        // 1. Get data from the Mobile App
        const { email, password, name, phone, role } = req.body;

        // 2. Simple Validation
        if (!email || !password || !name) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // 3. Call the Service
        const newUser = await authService.registerUser({
            email, password, name, phone, role
        });

        // 4. Send Success Response
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: newUser
        });

    } catch (error) {
        // Handle specifics like "Email already exists"
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.login = async (req, res) => {
    try {
        // 1. Unpack the request
        const { email, password } = req.body;

        // 2. Validate input
        if (!email || !password) {
            return res.status(400).json({ error: "Email and Password are required" });
        }

        // 3. Call the Service to verify credentials
        // The service returns the User Data if successful
        const user = await authService.loginUser(email, password);

        // 4. Generate your own "Session Token" (JWT)
        // This is the "VIP Pass" the mobile app will use for future requests
        const token = jwt.sign(
            { id: user.uid, role: user.role }, // Payload
            process.env.JWT_SECRET,            // Secret Key (from .env)
            { expiresIn: '7d' }                // Expiration
        );

        // 5. Send Response
        res.status(200).json({
            success: true,
            message: "Login successful",
            token: token,
            user: {
                id: user.uid,
                name: user.name,
                role: user.role
            }
        });

    } catch (error) {
        // Handle Invalid Password vs Server Error
        const statusCode = error.message === "INVALID_LOGIN" ? 401 : 500;

        res.status(statusCode).json({
            success: false,
            error: error.message === "INVALID_LOGIN" ? "Invalid email or password" : error.message
        });
    }
};


exports.googleCallback = async (req, res) => {
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