import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white';
    };

    const NAV_ITEMS = {
        rider: [
            { label: 'Home', path: '/home' },
            { label: 'Order', path: '/map' },
            { label: 'History', path: '/history' },
            { label: 'Profile', path: '/profile' }
        ],
        driver: [
            { label: 'Home', path: '/home' },
            { label: 'Work', path: '/driver' },
            { label: 'History', path: '/history' },
            { label: 'Profile', path: '/profile' }
        ],
        admin: [
            { label: 'Home', path: '/home' },
            { label: 'List', path: '/users' },
            { label: 'Log', path: '/history' }, // Placeholder for system logs
            { label: 'Profile', path: '/profile' }
        ],
        public: [] // Public users see Login/Register on the right side
    };

    // Determine which items to show
    const currentRole = user?.role || 'public';
    // Fallback for non-logged in users who might not match 'rider'/'driver'/'admin' strictly if data is weird, 
    // but 'user' null check handles public.
    const items = user ? (NAV_ITEMS[currentRole] || NAV_ITEMS.rider) : NAV_ITEMS.public;

    return (
        <nav className="bg-gray-800">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <Link to="/" className="text-white font-bold text-xl">RideShare</Link>
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                {user && items.map((item) => (
                                    <Link
                                        key={item.label}
                                        to={item.path}
                                        className={`rounded-md px-3 py-2 text-sm font-medium ${isActive(item.path)}`}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="hidden md:block">
                <div className="ml-4 flex items-center md:ml-6">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-gray-300 text-sm">Welcome, {user.username} ({user.role})</span>
                            <button
                                onClick={logout}
                                className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="space-x-4">
                            <Link to="/login" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">Login</Link>
                            <Link to="/register" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Register</Link>
                        </div>
                    )}
                </div>
            </div >
        </nav >
    );
};

export default Navbar;
