import React, { useState } from 'react';

const DriverVehicleCard = ({ vehicle, onSave, status, earnings }) => {
    const [isEditingVehicle, setIsEditingVehicle] = useState(false);
    const [vehicleForm, setVehicleForm] = useState({
        make: vehicle?.make || "",
        model: vehicle?.model || "",
        plate: vehicle?.plateNumber || "",
        color: vehicle?.color || "",
        type: vehicle?.type || "standard"
    });

    const handleSaveVehicle = async () => {
        const vehicleData = {
            vehicle: {
                make: vehicleForm.make,
                model: vehicleForm.model,
                plateNumber: vehicleForm.plate,
                color: vehicleForm.color,
                type: vehicleForm.type
            }
        };
        const success = await onSave(vehicleData);
        if (success) setIsEditingVehicle(false);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <span>🚖</span> Vehicle Information
                </h3>
                {!isEditingVehicle && <button onClick={() => setIsEditingVehicle(true)} className="text-sm text-indigo-600 hover:underline">Edit Vehicle</button>}
            </div>
            <div className="p-6">
                {isEditingVehicle ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500">Make</label>
                                <input className="w-full border p-2 rounded text-sm" value={vehicleForm.make} onChange={e => setVehicleForm({ ...vehicleForm, make: e.target.value })} placeholder="Toyota" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Model</label>
                                <input className="w-full border p-2 rounded text-sm" value={vehicleForm.model} onChange={e => setVehicleForm({ ...vehicleForm, model: e.target.value })} placeholder="Camry" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Plate Number</label>
                                <input className="w-full border p-2 rounded text-sm" value={vehicleForm.plate} onChange={e => setVehicleForm({ ...vehicleForm, plate: e.target.value })} placeholder="XYZ-123" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Color</label>
                                <input className="w-full border p-2 rounded text-sm" value={vehicleForm.color} onChange={e => setVehicleForm({ ...vehicleForm, color: e.target.value })} placeholder="Silver" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs text-gray-500">Vehicle Type</label>
                                <select className="w-full border p-2 rounded text-sm" value={vehicleForm.type} onChange={e => setVehicleForm({ ...vehicleForm, type: e.target.value })}>
                                    <option value="standard">Standard (4 Seats)</option>
                                    <option value="premium">Premium (Luxury)</option>
                                    <option value="van">Van (6+ Seats)</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setIsEditingVehicle(false)} className="px-3 py-1 text-gray-600">Cancel</button>
                            <button onClick={handleSaveVehicle} className="px-3 py-1 bg-indigo-600 text-white rounded">Save Vehicle</button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div>
                            <span className="block text-xs text-gray-500">Vehicle</span>
                            <span className="font-medium text-gray-900">{vehicle?.color} {vehicle?.make} {vehicle?.model || "Not set"}</span>
                        </div>
                        <div>
                            <span className="block text-xs text-gray-500">Plate</span>
                            <span className="font-medium text-gray-900">{vehicle?.plateNumber || "Not set"}</span>
                        </div>
                        <div>
                            <span className="block text-xs text-gray-500">Type</span>
                            <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 uppercase">{vehicle?.type || "Standard"}</span>
                        </div>
                        <div>
                            <span className="block text-xs text-gray-500">Status</span>
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold uppercase ${status === 'available' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                {status || 'Offline'}
                            </span>
                        </div>
                        <div>
                            <span className="block text-xs text-gray-500">Total Earnings</span>
                            <span className="font-medium text-green-600">${earnings?.toFixed(2) || '0.00'}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DriverVehicleCard;
