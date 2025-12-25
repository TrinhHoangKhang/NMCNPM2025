import React from 'react';

const SearchingOverlay = ({ onCancel }) => {
    return (
        <div className="absolute inset-0 z-[2000] bg-black bg-opacity-80 flex flex-col items-center justify-center text-center p-6">
            <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-blue-500 mb-8 shadow-[0_0_20px_rgba(59,130,246,0.5)]"></div>
            <h2 className="text-3xl font-bold text-white mb-2 animate-pulse">Searching for Drivers...</h2>
            <p className="text-gray-400 max-w-md">We are broadcasting your request to nearby drivers. Please wait while we find you a ride.</p>
            <button
                onClick={onCancel}
                className="mt-8 px-6 py-2 border border-gray-600 rounded-full text-gray-400 hover:text-white hover:border-white transition"
            >
                Cancel Request
            </button>
            <div className="mt-12 opacity-50 text-sm">
                <p>Keep this window open</p>
            </div>
        </div>
    );
};

export default SearchingOverlay;
