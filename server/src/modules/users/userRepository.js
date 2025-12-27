import { db } from '../../core/loaders/firebaseLoader.js';

class UserRepository {
    constructor() {
        this.collection = db.collection('users');
    }

    async findById(userId) {
        const doc = await this.collection.doc(userId).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() };
    }

    async update(userId, updates) {
        const docRef = this.collection.doc(userId);
        await docRef.update(updates);
        const updatedDoc = await docRef.get();
        return { id: updatedDoc.id, ...updatedDoc.data() };
    }

    async setOnlineStatus(userId, isOnline) {
        return this.collection.doc(userId).update({
            is_online: isOnline,
            last_seen_at: new Date().toISOString()
        });
    }
}

export default new UserRepository();
