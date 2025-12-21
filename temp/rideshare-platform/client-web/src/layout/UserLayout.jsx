import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';

const UserLayout = () => {
    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            <Navbar />
            <main>
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 py-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default UserLayout;
