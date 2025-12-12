import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';

const AdminLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-100 font-sans">
            <Navbar />
            <main className="flex-grow relative">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
