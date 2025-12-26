import React, { useState } from 'react';
import { createDriverProfile } from '../../services/driverService';
import { getUserById } from '../../services/userService';

const DriverRegistrationModal = ({ user, onClose, onRegistrationSuccess, updateUser }) => {
    const [vehicleForm, setVehicleForm] = useState({
        make: "", model: "", plate: "", color: "", type: "standard"
    });
    const [loading, setLoading] = useState(false);

    const handleRegisterDriver = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const driverData = {
                vehicle: {
                    make: vehicleForm.make,
                    model: vehicleForm.model,
                    plateNumber: vehicleForm.plate,
                    color: vehicleForm.color,
                    type: vehicleForm.type
                },
                currentLocation: {
                    type: 'Point',
                    coordinates: [0, 0] // Default to 0,0 to satisfy GeoJSON requirement on creation
                }
            };
            await createDriverProfile(driverData);

            alert("Congratulations! You are now a driver.");

            // Refresh full profile to sync generic user data with new role
            const updatedUser = await getUserById(user._id);
            const userData = updatedUser.user || updatedUser;
            updateUser(userData);

            onRegistrationSuccess();
        } catch (error) {
            console.error("Registration failed", error);
            alert("Failed to register as driver: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-300">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Become a Driver</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <p className="text-gray-600 mb-6 text-sm">Fill in your vehicle details to start accepting rides.</p>

                <form onSubmit={handleRegisterDriver} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Make</label>
                            <input required className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-indigo-500" value={vehicleForm.make} onChange={e => setVehicleForm({ ...vehicleForm, make: e.target.value })} placeholder="Toyota" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Model</label>
                            <input required className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-indigo-500" value={vehicleForm.model} onChange={e => setVehicleForm({ ...vehicleForm, model: e.target.value })} placeholder="Prius" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">License Plate</label>
                        <input required className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-indigo-500 font-mono bg-yellow-50" value={vehicleForm.plate} onChange={e => setVehicleForm({ ...vehicleForm, plate: e.target.value })} placeholder="ABC-123" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Color</label>
                            <input required className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-indigo-500" value={vehicleForm.color} onChange={e => setVehicleForm({ ...vehicleForm, color: e.target.value })} placeholder="Silver" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Type</label>
                            <select className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-indigo-500" value={vehicleForm.type} onChange={e => setVehicleForm({ ...vehicleForm, type: e.target.value })}>
                                <option value="standard">Standard</option>
                                <option value="premium">Premium</option>
                                <option value="van">Van</option>
                            </select>
                        </div>
                    </div>

                    <button disabled={loading} type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition mt-4 shadow-lg flex justify-center">
                        {loading ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> : "Complete Registration"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DriverRegistrationModal;
