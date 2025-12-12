import React from 'react';

const DriverStatusToggle = ({ isOnline, toggleOnline }) => {
    return (
        <div className="flex items-center gap-4 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
            <span className={`text-lg font-medium ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                {isOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
            <button
                onClick={toggleOnline}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isOnline ? 'bg-green-600' : 'bg-gray-200'}`}
            >
                <span className="sr-only">Toggle Online Status</span>
                <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isOnline ? 'translate-x-5' : 'translate-x-0'}`}
                />
            </button>
        </div>
    );
};

export default DriverStatusToggle;
