const calculateFare = (distanceMeters, durationSeconds, vehicleType = 'standard') => {
    const BASE_FARE = {
        standard: 2.50,
        premium: 5.00,
        van: 7.00
    };

    const PER_KM_RATE = {
        standard: 1.00,
        premium: 2.00,
        van: 1.80
    };

    const PER_MINUTE_RATE = {
        standard: 0.20,
        premium: 0.50,
        van: 0.40
    };

    const distanceKm = distanceMeters / 1000;
    const durationMinutes = durationSeconds / 60;

    let fare = BASE_FARE[vehicleType];
    fare += distanceKm * PER_KM_RATE[vehicleType];
    fare += durationMinutes * PER_MINUTE_RATE[vehicleType];

    return Math.round(fare * 100) / 100; // Round to 2 decimals
};

module.exports = { calculateFare, calculateCancellationFee: (trip) => 5.00 }; // Flat fee for now
