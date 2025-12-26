import React from 'react';

const UserStatsCard = ({ rating, walletBalance, createdAt }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Overview</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-500 uppercase">Rating</p>
                    <p className="text-xl font-bold text-yellow-500">★ {rating?.toFixed(1) || '5.0'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-500 uppercase">Wallet</p>
                    <p className="text-xl font-bold text-green-600">${walletBalance?.toFixed(2) || '0.00'}</p>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 text-center">Member since {new Date(createdAt).toLocaleDateString()}</p>
            </div>
        </div>
    );
};

export default UserStatsCard;
