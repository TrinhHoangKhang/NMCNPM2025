
import { db, admin } from '../config/firebaseConfig.js';
import presenceService from './presenceService.js';
import { EventEmitter } from 'events';

class ChatService extends EventEmitter {

    // 1. Get or Create Conversation
    async getOrCreateConversation(uid1, uid2) {
        // Convs ID = canonical sort of IDs
        const participants = [uid1, uid2].sort();
        const convId = `${participants[0]}_${participants[1]}`;

        const convRef = db.collection('conversations').doc(convId);
        const convDoc = await convRef.get();

        if (!convDoc.exists) {
            await convRef.set({
                participants,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastMessage: '',
                type: 'DIRECT'
            });
        }
        return { id: convId, ... (await convRef.get()).data() };
    }

    // 2. Send Message
    async sendMessage(senderId, recipientId, text) {
        const conv = await this.getOrCreateConversation(senderId, recipientId);

        const message = {
            senderId,
            text,
            createdAt: new Date().toISOString(),
            read: false
        };

        // Add to subcollection
        const msgRef = await db.collection('conversations').doc(conv.id).collection('messages').add(message);

        // Update Conversation Summary
        await db.collection('conversations').doc(conv.id).update({
            lastMessage: text,
            updatedAt: message.createdAt
        });

        const fullMessage = { id: msgRef.id, conversationId: conv.id, ...message, recipientId };

        // Emit event for real-time delivery
        this.emit('messageSent', fullMessage);

        return fullMessage;
    }

    // 3. Get Chat History
    async getMessages(userId, friendId) {
        // Construct ID directly
        const participants = [userId, friendId].sort();
        const convId = `${participants[0]}_${participants[1]}`;

        const snapshot = await db.collection('conversations').doc(convId)
            .collection('messages')
            .orderBy('createdAt', 'asc')
            .limit(100)
            .get();

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    // 4. Get All Conversations for User
    async getConversations(userId) {
        // Query "conversations" where "participants" array-contains userId
        const snapshot = await db.collection('conversations')
            .where('participants', 'array-contains', userId)
            .orderBy('updatedAt', 'desc') // Ensure composite index exists or remove order
            .limit(20)
            .get();

        if (snapshot.empty) return [];

        const conversations = [];
        for (const doc of snapshot.docs) {
            const data = doc.data();
            const partnerId = data.participants.find(p => p !== userId);

            // Get Partner Name
            let partnerName = "Unknown";
            let avatar = null;
            if (partnerId) {
                const userDoc = await db.collection('users').doc(partnerId).get();
                if (userDoc.exists) {
                    partnerName = userDoc.data().name || "Unknown";
                    avatar = userDoc.data().avatarUrl || null;
                }
            }

            conversations.push({
                partnerId: partnerId || "",
                partnerName: partnerName,
                lastMessage: data.lastMessage || "",
                lastMessageTime: data.updatedAt || "",
                avatar: avatar
            });
        }
        return conversations;
    }
}

export default new ChatService();
