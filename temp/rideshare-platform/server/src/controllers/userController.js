const { generateToken } = require('../utils/tokenUtils');
const User = require('../models/User');
const Driver = require('../models/Driver'); // Import for discriminator usage if needed specifically, but User.findById works generally.

// @desc    Get user by ID (Unified endpoint)
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // With discriminators, 'user' will contain driver fields if user.role === 'driver'
        // Construct response to match frontend expectations (which expects nested driver object in some places)
        // OR flatten it.
        // The previous frontend code accessed `profileData.driverDetails`.
        // We should try to adapt the response to preserve this if possible, or update frontend.
        // Let's adapt response:
        let response = { user };

        if (user.role === 'driver') {
            // In discriminator model, the driver fields are ON the user object.
            // But frontend might expect { user: { ... }, driver: { vehicle: ... } }
            // Let's provide the "driver specific" fields in a separate key to simplify frontend migration,
            // OR just return the user object as 'driver' too?
            // Actually, cleanest is to just send the user object.
            // But the frontend `UserProfile.jsx` line 30 says: `setProfileData({ ...data.user, driverDetails: data.driver });`
            // So we should construct a response that fits that.

            response.driver = {
                vehicle: user.vehicle,
                isOnline: user.isOnline,
                currentLocation: user.currentLocation,
                status: user.status,
                earnings: user.earnings
                // Add other driver specific fields here
            };
        }

        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        let user = await User.findById(req.user._id);

        if (user) {
            user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
            user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
            user.realName = req.body.realName !== undefined ? req.body.realName : user.realName;
            user.location = req.body.location !== undefined ? req.body.location : user.location;
            user.profilePicture = req.body.profilePicture !== undefined ? req.body.profilePicture : user.profilePicture;

            // Handle Role Upgrade
            if (req.body.role === 'driver' && user.role === 'rider') {
                if (!user.phone && !req.body.phone) {
                    return res.status(400).json({ message: 'Phone number is required to become a driver' });
                }

                // CRITICAL: Changing the discriminator key
                // Mongoose allows updating the key. When saved, it should re-hydrate as Driver?
                // Actually, often better to use `findOneAndUpdate` or explicit property setting.
                user.role = 'driver';

                // Initialize default driver fields
                user.status = 'available';
                user.vehicle = {
                    make: 'Unknown',
                    model: 'Unknown',
                    plateNumber: 'PENDING',
                    color: 'Unknown'
                };
                user.isOnline = false;

                // We might need to mark fields as modified or use a specific update command
                // if the document instance doesn't have the schema paths yet.
                // However, since we loaded it as 'User', it might not know about 'vehicle'.
                // Strategy: Save as normal user first (updating role), then fetch as Driver?
                // Or better: use FindOneAndUpdate to force the structure change in DB.
            }

            // Save the user. If role changed to 'driver', Mongoose discriminator logic 
            // *should* handle the type change on next fetch. 
            // But `user.vehicle = ...` might fail if `user` instance is strictly `UserSchema`.
            // To be safe, we perform the update using `findByIdAndUpdate` for the role change case
            // or just use `findByIdAndUpdate` for everything.

            if (req.body.role === 'driver') {
                // Force update to add driver fields
                user = await User.findByIdAndUpdate(user._id, {
                    $set: {
                        role: 'driver',
                        status: 'available',
                        vehicle: {
                            make: 'Unknown',
                            model: 'Unknown',
                            plateNumber: 'PENDING',
                            color: 'Unknown'
                        },
                        isOnline: false,
                        bio: user.bio,
                        phone: user.phone,
                        realName: user.realName,
                        location: user.location,
                        profilePicture: user.profilePicture
                    }
                }, { new: true, runValidators: true });
            } else {
                // Normal update
                user = await user.save();
            }

            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                realName: user.realName,
                location: user.location,
                profilePicture: user.profilePicture,
                phone: user.phone,
                role: user.role,
                bio: user.bio,
                // Include driver fields if driver
                ...(user.role === 'driver' && {
                    vehicle: user.vehicle,
                    status: user.status,
                    isOnline: user.isOnline
                }),
                token: generateToken(user._id)
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUserById,
    updateUserProfile
};
