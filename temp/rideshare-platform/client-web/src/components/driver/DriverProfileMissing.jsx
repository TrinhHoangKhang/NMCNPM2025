import React from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layout/DashboardLayout';

const DriverProfileMissing = () => {
    return (
        <DashboardLayout role="driver" title="Driver Dashboard">
            <div className="min-h-full flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                    <div className="text-4xl mb-4">🚖</div>
                    <h1 className="text-2xl font-bold mb-4 text-gray-800">Driver Profile Required</h1>
                    <p className="text-gray-600 mb-6">
                        You need to register your vehicle and activate your driver account before accessing the dashboard.
                    </p>
                    <Link to="/profile?action=registerDriver" className="inline-block w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 transition">
                        Go to Profile Settings
                    </Link>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DriverProfileMissing;
