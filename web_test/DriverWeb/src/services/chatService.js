
import { apiClient } from './apiService';

export const sendMessage = async (recipientId, text) => {
    return await apiClient('/chat/send', {
        method: 'POST',
        body: { recipientId, text }
    });
};

export const getChatHistory = async (friendId) => {
    return await apiClient(`/chat/history/${friendId}`, {
        method: 'GET'
    });
};
