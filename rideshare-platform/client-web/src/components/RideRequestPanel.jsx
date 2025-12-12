import React, { useState } from 'react';

const RideRequestPanel = () => {
    const [pickup, setPickup] = useState('');
    const [dropoff, setDropoff] = useState('');
    const [vehicleType, setVehicleType] = useState('standard');

    const handleRequestRide = (e) => {
        e.preventDefault();
        console.log({ pickup, dropoff, vehicleType });
        alert(`Requesting ${vehicleType} ride from ${pickup} to ${dropoff}`);
    };

    return (
        <div className="absolute top-4 left-4 z-[1000] bg-white p-4 rounded-lg shadow-xl w-80">
            <h2 className="text-xl font-bold mb-4">Request a Ride</h2>
            <form onSubmit={handleRequestRide} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Pickup Location</label>
                    <input
                        type="text"
                        placeholder="Current Location"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        value={pickup}
                        onChange={(e) => setPickup(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Dropoff Location</label>
                    <input
                        type="text"
                        placeholder="Enter destination"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        value={dropoff}
                        onChange={(e) => setDropoff(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            type="button"
                            onClick={() => setVehicleType('standard')}
                            className={`p-2 text-xs rounded border ${vehicleType === 'standard' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'}`}
                        >
                            Standard
                            <div className="mt-1">🚗</div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setVehicleType('premium')}
                            className={`p-2 text-xs rounded border ${vehicleType === 'premium' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'}`}
                        >
                            Premium
                            <div className="mt-1">🚙</div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setVehicleType('van')}
                            className={`p-2 text-xs rounded border ${vehicleType === 'van' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'}`}
                        >
                            Van
                            <div className="mt-1">🚐</div>
                        </button>
                    </div>
                </div>

                <div className="pt-2">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Estimated Price</span>
                        <span className="font-bold">$15 - $18</span>
                    </div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Request Ride
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RideRequestPanel;
