const axios = require('axios');

exports.getDistance = async (origin, destination) => {
    const apiKey = process.env.GOOGLE_MAPS_KEY;
    
    // 1. Plug the key into the URL string
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error("Maps Error:", error);
        throw error;
    }
};