import { apiClient } from './apiService';

export const userService = {
    getUser: async (id) => {
        return apiClient(`/users/${id}`);
    },

    updateUser: async (id, userData) => {
        // userData: { name, phone, etc. }
        return apiClient(`/users/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(userData)
        });
    }
};
