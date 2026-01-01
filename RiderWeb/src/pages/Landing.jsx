import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, ShieldCheck, Clock } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-indigo-500 selection:text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 opacity-20" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-30" />
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-indigo-500 rounded-full blur-3xl opacity-20" />

        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32 lg:py-48 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-4 py-1.5 rounded-full text-sm font-medium mb-8 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Available 24/7 in Ho Chi Minh City
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
            Your Ride, <span className="text-indigo-500">Reimagined.</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
            Fast, reliable, and safe transportation at your fingertips. Experience the future of ride-hailing today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <Button asChild size="lg" className="h-12 text-lg bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-900/20">
              <Link to="/register">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 text-lg border-slate-700 bg-transparent text-white hover:bg-white/10 hover:text-white backdrop-blur-sm">
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Clock className="w-8 h-8 text-indigo-400" />}
            title="Quick Pickups"
            description="Our smart matching algorithm gets you a driver in minutes, not hours."
          />
          <FeatureCard
            icon={<ShieldCheck className="w-8 h-8 text-purple-400" />}
            title="Safe & Secure"
            description="Verified drivers and real-time tracking for your peace of mind."
          />
          <FeatureCard
            icon={<MapPin className="w-8 h-8 text-pink-400" />}
            title="Best Routes"
            description="We optimize every trip to get you to your destination faster."
          />
        </div>
      </div>

      <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        &copy; {new Date().getFullYear()} Wait4Me. All rights reserved.
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur hover:bg-slate-800 transition-colors">
    <CardContent className="p-8">
      <div className="mb-6 p-4 bg-slate-900/50 rounded-2xl w-fit border border-slate-700/50">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </CardContent>
  </Card>
);

export default Landing;
