import React from 'react';

const LoadingScreen = ({ message = 'Loading...' }) => {
    return (
        <div className="fixed inset-0 bg-gray-50 flex flex-col items-center justify-center z-50">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700 animate-pulse">{message}</h2>
        </div>
    );
};

export default LoadingScreen;
