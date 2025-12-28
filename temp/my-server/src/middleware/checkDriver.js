// Middleware to check if user is a DRIVER
module.exports = (req, res, next) => {
    try {
        const user = req.user || {};
        
        if (user.role !== 'DRIVER') {
            return res.status(403).json({ message: "Access denied. Driver role required." });
        }

        next();
    } catch (error) {
        return res.status(500).json({ message: "Authorization error" });
    }
};
