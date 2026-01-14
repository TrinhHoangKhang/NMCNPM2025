import { db, admin } from '../config/firebaseConfig.js';

class UserService {

    // 1. Get User Profile
    async getUser(userId) {
        const doc = await db.collection('users').doc(userId).get();
        if (!doc.exists) throw new Error("User not found");
        return doc.data();
    }

    async createUser(userId, userData) {
        const userRef = db.collection('users').doc(userId);
        const data = {
            name: userData.name || 'User',
            email: userData.email || '',
            phone: userData.phone || '',
            role: userData.role || 'RIDER',
            createdAt: new Date().toISOString(),
            ...userData
        };
        await userRef.set(data);
        return { id: userId, ...data };
    }

    // 1.5 Get All Users with Filter
    async getAllUsers(filters = {}) {
        let query = db.collection('users');

        if (filters.role) {
            // Support both uppercase and lowercase roles (e.g. 'ADMIN' and 'admin')
            // to handle legacy data or inconsistencies.
            const uniqueRoles = [...new Set([filters.role, filters.role.toUpperCase(), filters.role.toLowerCase()])];
            query = query.where('role', 'in', uniqueRoles);
        }

        const snapshot = await query.get();
        let users = [];
        const driverFetches = [];

        snapshot.forEach(doc => {
            const userData = { id: doc.id, ...doc.data() };
            users.push(userData);

            // If user is a driver, prepare to fetch their status from 'drivers' collection
            if (userData.role === 'DRIVER') {
                driverFetches.push(
                    db.collection('drivers').doc(doc.id).get()
                        .then(driverDoc => {
                            if (driverDoc.exists) {
                                userData.status = driverDoc.data().status || 'OFFLINE';
                            } else {
                                userData.status = 'OFFLINE';
                            }
                        })
                        .catch(() => { userData.status = 'OFFLINE'; })
                );
            }
        });

        // Wait for all driver status fetches to complete
        if (driverFetches.length > 0) {
            await Promise.all(driverFetches);
        }

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

    async deleteUser(userId) {
        const batch = db.batch();

        // 1. Delete user from 'users' collection
        const userRef = db.collection('users').doc(userId);
        batch.delete(userRef);

        // 2. Also attempt to delete from 'drivers' if they have a driver profile
        const driverRef = db.collection('drivers').doc(userId);
        batch.delete(driverRef);

        // Execute batch delete
        await batch.commit();
        return true;
    }

    // 5. Add Favorite Location
    async addFavoriteLocation(userId, locationData) {
        // locationData: { name, address, lat, lng, type (optional: home, work) }
        const userRef = db.collection('users').doc(userId);

        // Use arrayUnion to append to the list
        await userRef.update({
            favoriteLocations: admin.firestore.FieldValue.arrayUnion(locationData)
        });

        const updatedDoc = await userRef.get();
        return updatedDoc.data().favoriteLocations;
    }

    // 6. Get Favorite Locations
    async getFavoriteLocations(userId) {
        const doc = await db.collection('users').doc(userId).get();
        if (!doc.exists) throw new Error("User not found");
        return doc.data().favoriteLocations || [];
    }
}

export default new UserService();
