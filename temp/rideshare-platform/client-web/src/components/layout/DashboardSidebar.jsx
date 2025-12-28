import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const DashboardSidebar = ({ role, isOpen, toggleSidebar }) => {
    const location = useLocation();
    const { logout } = useContext(AuthContext);

    const commonLinks = [
        { name: 'Profile', path: '/profile', icon: '👤' },
    ];

    const roleLinks = {
        user: [
            { name: 'Ride', path: '/map', icon: '🚗' },
            { name: 'Trips', path: '/history', icon: '📜' },
        ],
        driver: [
            { name: 'Dashboard', path: '/driver-dashboard', icon: '📊' },
            { name: 'History', path: '/history', icon: '📜' },
            { name: 'Vehicle', path: '/profile?tab=vehicle', icon: '🚙' },
        ],
        admin: [
            { name: 'Overview', path: '/admin-dashboard', icon: '📈' },
            { name: 'Users', path: '/admin/users', icon: '👥' },
            { name: 'Rides', path: '/admin/rides', icon: '🚖' },
        ]
    };

    const links = [...(roleLinks[role] || []), ...commonLinks];

    return (
        <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:inset-auto md:flex md:flex-col md:h-screen shadow-xl`}>
            {/* Logo Area */}
            <div className="flex items-center justify-between h-16 px-6 bg-gray-950 border-b border-gray-800">
                <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                    RideShare
                </Link>
                <button onClick={toggleSidebar} className="md:hidden text-gray-400 hover:text-white">
                    ✕
                </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                <div className="mb-6 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Menu
                </div>
                {links.map((link) => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 group ${location.pathname === link.path
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`}
                    >
                        <span className="mr-3 text-xl group-hover:scale-110 transition-transform">{link.icon}</span>
                        <span className="font-medium">{link.name}</span>
                    </Link>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-gray-800 bg-gray-900">
                <button
                    onClick={logout}
                    className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-400 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors"
                >
                    <span className="mr-3">🚪</span>
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default DashboardSidebar;
