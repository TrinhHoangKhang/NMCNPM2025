import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';

const MainLayout = () => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
            <Header />

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
};

export default MainLayout;
