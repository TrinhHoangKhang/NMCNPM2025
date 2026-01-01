import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, CreditCard, Star, Clock, ArrowUpRight, TrendingUp, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { tripService } from "@/services/tripService";

export default function Dashboard() {
    const [currentTrip, setCurrentTrip] = useState(null);

    useEffect(() => {
        const fetchCurrentTrip = async () => {
            try {
                const trip = await tripService.getCurrentTrip();
                // Only show if trip is active (not completed)
                if (trip && ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'PICKUP', 'ARRIVED'].includes(trip.status)) {
                    setCurrentTrip(trip);
                }
            } catch (error) {
                console.error("Failed to fetch current trip", error);
            }
        };
        fetchCurrentTrip();
    }, []);
    const stats = [
        {
            title: "Total Trips",
            value: "24",
            change: "+4 from last month",
            icon: MapPin,
            color: "text-blue-600",
            bg: "bg-blue-100",
        },
        {
            title: "Total Spent",
            value: "1,250,000 ₫",
            change: "+12% from last month",
            icon: CreditCard,
            color: "text-green-600",
            bg: "bg-green-100",
        },
        {
            title: "Average Rating",
            value: "4.9",
            change: "Consistently high",
            icon: Star,
            color: "text-yellow-600",
            bg: "bg-yellow-100",
        },
        {
            title: "Ride Hours",
            value: "18.5",
            change: "Total time in rides",
            icon: Clock,
            color: "text-purple-600",
            bg: "bg-purple-100",
        },
    ];

    const recentActivity = [
        {
            id: 1,
            pickup: "University of Science",
            dropoff: "Ben Thanh Market",
            date: "Today, 10:30 AM",
            price: "45,000 ₫",
            status: "Completed",
        },
        {
            id: 2,
            pickup: "Landmark 81",
            dropoff: "Bitexco Tower",
            date: "Yesterday, 08:15 PM",
            price: "62,000 ₫",
            status: "Completed",
        },
        {
            id: 3,
            pickup: "District 7 Lotte Mart",
            dropoff: "RMIT University",
            date: "Dec 28, 02:45 PM",
            price: "38,000 ₫",
            status: "Cancelled",
        },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-slate-50/50">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-8 rounded-b-3xl shadow-lg mb-8">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back, Rider!</h1>
                        <p className="text-indigo-100 text-lg">Ready for your next journey?</p>
                    </div>
                    <Link to="/map">
                        <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50 font-semibold shadow-md transition-all hover:scale-105">
                            Book a Ride Now <ArrowUpRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                </div>

                {/* Decorative Circles */}
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <div className="w-64 h-64 rounded-full border-8 border-white"></div>
                </div>
                <div className="absolute bottom-0 left-10 p-4 opacity-10">
                    <div className="w-32 h-32 rounded-full bg-white blur-xl"></div>
                </div>
            </div>

            <div className="px-6 pb-8 space-y-8 max-w-7xl mx-auto w-full">

                {/* Active Trip Card */}
                {currentTrip && (
                    <Card className="border-l-4 border-l-indigo-600 shadow-md animate-in slide-in-from-top-4 duration-500">
                        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center animate-pulse">
                                    <MapPin className="h-6 w-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        Current Trip
                                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                                            {currentTrip.status.replace('_', ' ')}
                                        </span>
                                    </h3>
                                    <p className="text-slate-500 text-sm mt-1">
                                        To: <span className="font-medium text-slate-700">{currentTrip.dropoffLocation?.address}</span>
                                    </p>
                                </div>
                            </div>
                            <Link to={`/trip/${currentTrip.id}`}>
                                <Button className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700">
                                    View Trip Details <ArrowUpRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}

                {/* Stats Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={index} className="border-none shadow-md hover:shadow-lg transition-shadow duration-300">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className={`p-4 rounded-full ${stat.bg} ${stat.color} shrink-0`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                                        <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                                        <p className="text-xs text-emerald-600 flex items-center font-medium mt-1">
                                            <TrendingUp className="h-3 w-3 mr-1" /> {stat.change}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Content Section: Activity & map promo or something else */}
                <div className="grid gap-6 md:grid-cols-3">

                    {/* Recent Activity */}
                    <Card className="md:col-span-2 border-none shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xl font-bold text-slate-800">Recent Activity</CardTitle>
                            <Button variant="ghost" size="sm" className="text-indigo-600">View All</Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {recentActivity.map((trip) => (
                                    <div key={trip.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-100 last:border-0">
                                        <div className="flex items-start gap-4">
                                            <div className="mt-1 bg-indigo-50 p-2 rounded-full">
                                                <MapPin className="h-5 w-5 text-indigo-600" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="font-semibold text-slate-800 flex items-center gap-2">
                                                    {trip.dropoff}
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${trip.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {trip.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-500">From: {trip.pickup}</p>
                                                <p className="text-xs text-slate-400 flex items-center">
                                                    <Clock className="h-3 w-3 mr-1" /> {trip.date}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right sm:self-center">
                                            <div className="font-bold text-slate-900">{trip.price}</div>
                                            <div className="text-xs text-slate-500">RideGo Bike</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Safety / Promo Card */}
                    <div className="space-y-6">
                        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-none shadow-lg overflow-hidden relative">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <ShieldCheck className="h-6 w-6" /> Safety First
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 relative z-10">
                                <p className="text-emerald-50">Share your trip status with loved ones for a safe journey.</p>
                                <Button variant="secondary" className="w-full text-emerald-700 font-bold hover:bg-emerald-50">
                                    Manage Trusted Contacts
                                </Button>
                            </CardContent>
                            {/* Decor */}
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                        </Card>

                        <Card className="border-none shadow-md">
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-3">
                                <Button variant="outline" className="h-20 flex flex-col gap-2 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition-all">
                                    <CreditCard className="h-6 w-6" />
                                    Wallet
                                </Button>
                                <Button variant="outline" className="h-20 flex flex-col gap-2 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition-all">
                                    <Star className="h-6 w-6" />
                                    Rewards
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
