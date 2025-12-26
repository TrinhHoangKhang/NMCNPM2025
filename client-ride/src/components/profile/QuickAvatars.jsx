import React from 'react';

const QuickAvatars = ({ onAvatarSelect }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Quick Avatars</h3>
            <div className="flex flex-wrap gap-2">
                {["Felix", "Aneka", "Bob", "Willow", "Jack"].map((seed) => (
                    <img
                        key={seed}
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
                        className="w-10 h-10 rounded-full cursor-pointer hover:scale-110 transition border"
                        onClick={() => onAvatarSelect(`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`)}
                        alt={seed}
                    />
                ))}
            </div>
        </div>
    );
};

export default QuickAvatars;
