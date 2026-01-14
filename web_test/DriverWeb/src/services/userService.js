import { apiClient } from './apiService';

export const userService = {
    getUser: async (id) => {
        return apiClient(`/users/${id}`);
    },

    updateUser: async (id, data) => {
        return apiClient(`/users/${id}`, {
            method: 'PATCH',
            body: data
        });
    }
};
