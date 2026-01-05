import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lock } from 'lucide-react';

const Landing = () => {
  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 justify-center items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" />
        <div className="relative z-10 text-white p-12 max-w-lg">
          <div className="mb-6 p-4 bg-white/10 w-fit rounded-2xl backdrop-blur-sm border border-white/10">
            <Lock className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold mb-6">Admin Control Center</h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Manage users, monitor trips, and oversee system operations from a centralized secure dashboard.
          </p>
        </div>
        {/* Decorative Pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Right Side - Action */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
            <p className="text-slate-500 mt-2">Please authenticate to access the admin portal.</p>
          </div>

          <Card className="border-0 shadow-lg ring-1 ring-slate-200">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Authentication Required</CardTitle>
              <CardDescription>
                Access to this portal is restricted to authorized personnel only.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 pt-4">
              <Button asChild size="lg" className="w-full bg-slate-900 hover:bg-slate-800 h-11 text-base">
                <Link to="/login">Secure Login</Link>
              </Button>
              <div className="text-center text-xs text-slate-400 mt-2">
                By logging in, you agree to the internal data handling protocols.
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-slate-400">
            Wait4Me Admin System v1.0.0
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
