// server/src/controllers/devController.js
import { db } from '../../core/loaders/firebaseLoader.js';

export const getAllUsers = async (req, res) => {
    try {
        const snapshot = await db.collection('users').get();
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json({ success: true, count: users.length, data: users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getAllDrivers = async (req, res) => {
    try {
        const snapshot = await db.collection('drivers').get();
        const drivers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json({ success: true, count: drivers.length, data: drivers });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id, type } = req.params; // type: 'user' or 'driver'
        const collection = type === 'driver' ? 'drivers' : 'users';
        await db.collection(collection).doc(id).delete();
        res.json({ success: true, message: `${type} ${id} deleted` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id, type } = req.params;
        const updates = req.body;
        const collection = type === 'driver' ? 'drivers' : 'users';
        await db.collection(collection).doc(id).update(updates);
        res.json({ success: true, message: `${type} ${id} updated` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
