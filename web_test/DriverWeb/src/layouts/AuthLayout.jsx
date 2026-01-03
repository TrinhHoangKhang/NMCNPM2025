import { Outlet } from 'react-router-dom';
import { Car } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-blue-600 text-white p-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <Car className="h-16 w-16 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Drive with RideGo</h1>
          <p className="text-lg text-blue-100 max-w-md">
            Join our community of drivers. Earn money on your own schedule with flexible hours and instant payouts.
          </p>
        </div>
      </div>

      {/* Right Side - Form Content */}
      <div className="flex flex-col justify-center items-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;