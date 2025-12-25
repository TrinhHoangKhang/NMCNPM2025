import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-200 py-4 px-6">
            <div className="flex justify-between items-center text-sm text-gray-500">
                <p>&copy; {new Date().getFullYear()} RideShare Platform. All rights reserved.</p>
                <div className="space-x-4">
                    <a href="#" className="hover:text-gray-900">Privacy Policy</a>
                    <a href="#" className="hover:text-gray-900">Terms of Service</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
