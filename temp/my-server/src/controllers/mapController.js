const mapsService = require('../services/mapsService');

exports.calculateRoute = async (req, res) => {
    try {
        const { origin, destination } = req.body;

        if (!origin || !destination) {
            return res.status(400).json({
                success: false,
                error: "Origin and Destination are required"
            });
        }

        const routeData = await mapsService.calculateRoute(origin, destination);

        res.status(200).json({
            success: true,
            data: routeData
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
