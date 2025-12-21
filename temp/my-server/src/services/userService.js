const { db } = require('../config/firebaseConfig');

class UserService {

    // 1. Get User Profile
    async getUser(userId) {
        const doc = await db.collection('users').doc(userId).get();
        if (!doc.exists) throw new Error("User not found");
        return doc.data();
    }

    // 2. Update User Profile
    async updateUser(userId, updates) {
        // Prevent updating sensitive fields if necessary (e.g., role, uid)
        delete updates.uid;
        delete updates.role; // Typically roles shouldn't be self-updated

        const docRef = db.collection('users').doc(userId);
        await docRef.update(updates);

        const updatedDoc = await docRef.get();
        return updatedDoc.data();
    }
}

module.exports = new UserService();
