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

    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    return (
        <header className="bg-white h-16 shadow-sm z-10 sticky top-0">
            <div className="flex items-center justify-between px-6 h-full">
                <div className="flex items-center gap-8">
                    {/* Title / Brand */}
                    <h2 className="text-xl font-semibold text-gray-800 capitalize">
                        {import.meta.env.VITE_INSTANCE_TYPE === 'user' ? 'App' :
                            import.meta.env.VITE_INSTANCE_TYPE === 'driver' ? 'Driver' :
                                import.meta.env.VITE_INSTANCE_TYPE === 'admin' ? 'Admin' : 'RideShare'}
                    </h2>

                    {/* Top Navigation - Desktop */}
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
                    {/* Desktop/Tablet User Profile */}
                    {user && (
                        <div className="hidden md:flex items-center gap-4">
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
                        </div>
                    )}

                    {!user && (
                        <div className="hidden md:flex space-x-2">
                            <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900">Login</Link>
                        </div>
                    )}

                    {/* Mobile Hamburger Button */}
                    <div className="flex md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 focus:outline-none"
                        >
                            <span className="sr-only">Open main menu</span>
                            {/* Icon when menu is closed. */}
                            {!isMobileMenuOpen ? (
                                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                </svg>
                            ) : (
                                /* Icon when menu is open. */
                                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white absolute w-full shadow-lg">
                    <div className="space-y-1 px-4 py-3">
                        {items.map((item) => (
                            <Link
                                key={item.label}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive(item.path)}`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {user ? (
                        <div className="border-t border-gray-100 px-4 py-3">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold overflow-hidden">
                                    {user.photoURL || user.profilePicture ? (
                                        <img src={user.photoURL || user.profilePicture} alt="Profile" className="h-full w-full object-cover" />
                                    ) : (
                                        (user.displayName || user.realName || user.username || 'U')[0].toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <div className="text-base font-medium text-gray-800">{user.displayName || user.realName || user.username}</div>
                                    <div className="text-xs text-gray-500">{user.email}</div>
                                </div>
                            </div>
                            <button
                                onClick={logout}
                                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="border-t border-gray-100 px-4 py-3 space-y-2">
                            <Link
                                to="/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Login
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
};

export default Header;
