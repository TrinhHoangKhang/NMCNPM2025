
import { db, admin } from '../config/firebaseConfig.js';

class FriendService {

    // 1. Send Friend Request
    async sendRequest(fromId, toEmail) {
        // Find user by email
        const userSnapshot = await db.collection('users').where('email', '==', toEmail).limit(1).get();
        if (userSnapshot.empty) {
            throw new Error("User with this email not found.");
        }

        const toUser = userSnapshot.docs[0];
        const toId = toUser.id;

        if (fromId === toId) {
            throw new Error("Cannot add yourself as a friend.");
        }

        // Check if already friends
        const friendCheck = await db.collection('users').doc(fromId).collection('friends').doc(toId).get();
        if (friendCheck.exists) {
            throw new Error("You are already friends.");
        }

        // Check for existing pending request
        const existingReq = await db.collection('friend_requests')
            .where('from', '==', fromId)
            .where('to', '==', toId)
            .where('status', '==', 'PENDING')
            .get();

        if (!existingReq.empty) {
            throw new Error("Friend request already sent.");
        }

        // Create Request
        const newReq = {
            from: fromId,
            to: toId,
            fromEmail: (await db.collection('users').doc(fromId).get()).data().email, // Cache for UI
            toEmail: toEmail,
            status: 'PENDING',
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection('friend_requests').add(newReq);
        return { id: docRef.id, ...newReq };
    }

    // 2. Get Pending Requests (Incoming)
    async getPendingRequests(userId) {
        const snapshot = await db.collection('friend_requests')
            .where('to', '==', userId)
            .where('status', '==', 'PENDING')
            .get();

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    // 3. Respond to Request (Accept/Reject)
    async respondToRequest(requestId, userId, action) {
        const docRef = db.collection('friend_requests').doc(requestId);
        const doc = await docRef.get();

        if (!doc.exists) throw new Error("Request not found");
        const data = doc.data();

        if (data.to !== userId) throw new Error("Unauthorized");
        if (data.status !== 'PENDING') throw new Error("Request already processed");

        if (action === 'REJECT') {
            await docRef.update({ status: 'REJECTED' });
            return { message: "Request rejected" };
        }

        if (action === 'ACCEPT') {
            const batch = db.batch();

            // 1. Update Request Status
            batch.update(docRef, { status: 'ACCEPTED' });

            // 2. Add to User A's friend list
            const friendA = db.collection('users').doc(data.from).collection('friends').doc(data.to);
            batch.set(friendA, {
                friendId: data.to,
                friendEmail: data.toEmail,
                createdAt: new Date().toISOString()
            });

            // 3. Add to User B's friend list
            const friendB = db.collection('users').doc(data.to).collection('friends').doc(data.from);
            batch.set(friendB, {
                friendId: data.from,
                friendEmail: data.fromEmail,
                createdAt: new Date().toISOString()
            });

            await batch.commit();
            return { message: "Friend added successfully" };
        }

        throw new Error("Invalid action");
    }

    // 4. Get Friends List
    async getFriends(userId) {
        const snapshot = await db.collection('users').doc(userId).collection('friends').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    // 5. Force Add Friend (SystemAction)
    async forceAddFriend(user1Id, user1Email, user2Id, user2Email) {
        if (user1Id === user2Id) return; // Basic check

        // Check if already friends to avoid overwriting or duplicates (though set() handles overwrite fine)
        const friendCheck = await db.collection('users').doc(user1Id).collection('friends').doc(user2Id).get();
        if (friendCheck.exists) return; // Already friends

        const batch = db.batch();

        // Add to User 1's list
        const friendRef1 = db.collection('users').doc(user1Id).collection('friends').doc(user2Id);
        batch.set(friendRef1, {
            friendId: user2Id,
            friendEmail: user2Email,
            createdAt: new Date().toISOString(),
            source: 'RIDE_CONNECTION' // Metadata
        });

        // Add to User 2's list
        const friendRef2 = db.collection('users').doc(user2Id).collection('friends').doc(user1Id);
        batch.set(friendRef2, {
            friendId: user1Id,
            friendEmail: user1Email,
            createdAt: new Date().toISOString(),
            source: 'RIDE_CONNECTION'
        });

        await batch.commit();
        console.log(`[FriendService] Auto-connected ${user1Email} and ${user2Email}`);
    }
}

export default new FriendService();
