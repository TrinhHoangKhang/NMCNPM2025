import userRepository from './userRepository.js';

class UserService {

    // 1. Get User Profile
    async getUser(userId) {
        const user = await userRepository.findById(userId);
        if (!user) throw new Error("User not found");
        return user;
    }

    // 2. Update User Profile
    async updateUser(userId, updates) {
        // Prevent updating sensitive fields if necessary (e.g., role, uid)
        delete updates.uid;
        delete updates.role; // Typically roles shouldn't be self-updated

        return userRepository.update(userId, updates);
    }
}

export default new UserService();
