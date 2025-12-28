const Driver = require('../models/Driver');
const User = require('../models/User');

// @desc    Create/Update Driver Profile
// @route   POST /api/drivers
// @access  Private
const updateDriverProfile = async (req, res) => {
    const { vehicle, currentLocation } = req.body;

    try {
        let driver = await Driver.findOne({ user: req.user._id });

        if (driver) {
            driver.vehicle = vehicle || driver.vehicle;
            await driver.save();
        } else {
            driver = await Driver.create({
                user: req.user._id,
                vehicle,
                currentLocation: currentLocation || { type: 'Point', coordinates: [0, 0] }
            });
            // Update user role to driver
            await User.findByIdAndUpdate(req.user._id, { role: 'driver' });
        }
        res.json(driver);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Update Location
// @route   PATCH /api/drivers/location
// @access  Private (Driver)
const updateLocation = async (req, res) => {
    const { latitude, longitude } = req.body;

    try {
        const driver = await Driver.findOne({ user: req.user._id });

        if (!driver) {
            return res.status(404).json({ message: 'Driver profile not found' });
        }

        driver.currentLocation = {
            type: 'Point',
            coordinates: [longitude, latitude]
        };
        await driver.save();

        // If driver is in a trip, emit to that trip room
        // We'd need to find active trip. For now, just respond.
        // req.io.to('...').emit('driver_moved', { ... });

        res.json({ success: true, location: driver.currentLocation });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Toggle Online Status
// @route   PATCH /api/drivers/status
// @access  Private
const toggleStatus = async (req, res) => {
    try {
        const driver = await Driver.findOne({ user: req.user._id });
        if (!driver) return res.status(404).json({ message: 'Driver not found' });

        driver.isOnline = !driver.isOnline;
        await driver.save();

        res.json({ isOnline: driver.isOnline });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Get Driver Profile
// @route   GET /api/drivers/profile
// @access  Private
const getDriverProfile = async (req, res) => {
    try {
        const driver = await Driver.findOne({ user: req.user._id });
        if (!driver) {
            return res.json({ profile: null });
        }
        res.json({ profile: driver });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Get Nearby Drivers via Geospatial Query
// @route   GET /api/drivers/nearby
// @access  Private
const getNearbyDrivers = async (req, res) => {
    const { lat, lng, radius = 5000 } = req.query;

    if (!lat || !lng) {
        return res.status(400).json({ message: 'Latitude and Longitude required' });
    }

    try {
        const drivers = await Driver.find({
            isOnline: true,
            status: 'available',
            currentLocation: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseInt(radius)
                }
            }
        }).limit(20).populate('user', 'realName'); // Only need name for UI

        const minimalDrivers = drivers.map(d => ({
            id: d.user._id, // Use User ID for consistency with socket approach OR d._id? Let's use Driver ID for markers
            driverId: d._id,
            name: d.user.realName || 'Driver',
            lat: d.currentLocation.coordinates[1],
            lng: d.currentLocation.coordinates[0],
            vehicle: d.vehicle ? d.vehicle.type : 'standard'
        }));

        res.json(minimalDrivers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { updateDriverProfile, updateLocation, toggleStatus, getDriverProfile, getNearbyDrivers };
