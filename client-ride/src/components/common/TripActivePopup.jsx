import React from 'react';
import { useSocket } from '../../context/SocketContext';

const TripActivePopup = ({ role }) => {
    const { isConnected, disconnectSocket, socket } = useSocket();

    if (!isConnected) return null;

    return (
        <div className="fixed bottom-4 right-4 bg-white border border-green-500 shadow-xl rounded-lg p-4 z-50 flex flex-col gap-2 max-w-sm animate-fade-in-up">
            <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <h3 className="font-bold text-gray-800">
                    {role === 'driver' ? 'You are Online' : 'Finding your Ride...'}
                </h3>
            </div>
            <p className="text-sm text-gray-600">
                {role === 'driver'
                    ? 'Connected to dispatch server. Waiting for requests.'
                    : 'Connected to server. Looking for nearby drivers.'}
            </p>
            {socket && socket.id && (
                <p className="text-xs text-gray-400 font-mono">ID: {socket.id}</p>
            )}
            <button
                onClick={disconnectSocket}
                className="mt-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-1 px-3 rounded text-sm font-medium transition-colors"
            >
                Disconnect
            </button>
        </div>
    );
};

export default TripActivePopup;
