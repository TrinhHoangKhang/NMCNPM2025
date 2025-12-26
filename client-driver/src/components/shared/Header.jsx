import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { formatTimeAgo } from '../../utils/formatters';

const Header = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50';
    };

    const NAV_ITEMS = {
        rider: [
            { label: 'Home', path: '/home' },
            { label: 'Map', path: '/map' },
            { label: 'History', path: '/history' },
            { label: 'Profile', path: '/profile' }
        ],
        driver: [
            { label: 'Dashboard', path: '/driver' },
            { label: 'History', path: '/driver/history' },
            { label: 'Profile', path: '/profile' }
        ],
        admin: [
            { label: 'Users', path: '/users' },
            { label: 'System Logs', path: '/history' },
            { label: 'Profile', path: '/profile' }
        ],
        public: []
    };

    const currentRole = user?.role || 'public';
    const items = user ? (NAV_ITEMS[currentRole] || []) : [];

    return (
        <header className="bg-white h-16 shadow-sm z-10 flex items-center justify-between px-6 sticky top-0">
            <div className="flex items-center gap-8">
                {/* Title / Brand */}
                <h2 className="text-xl font-semibold text-gray-800 capitalize hidden md:block">
                    {import.meta.env.VITE_INSTANCE_TYPE === 'user' ? 'App' :
                        import.meta.env.VITE_INSTANCE_TYPE === 'driver' ? 'Driver' :
                            import.meta.env.VITE_INSTANCE_TYPE === 'admin' ? 'Admin' : 'Dashboard'}
                </h2>

                {/* Top Navigation */}
                <nav className="hidden md:flex items-center space-x-1">
                    {items.map((item) => (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(item.path)}`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="flex items-center gap-4">
                {user && (
                    <>
                        <div className="flex flex-col text-right hidden sm:block">
                            <span className="text-sm font-medium text-gray-900">{user.displayName || user.realName || user.username || user.email}</span>
                            <div className="flex items-center justify-end gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${user.is_online ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                <span className="text-xs text-gray-500 capitalize">
                                    {user.role} - {user.is_online ? 'Online' : `Last seen ${formatTimeAgo(user.last_seen_at?.toDate ? user.last_seen_at.toDate() : user.last_seen_at)}`}
                                </span>
                            </div>
                        </div>

                        <div className="relative">
                            {/* Avatar placeholder */}
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold overflow-hidden">
                                {user.photoURL || user.profilePicture ? (
                                    <img src={user.photoURL || user.profilePicture} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    (user.displayName || user.realName || user.username || 'U')[0].toUpperCase()
                                )}
                            </div>
                        </div>

                        <button
                            onClick={logout}
                            className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border border-red-200"
                        >
                            Logout
                        </button>
                    </>
                )}

                {!user && (
                    <div className="space-x-2">
                        <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900">Login</Link>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
