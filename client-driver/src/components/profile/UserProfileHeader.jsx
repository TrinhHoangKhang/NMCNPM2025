import React from 'react';

const UserProfileHeader = ({ username, realName, role, profilePicture, onAvatarSelect }) => {
    return (
        <div className="relative mb-8">
            <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg"></div>
            <div className="absolute bottom-[-3rem] left-8 flex items-end">
                <div className="relative group">
                    <img
                        src={profilePicture || `https://ui-avatars.com/api/?name=${username}&background=random`}
                        alt="Profile"
                        className="w-32 h-32 rounded-full border-4 border-white shadow-xl bg-white object-cover"
                    />
                    <button
                        className="absolute bottom-0 right-0 bg-gray-800 text-white p-1 rounded-full p-2 text-xs opacity-0 group-hover:opacity-100 transition"
                        onClick={() => { const url = prompt("Image URL:"); if (url) onAvatarSelect(url); }}
                    >
                        📷
                    </button>
                </div>
                <div className="ml-5 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{realName || username}</h1>
                    <div className="flex items-center gap-2 text-gray-600">
                        <span className="text-sm">@{username}</span>
                        <span className={`px-2 py-0.5 rounded text-xs uppercase font-bold tracking-wide ${role === 'driver' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                            {role}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfileHeader;
