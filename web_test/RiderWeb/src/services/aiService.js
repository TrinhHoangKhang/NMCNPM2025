
import { apiClient } from './apiService';

export const sendCommand = async (text) => {
    return await apiClient('/ai/commands', {
        method: 'POST',
        body: { text }
    });
};
