import api from '../lib/axios';

export const driverLoader = async () => {
    try {
        const res = await api.get('/api/drivers/profile');
        if (!res.data.profile) {
            return { profileMissing: true };
        }
        return {
            isOnline: res.data.profile.isOnline,
            driverId: res.data.profile._id,
            profileMissing: false
        };
    } catch (error) {
        console.error("Failed to fetch driver profile in loader", error);
        // If 404, it might mean profile doesn't exist yet, we can handle that.
        // Or return null to indicate failure/missing
        if (error.response && error.response.status === 404) {
            return { profileMissing: true };
        }
        return { error: true };
    }
};
