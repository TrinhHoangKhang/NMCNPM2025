import { Outlet } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Left Side - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-zinc-900 text-white p-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900" />
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <ShieldCheck className="h-16 w-16 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Admin Portal</h1>
          <p className="text-lg text-zinc-400 max-w-md">
            Manage your fleet, monitor trips, and oversee the entire RideGo platform from one central hub.
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