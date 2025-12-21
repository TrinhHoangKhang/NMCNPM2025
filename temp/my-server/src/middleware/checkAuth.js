const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // 1. Get the Authorization Header
        // Format: "Bearer eyJhbGciOi..."
        const authHeader = req.headers.authorization;

        // 2. Check if header exists
        if (!authHeader) {
            return res.status(401).json({ message: "No token provided" });
        }

        // 3. Extract the token (Remove 'Bearer ' string)
        const token = authHeader.split(" ")[1]; 

        // 4. Verify the Token
        // This checks the signature and expiration date
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // 5. Success! Attach user data to the request
        // Now valid, so we let the controller know WHO this is.
        req.userData = { 
            userId: decodedToken.userId, 
            role: decodedToken.role 
        };

        // 6. Allow request to proceed to the Controller
        next();

    } catch (error) {
        // Token is fake, expired, or malformed
        return res.status(401).json({ message: "Auth failed / Token expired" });
    }
};