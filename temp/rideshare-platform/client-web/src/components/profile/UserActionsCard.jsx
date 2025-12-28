import React from 'react';

const UserActionsCard = ({ role, onBecomeDriver }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions</h3>
            <div className="space-y-3">
                {role !== 'driver' ? (
                    <button onClick={onBecomeDriver} className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-sm flex items-center justify-center gap-2">
                        <span>🚗</span> Become a Driver
                    </button>
                ) : (
                    <div className="w-full py-2 px-4 bg-green-50 text-green-700 rounded-lg border border-green-200 font-medium flex items-center justify-center gap-2">
                        <span>✅</span> You are a Driver
                    </div>
                )}
                <button className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium flex items-center justify-center gap-2">
                    <span>🔒</span> Change Password
                </button>
            </div>
        </div>
    );
};

export default UserActionsCard;
