import userService from '../services/userService.js';

export const getAllUsers = async (req, res) => {
    try {
        const filters = {
            role: req.query.role,
            search: req.query.search
        };
        const users = await userService.getAllUsers(filters);
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getUser = async (req, res) => {
    try {
        const user = await userService.getUser(req.params.id);
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(404).json({ success: false, error: error.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const updatedUser = await userService.updateUser(req.params.id, req.body);
        res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
export const deleteUser = async (req, res) => {
    try {
        await userService.deleteUser(req.params.id);
        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const addFavoriteLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const locationData = req.body; // Expect { name, address, lat, lng }

        // Basic validation
        if (!locationData || !locationData.address) {
            return res.status(400).json({ success: false, message: "Address is required" });
        }

        const favorites = await userService.addFavoriteLocation(id, locationData);
        res.status(200).json({ success: true, data: favorites });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getFavoriteLocations = async (req, res) => {
    try {
        const favorites = await userService.getFavoriteLocations(req.params.id);
        res.status(200).json({ success: true, data: favorites });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
