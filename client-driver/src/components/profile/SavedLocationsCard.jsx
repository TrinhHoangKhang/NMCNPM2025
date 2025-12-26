import React from 'react';

const SavedLocationsCard = ({ savedLocations }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Saved Locations</h3>
            {savedLocations && savedLocations.length > 0 ? (
                <ul className="space-y-2">
                    {savedLocations.map((loc, idx) => (
                        <li key={idx} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded border border-transparent hover:border-gray-200 transition">
                            <div className="flex items-center gap-3">
                                <span className="text-xl">📍</span>
                                <div>
                                    <p className="font-medium text-gray-900">{loc.label}</p>
                                    <p className="text-xs text-gray-500">{loc.address}</p>
                                </div>
                            </div>
                            <button className="text-red-400 hover:text-red-600">✕</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                    <p className="text-gray-400 text-sm">No saved locations yet.</p>
                    <button className="mt-2 text-indigo-600 text-sm font-medium hover:underline">+ Add New</button>
                </div>
            )}
        </div>
    );
};

export default SavedLocationsCard;
