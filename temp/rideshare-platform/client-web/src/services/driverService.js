import api from '../lib/axios';

export const getDriverProfile = async () => {
    const { data } = await api.get('/api/drivers/profile');
    return data;
};

export const createDriverProfile = async (driverData) => {
    const { data } = await api.post('/api/drivers', driverData);
    return data;
};

export const updateDriverLocation = async (coords) => {
    const { data } = await api.patch('/api/drivers/location', coords);
    return data;
};

export const toggleDriverStatus = async () => {
    const { data } = await api.patch('/api/drivers/status');
    return data;
};
