import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center p-8 bg-white shadow-lg rounded-lg">
        <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
        <p className="text-2xl text-gray-800 mb-4">Page Not Found</p>
        <p className="text-lg text-gray-600 mb-8">
          The page you're looking for doesn't exist or an other error occurred.
        </p>
        <Link
          to="/"
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-300"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
