// We import the Service (the "brains")
const userService = require('../../services/user.service');

const registerNewUser = async (req, res, next) => {
    try {
        // 1. Parse Request (and basic validation)
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // 3. Delegate Work to the service
        // The controller DOESN'T know HOW to register a user,
        // it just asks the service to do it.
        const newUser = await userService.registerUser({ username, email, password });

        // 5. Send Response
        return res.status(201).json({ 
            message: "User created successfully", 
            user: newUser 
        });

    } catch (error) {
        // 4. Handle Errors (if the service throws one)
        // (e.g., if the email is already taken)
        return res.status(400).json({ message: error.message });
    }
};

// ... other controller functions like getUserProfile, getUserById ...
module.exports = {
    registerNewUser,
    getUserProfile,
    getUserById
};