import driverService from '../services/driverService.js';
import locationService from '../services/locationService.js';

export const createDriver = async (req, res) => {
    try {
        const uid = req.user.uid;
        const driver = await driverService.registerDriver(uid, req.body);
        res.status(201).json({ success: true, data: driver });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

export const getNearbyDrivers = async (req, res) => {
    try {
        const { lat, lng, radius } = req.query;
        if (!lat || !lng) {
            return res.status(400).json({ success: false, error: "Latitude and Longitude are required" });
        }
        const drivers = await locationService.findNearbyDrivers(
            { lat: parseFloat(lat), lng: parseFloat(lng) },
            radius ? parseInt(radius) : 5000
        );
        res.status(200).json(drivers); // Return array directly to match frontend expectation
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getDriver = async (req, res) => {
    try {
        const id = req.params.id || req.user.uid;
        const driver = await driverService.getDriver(id);
        res.status(200).json({ success: true, data: driver });
    } catch (error) {
        res.status(404).json({ success: false, error: error.message });
    }
};

export const updateDriver = async (req, res) => {
    try {
        const id = req.params.id || req.user.uid;
        const updatedDriver = await driverService.updateDriver(id, req.body);
        res.status(200).json({ success: true, data: updatedDriver });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

export const updateStatus = async (req, res) => {
    try {
        const id = req.params.id || req.user.uid;
        const { status } = req.body;
        const result = await driverService.updateStatus(id, status);
        res.status(200).json({ success: true, isOnline: status === 'ONLINE' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

export const updateLocation = async (req, res) => {
    try {
        const id = req.params.id || req.user.uid;
        const { lat, lng } = req.body;
        if (lat === undefined || lng === undefined) {
            return res.status(400).json({ success: false, error: "Latitude and Longitude are required" });
        }
        const result = await driverService.updateLocation(id, lat, lng);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
