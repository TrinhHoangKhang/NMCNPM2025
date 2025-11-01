const jwt = require('jsonwebtoken');
const config = require('../config');

const checkAuth = (req, res, next) => {
    try {
        // Get token from "Bearer TOKEN_STRING"
        const token = req.headers.authorization.split(' ')[1];
        
        // Verify the token
        const decodedUser = jwt.verify(token, config.jwt.secret);
        
        // IMPORTANT: Attach user data to the request
        req.user = decodedUser; 
        
        // User is valid, proceed to the controller
        next(); 
    } catch (error) {
        // Token is missing or invalid
        return res.status(401).json({ message: 'Authentication failed' });
    }
};

module.exports = { checkAuth };