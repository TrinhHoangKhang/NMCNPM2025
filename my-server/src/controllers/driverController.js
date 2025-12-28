import driverService from '../services/driverService.js';

export const getDriver = async (req, res) => {
    try {
        const driver = await driverService.getDriver(req.params.id);
        res.status(200).json({ success: true, data: driver });
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
        const result = await driverService.updateStatus(req.params.id, status);
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
