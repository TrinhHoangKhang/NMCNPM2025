
import { apiClient } from './apiService';

export const sendCommand = async (text) => {
    return await apiClient('/ai/command', {
        method: 'POST',
        body: { text }
    });
};

export const sendQuery = async (text) => {
    return await apiClient('/ai/query', {
        method: 'POST',
        body: { text }
    });
};

