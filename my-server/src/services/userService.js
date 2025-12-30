import { db } from '../config/firebaseConfig.js';

class UserService {

    // 1. Get User Profile
    async getUser(userId) {
        const doc = await db.collection('users').doc(userId).get();
        if (!doc.exists) throw new Error("User not found");
        return doc.data();
    }

    // 1.5 Get All Users with Filter
    async getAllUsers(filters = {}) {
        let query = db.collection('users');

        if (filters.role) {
            query = query.where('role', '==', filters.role);
        }

        const snapshot = await query.get();
        let users = [];
        snapshot.forEach(doc => {
            users.push({ id: doc.id, ...doc.data() });
        });

        // Basic In-memory Search (Firestore doesn't support native partial text search easily)
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            users = users.filter(u =>
                (u.name && u.name.toLowerCase().includes(searchLower)) ||
                (u.email && u.email.toLowerCase().includes(searchLower)) ||
                (u.phone && u.phone.includes(filters.search))
            );
        }

        return users;
    }

    async updateUser(userId, updates) {
        // Prevent updating sensitive fields if necessary (e.g., role, uid)
        delete updates.uid;
        delete updates.role; // Typically roles shouldn't be self-updated

        const docRef = db.collection('users').doc(userId);
        await docRef.update(updates);

        const updatedDoc = await docRef.get();
        return updatedDoc.data();
    }

    // 3. Update Wallet Balance (Simple Ledger)
    async updateWalletBalance(userId, amount, tripId = null) {
        const docRef = db.collection('users').doc(userId);

        // Use transaction for atomic balance update
        const result = await db.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(docRef);
            if (!userDoc.exists) throw new Error("User not found");

            const userData = userDoc.data();
            const currentBalance = userData.walletBalance || 0;
            const newBalance = currentBalance + amount;

            transaction.update(docRef, { walletBalance: newBalance });

            // NEW: Save Transaction History
            const transactionRef = db.collection('transactions').doc();
            transaction.set(transactionRef, {
                userId,
                amount,
                type: amount >= 0 ? 'CREDIT' : 'DEBIT',
                tripId: tripId || null,
                balanceAfter: newBalance,
                createdAt: new Date().toISOString()
            });

            return newBalance;
        });

        return result;
    }
}

export default new UserService();
