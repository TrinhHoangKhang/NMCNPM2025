import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const UserHome = () => {
    const { user } = useContext(AuthContext);

    const menuItems = [
        {
            title: "Book a Ride",
            description: "Go to the map to request a new ride.",
            link: "/map",
            icon: "🚗",
            color: "bg-blue-600"
        },
        {
            title: "Your Trips",
            description: "View your past ride history.",
            link: "/history",
            icon: "📜",
            color: "bg-green-600"
        },
        {
            title: "Profile",
            description: "Manage your account settings.",
            link: "/profile",
            icon: "👤",
            color: "bg-purple-600"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Welcome Section */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Welcome back, {user?.name || user?.username || user?.realName}!
                        </h1>
                        <p className="text-gray-600 mt-2">Where would you like to go today?</p>
                    </div>
                    {user?.profilePicture && (
                        <img
                            src={user.profilePicture}
                            alt="Profile"
                            className="h-16 w-16 rounded-full border-2 border-indigo-500 shadow-sm"
                        />
                    )}
                </div>

                {/* Grid Menu */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {menuItems.map((item, index) => (
                        <Link
                            to={item.link}
                            key={index}
                            className="group block bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                        >
                            <div className={`h-2 bg-gradient-to-r ${item.color.replace('bg-', 'from-').replace('600', '500')} to-${item.color.split('-')[1]}-600`}></div>
                            <div className="p-6">
                                <div className={`w-12 h-12 ${item.color} bg-opacity-10 rounded-lg flex items-center justify-center mb-4 text-2xl`}>
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-gray-500 mt-2 text-sm">
                                    {item.description}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Recent Activity or Promo (Placeholder) */}
                <div className="mt-12 bg-indigo-900 rounded-xl shadow-lg p-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold mb-2">Become a Driver</h2>
                        <p className="text-indigo-200 mb-6 max-w-lg">
                            Earn money on your own schedule. Sign up to drive today and get a $500 bonus after your first 50 rides!
                        </p>
                        <Link
                            to="/profile"
                            className="inline-block bg-white text-indigo-900 font-bold py-3 px-6 rounded-lg hover:bg-indigo-50 transition shadow-md"
                        >
                            Get Started
                        </Link>
                    </div>
                    {/* Decorative Circle */}
                    <div className="absolute -right-10 -bottom-20 w-64 h-64 bg-indigo-700 rounded-full opacity-50"></div>
                </div>
            </div>
        </div>
    );
};

export default UserHome;
