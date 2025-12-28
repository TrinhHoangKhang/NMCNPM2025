import React from 'react';
import LocationSearch from '../shared/LocationSearch';

const RideBookingPanel = ({
    activeField,
    setActiveField,
    pickup,
    setPickup,
    dropoff,
    setDropoff,
    route,
    handleRequestRide
}) => {
    return (
        <div className="w-1/3 p-4 z-10 shadow-xl bg-gray-800 flex flex-col gap-4 overflow-y-auto">
            <h1 className="text-2xl font-bold mb-4 text-white">Ride Details</h1>

            <div
                onClick={() => setActiveField('pickup')}
                className={`p-2 rounded transition ${activeField === 'pickup' ? 'bg-gray-600 ring-2 ring-blue-500 shadow-lg' : 'hover:bg-gray-700'}`}
            >
                <label className={`block text-sm font-bold mb-1 ${activeField === 'pickup' ? 'text-white' : 'text-gray-300'}`}>
                    Pickup Location {activeField === 'pickup' && <span className="text-xs text-blue-400 animate-pulse ml-2">(Click map to pin)</span>}
                </label>
                <LocationSearch
                    placeholder="Enter pickup location"
                    onSelect={setPickup}
                    initialValue={pickup?.displayName}
                />
            </div>

            <div
                onClick={() => setActiveField('dropoff')}
                className={`p-2 rounded transition ${activeField === 'dropoff' ? 'bg-gray-600 ring-2 ring-blue-500 shadow-lg' : 'hover:bg-gray-700'}`}
            >
                <label className={`block text-sm font-bold mb-1 ${activeField === 'dropoff' ? 'text-white' : 'text-gray-300'}`}>
                    Dropoff Location {activeField === 'dropoff' && <span className="text-xs text-blue-400 animate-pulse ml-2">(Click map to pin)</span>}
                </label>
                <LocationSearch
                    placeholder="Enter destination"
                    onSelect={setDropoff}
                    initialValue={dropoff?.displayName}
                />
            </div>

            {route && (
                <div className="bg-gray-700 p-4 rounded-lg mt-4 animate-in slide-in-from-bottom duration-500">
                    <h3 className="font-semibold text-lg mb-2 text-white">Trip Details</h3>
                    <p className="text-gray-300">Distance: {(route.distance / 1000).toFixed(2)} km</p>
                    <p className="text-gray-300">Duration: {(route.duration / 60).toFixed(0)} min</p>
                    <p className="text-green-400 font-bold mt-2 text-xl">Est. Fare: ${((route.distance / 1000) * 1.5 + 5).toFixed(2)}</p>
                    <button
                        onClick={handleRequestRide}
                        className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded shadow-lg transition transform hover:scale-[1.02]"
                    >
                        Request Now
                    </button>
                </div>
            )}
        </div>
    );
};

export default RideBookingPanel;
