import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
    LayoutDashboard,
    Package,
    Users,
    LogOut
} from 'lucide-react';

export default function Navbar() {
    const location = useLocation();
    const { logout } = useAuth();

    const navItems = [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Riders', href: '/riders', icon: Users },
        { label: 'Drivers', href: '/drivers', icon: Users },
        { label: 'Admins', href: '/admins', icon: Users },
        { label: 'Trips', href: '/trips', icon: Package },
    ];

    return (
        <nav className="bg-white border-b border-gray-200 px-4 py-2.5">
            <div className="flex flex-wrap justify-between items-center mx-auto">
                <Link to="/dashboard" className="flex items-center">
                    <span className="self-center text-xl font-semibold whitespace-nowrap text-gray-800">
                        RideGo Admin
                    </span>
                </Link>
                <div className="hidden w-full md:block md:w-auto">
                    <ul className="flex flex-col p-4 mt-4 bg-gray-50 rounded-lg border border-gray-100 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:border-0 md:bg-white">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <li key={item.label}>
                                    <Link
                                        to={item.href}
                                        className={`flex items-center gap-1 py-2 pr-4 pl-3 rounded md:p-0 transition-colors ${isActive
                                                ? 'text-blue-700 font-bold'
                                                : 'text-gray-700 hover:text-blue-700'
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
                <div className="flex items-center">
                    <button
                        onClick={logout}
                        className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Log Out
                    </button>
                </div>
            </div>
        </nav>
    );
}
