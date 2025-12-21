import React, { useState, useContext } from 'react';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import { AuthContext } from '../../context/AuthContext';

const DashboardLayout = ({ children, role, title, fullWidth = false }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user } = useContext(AuthContext);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
            <DashboardSidebar
                role={role}
                isOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
            />

            {/* Backdrop for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden glass"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <DashboardHeader
                    title={title}
                    toggleSidebar={toggleSidebar}
                    user={user}
                />

                <main className={`flex-1 overflow-auto relative ${fullWidth ? 'p-0' : 'p-6'}`}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
