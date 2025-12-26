import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const DashboardHeader = ({ title, toggleSidebar, user }) => {
    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-20 shadow-sm relative">
            <div className="flex items-center gap-4">
                <button onClick={toggleSidebar} className="md:hidden text-gray-500 hover:text-gray-700 p-1">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <h2 className="text-xl font-bold text-gray-800 truncate">{title}</h2>
            </div>

            <div className="flex items-center gap-4">
                {/* Notifications (Placeholder) */}
                <button className="text-gray-400 hover:text-gray-600 relative">
                    <span className="sr-only">Notifications</span>
                    🔔
                    {/* Badge example */}
                    {/* <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" /> */}
                </button>

                {/* Vertical Divider */}
                <div className="h-6 w-px bg-gray-300 mx-1"></div>

                {/* User Profile */}
                <Link to="/profile" className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-gray-900 leading-none">{user?.name || user?.username || user?.realName || 'User'}</p>
                        <p className="text-xs text-gray-500 mt-1 capitalize">{user?.role}</p>
                    </div>
                    <img
                        className="h-9 w-9 rounded-full object-cover border-2 border-indigo-100 shadow-sm"
                        src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.name || user?.username || 'User'}&background=random`}
                        alt="User"
                    />
                </Link>
            </div>
        </header>
    );
};

export default DashboardHeader;
