import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const AuthLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link to="/" className="flex justify-center text-3xl font-bold text-gray-900">RideShare</Link>
            </div>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
