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
    estimate,
    vehicleType,
    setVehicleType,
    paymentMethod,
    setPaymentMethod,
    handleRequestRide
}) => {
    const nearbyDrivers = estimate?.nearbyDrivers || [];
    return (
        <div className="w-full md:w-1/3 h-auto md:h-full p-4 z-10 shadow-xl bg-gray-800 flex flex-col gap-4 overflow-y-auto order-2 md:order-1 border-t md:border-t-0 md:border-r border-gray-700">
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

            {/* Selection Controls */}
            <div className="flex flex-col gap-4 mt-2">
                <div className="bg-gray-700 p-3 rounded-lg border border-gray-600">
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Vehicle Type</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['MOTORBIKE', '4 SEAT', '7 SEAT'].map(v => (
                            <button
                                key={v}
                                onClick={() => setVehicleType(v)}
                                className={`py-2 px-1 text-[10px] font-bold rounded transition border ${vehicleType === v ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-750'}`}
                            >
                                {v}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-700 p-3 rounded-lg border border-gray-600">
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Payment Method</label>
                    <div className="grid grid-cols-2 gap-2">
                        {['CASH', 'WALLET'].map(p => (
                            <button
                                key={p}
                                onClick={() => setPaymentMethod(p)}
                                className={`py-2 px-1 text-[10px] font-bold rounded transition border ${paymentMethod === p ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-750'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {estimate && (
                <div className="bg-gray-700 p-4 rounded-lg mt-4 animate-in slide-in-from-bottom duration-500">
                    <h3 className="font-semibold text-lg mb-2 text-white">Trip Details</h3>
                    <div className="space-y-1 text-sm">
                        <p className="text-gray-300 flex justify-between">
                            <span>Distance:</span>
                            <span className="text-white">{(estimate.distance / 1000).toFixed(1)} km</span>
                        </p>
                        <p className="text-gray-300 flex justify-between">
                            <span>Est. Duration:</span>
                            <span className="text-white">{Math.round(estimate.duration / 60)} mins</span>
                        </p>
                    </div>

                    <p className="text-green-400 font-bold mt-4 text-2xl text-center">
                        ${estimate.fare.toFixed(2)}
                    </p>

                    {nearbyDrivers.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-600">
                            <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Nearby Drivers</h4>
                            <div className="space-y-2">
                                {nearbyDrivers.slice(0, 3).map(driver => (
                                    <div key={driver.id} className="flex justify-between items-center bg-gray-600/50 p-2 rounded">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-white text-sm font-medium">{driver.name}</span>
                                        </div>
                                        <span className="text-blue-400 text-xs font-bold">
                                            {driver.eta?.text || 'Nearby'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleRequestRide}
                        className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded shadow-lg transition transform hover:scale-[1.02]"
                    >
                        Order Ride
                    </button>
                </div>
            )}
        </div>
    );
};

export default RideBookingPanel;
