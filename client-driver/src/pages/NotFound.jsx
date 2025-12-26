import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="text-9xl font-bold text-indigo-600 mb-4 animate-bounce">404</div>
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                    Page Not Found
                </h2>
                <p className="mt-2 text-sm text-gray-600 max-w">
                    Sorry, we couldn't find the page you're looking for.
                </p>
                <div className="mt-8">
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                        Go back to Dashboard
                    </Link>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
                    <p className="text-gray-500 text-sm italic">
                        "Not all who wander are lost... but this page definitely is."
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
