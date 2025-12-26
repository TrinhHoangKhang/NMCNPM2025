import React from 'react';
import DriverRequestCard from './DriverRequestCard';

const DriverRequestList = ({ requests, isOnline, toggleOnline, onAccept, onDecline }) => {
    return (
        <div className="animate-in fade-in duration-300">
            {!isOnline ? (
                <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <div className="text-4xl mb-3">😴</div>
                    <p className="text-lg">You are currently offline.</p>
                    <button onClick={toggleOnline} className="mt-4 text-indigo-600 font-semibold hover:underline">
                        Go Online to see requests
                    </button>
                </div>
            ) : requests.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <div className="text-4xl mb-3">📡</div>
                    <p>Scanning for nearby rides...</p>
                    <p className="text-sm text-gray-400 mt-2">New requests will appear here instantly.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map(req => (
                        <DriverRequestCard
                            key={req.id}
                            request={req}
                            onAccept={() => onAccept(req.id)}
                            onDecline={() => onDecline(req.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default DriverRequestList;
