import mapsService from '../services/mapsService.js';

export const calculateRoute = async (req, res) => {
    try {
        console.log("📍 [SERVER DEBUG] Nhận yêu cầu tính đường:", req.body);
        const { origin, destination, vehicleType } = req.body;

        if (!origin || !destination) {
            return res.status(400).json({
                success: false,
                error: "Origin and Destination are required"
            });
        }

        const routeData = await mapsService.calculateRoute(origin, destination, vehicleType);

        res.status(200).json({
            success: true,
            data: routeData
        });

    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};