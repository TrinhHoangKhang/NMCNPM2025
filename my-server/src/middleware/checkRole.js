
export default (allowedRoles = []) => {
    return (req, res, next) => {
        try {
            const user = req.user;

            if (!user) {
                return res.status(401).json({ message: "Authentication required" });
            }

            // ADMIN has access to everything
            if (user.role === 'ADMIN') {
                return next();
            }

            // Check if user's role is in the allowed list
            if (allowedRoles.includes(user.role)) {
                return next();
            }

            return res.status(403).json({
                message: "Access denied. Insufficient permissions.",
                required_roles: allowedRoles,
                current_role: user.role
            });

        } catch (error) {
            console.error("Role Check Middleware Error:", error);
            return res.status(500).json({ message: "Authorization error" });
        }
    };
};
