import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, Calendar, TrendingUp } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Navbar Placeholder */}
      <nav className="border-b bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-bold text-blue-700 tracking-tighter">Wait4Me <span className="text-slate-900">Driver</span></div>
          <div className="flex gap-4">
            <Button asChild variant="ghost" className="font-medium text-slate-600 hover:text-blue-700">
              <Link to="/login">Log In</Link>
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-200">
              <Link to="/register">Sign Up to Drive</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 pt-16 pb-32 lg:pb-40">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/60" />

        <div className="relative max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
            Drive when you want.<br />
            <span className="text-blue-500">Make what you need.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mb-10">
            Join thousands of drivers earning on their own schedule. No boss, no office, just the open road and reliable earnings.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <Button asChild size="lg" className="h-14 text-lg bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-900/20 w-full">
              <Link to="/register">Become a Driver</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-slate-400">
            Already have an account? <Link to="/login" className="text-blue-400 hover:text-blue-300 underline underline-offset-4">Log in</Link>
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative -mt-24 z-10 max-w-7xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          <BenefitCard
            icon={<Wallet className="w-10 h-10 text-blue-600" />}
            title="Reliable Earnings"
            description="Cash out instantly or receive weekly deposits. See your estimated fare before every trip."
          />
          <BenefitCard
            icon={<Calendar className="w-10 h-10 text-green-600" />}
            title="Flexible Schedule"
            description="You decide when and how often you drive. Offline? No problem. Online? You're earning."
          />
          <BenefitCard
            icon={<TrendingUp className="w-10 h-10 text-purple-600" />}
            title="Growth Opportunities"
            description="Unlock bonuses and rewards as you complete more trips and maintain high ratings."
          />
        </div>
      </div>

      {/* Simple CTA */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to hit the road?</h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">Sign up takes less than 5 minutes. Get verified and start earning as soon as today.</p>
          <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
            <Link to="/register">Start Your Journey</Link>
          </Button>
        </div>
      </div>

      <footer className="bg-slate-50 border-t border-slate-200 py-12 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Wait4Me Driver. Built for partners.</p>
      </footer>
    </div>
  );
};

const BenefitCard = ({ icon, title, description }) => (
  <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
    <CardContent className="p-8">
      <div className="mb-6 p-4 bg-slate-50 rounded-2xl w-fit">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </CardContent>
  </Card>
);

export default Landing;
