import driverService from '../services/driverService.js';
import userService from '../services/userService.js';

export const getDriver = async (req, res) => {
    try {
        let id = req.params.id;
        if (id === 'me' && req.user) {
            id = req.user.uid;
        }

        try {
            const driver = await driverService.getDriver(id);
            res.status(200).json({ success: true, data: driver });
        } catch (driverError) {
            // Fallback: Try fetching as a regular user
            // This handles cases where they are in the ranking/auth but missing driver doc
            try {
                const user = await userService.getUser(id);
                // Return user data but maybe indicate they are not a full driver?
                // For now, just return what we have so profile works
                res.status(200).json({ success: true, data: { ...user, vehicle: null, isPartial: true } });
            } catch (userError) {
                // Determine which error to return (likely the original one is more relevant if neither found)
                res.status(404).json({ success: false, error: "Driver not found" });
            }
        }
    } catch (error) {
        res.status(404).json({ success: false, error: error.message });
    }
};

export const updateDriver = async (req, res) => {
    try {
        const updatedDriver = await driverService.updateDriver(req.params.id, req.body);
        res.status(200).json({ success: true, data: updatedDriver });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

export const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        // Use ID from params OR from authenticated user
        const driverId = req.params.id || (req.user ? req.user.uid : null);

        if (!driverId) {
            return res.status(400).json({ success: false, error: "Driver ID is required" });
        }

        const result = await driverService.updateStatus(driverId, status);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

export const updateLocation = async (req, res) => {
    try {
        const { lat, lng } = req.body;
        if (lat === undefined || lng === undefined) {
            return res.status(400).json({ success: false, error: "Latitude and Longitude are required" });
        }
        const result = await driverService.updateLocation(req.params.id, lat, lng);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
