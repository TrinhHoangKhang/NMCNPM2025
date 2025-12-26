import React, { useState, useEffect } from 'react';

const DriverRequestCard = ({ request, onAccept, onDecline }) => {
    const [timeLeft, setTimeLeft] = useState(10);

    useEffect(() => {
        const interval = setInterval(() => {
            const seconds = Math.ceil((request.expiresAt - Date.now()) / 1000);
            setTimeLeft(seconds > 0 ? seconds : 0);
        }, 100);
        return () => clearInterval(interval);
    }, [request.expiresAt]);

    return (
        <div className="bg-white border border-blue-200 rounded-lg shadow-sm p-4 animate-in slide-in-from-right duration-300 relative overflow-hidden">
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 h-1 bg-blue-500 transition-all duration-1000 ease-linear" style={{ width: `${(timeLeft / 10) * 100}%` }}></div>

            <div className="flex justify-between items-start mt-2">
                <div>
                    <div className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded mb-2">
                        {request.distance} away
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">New Rider</h3>
                    <p className="text-gray-600 text-sm mt-1 max-w-md truncate">Pickup: {request.pickup}</p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{request.fare}</div>
                    <div className="text-xs text-gray-400 font-mono mt-1">{timeLeft}s remaining</div>
                </div>
            </div>

            <div className="flex gap-3 mt-4">
                <button onClick={onDecline} className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 font-semibold rounded hover:bg-gray-200 transition">
                    Ignore
                </button>
                <button onClick={onAccept} className="flex-1 py-2 px-4 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition shadow-md">
                    Accept Ride
                </button>
            </div>
        </div>
    );
};

export default DriverRequestCard;
