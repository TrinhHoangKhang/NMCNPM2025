
import { apiClient } from './apiService';

export const sendFriendRequest = async (email) => {
    return await apiClient('/friends/request', {
        method: 'POST',
        body: { toEmail: email }
    });
};

export const getPendingRequests = async () => {
    return await apiClient('/friends/requests', {
        method: 'GET'
    });
};

export const respondToRequest = async (requestId, action) => {
    return await apiClient(`/friends/requests/${requestId}`, {
        method: 'PUT',
        body: { action }
    });
};

export const getFriends = async () => {
    return await apiClient('/friends', {
        method: 'GET'
    });
};
