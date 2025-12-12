import React from 'react';

const ActiveDriversList = ({ drivers }) => {
    return (
        <div className="w-1/4 bg-gray-800 text-white p-4 overflow-y-auto">
            <h2 className="text-xl mb-4 font-bold border-b border-gray-700 pb-2">Active Drivers</h2>
            <ul>
                {Object.keys(drivers).map(id => (
                    <li key={id} className="mb-2 p-2 bg-gray-700 rounded flex items-center justify-between">
                        <span>Driver {id.substr(0, 5)}...</span>
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    </li>
                ))}
                {Object.keys(drivers).length === 0 && <p className="text-gray-400 text-sm">No drivers active</p>}
            </ul>
        </div>
    );
};

export default ActiveDriversList;
