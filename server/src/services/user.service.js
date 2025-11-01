// We import the database "blueprint"
const User = require('../api/models/user.model'); 
// We import a helper for password hashing
const bcrypt = require('bcryptjs'); 
// We might import other services
const emailService = require('./email.service');
// A custom error helper
const ApiError = require('../utils/ApiError');

const registerUser = async (userData) => {
    // Service just receives a clean object: { username, email, password }

    // 1. BUSINESS LOGIC: Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
        // Throw an error that the controller will catch
        throw new ApiError(400, 'Email already in use');
    }

    // 2. BUSINESS LOGIC: Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // 3. DATABASE INTERACTION: Create the new user
    const newUser = new User({
        username: userData.username,
        email: userData.email,
        password: hashedPassword // Store the hashed password
    });
    
    // Save to the database
    await newUser.save();
    
    // 4. CALLING ANOTHER SERVICE: Send a welcome email
    // We don't care HOW the email is sent, just that we ask it to be sent.
    await emailService.sendWelcomeEmail(newUser.email, newUser.username);

    // 5. RETURN DATA: Return the new user (but without the password!)
    // We can't just return newUser, as it has the hash.
    const userToReturn = newUser.toObject(); // Convert Mongoose doc to plain object
    delete userToReturn.password;
    
    return userToReturn;
};

module.exports = {
    registerUser
    // ... other functions like loginUser, getUserById, etc.
};