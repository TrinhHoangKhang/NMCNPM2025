const User = require('../models/User');
const { generateToken } = require('../utils/tokenUtils');

const register = async ({ username, email, password, phone, role }) => {
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new Error('User already exists');
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
        throw new Error('Username already taken');
    }

    // Create User
    const user = await User.create({
        username,
        email,
        password,
        phone,
        role
    });

    if (user) {
        return {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        };
    } else {
        throw new Error('Invalid user data');
    }
};

const login = async ({ email, password }) => {
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
        return {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        };
    } else {
        throw new Error('Invalid email or password');
    }
};

module.exports = {
    register,
    login
};
