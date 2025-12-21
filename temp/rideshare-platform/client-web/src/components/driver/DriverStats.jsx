import React from 'react';

const DriverStats = ({ isOnline }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium">Daily Earnings</h3>
                <p className="text-2xl font-bold text-gray-900">$125.50</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium">Trips Today</h3>
                <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm font-medium">Rating</h3>
                <p className="text-2xl font-bold text-gray-900">4.9 ★</p>
            </div>
            {!isOnline && (
                <div className="col-span-3 mt-4 p-4 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200 text-center">
                    You are offline. Go Online to start receiving ride requests.
                </div>
            )}
        </div>
    );
};

export default DriverStats;
