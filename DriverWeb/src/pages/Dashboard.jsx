import React, { useEffect, useState } from 'react';
import { useDriver } from "@/context";
import { tripService } from "@/services/tripService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/useToast";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import {
  MapPin,
  DollarSign,
  TrendingUp,
  Car,
  Calendar,
  Power,
  ArrowUpRight,
  Navigation,
  Loader2
} from 'lucide-react';

export default function Dashboard() {
  const { currentTrip, loading, formatTime, isOnline, timeLeft, toggleStatus, trips, setCurrentTrip } = useDriver();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [stats, setStats] = useState({ earnings: 0, trips: 0, rating: 4.9 });
  const [recentTrips, setRecentTrips] = useState([]);

  const handleAccept = async (id) => {
    try {
      const trip = await tripService.acceptTrip(id);
      showToast("Success", "Trip accepted!", "success");
      setCurrentTrip(trip);
      // Already on dashboard, layout updates automatically
    } catch (e) {
      showToast("Error", "Failed to accept trip", "error");
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const history = await tripService.getDriverHistory();
      if (Array.isArray(history)) {
        // Calculate Today's Stats
        const today = new Date().toDateString();
        const todaysTrips = history.filter(t => new Date(t.completedAt).toDateString() === today);

        const earnings = todaysTrips.reduce((acc, t) => acc + (t.fare || 0), 0);

        setStats({
          earnings: earnings,
          trips: todaysTrips.length,
          rating: 4.9
        });
        setRecentTrips(history.slice(0, 3));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen text-slate-500">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
      <p className="font-medium animate-pulse">Loading Dashboard...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 bg-slate-50 min-h-screen">

      {/* HEADER & STATUS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 flex items-center gap-2 mt-1">
            <Calendar className="w-4 h-4" /> {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <Card className={`border-2 ${isOnline ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-white'} transition-colors`}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className={`p-3 rounded-full ${isOnline ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
              <Power className="w-6 h-6" />
            </div>
            <div>
              <div className="font-semibold text-lg">{isOnline ? 'On Working' : 'Not Working'}</div>
              <div className="text-sm text-slate-500">{isOnline ? `Auto-offline in: ${formatTime(timeLeft)}` : 'Switch on to receive jobs'}</div>
            </div>
            <Switch
              checked={isOnline}
              onCheckedChange={toggleStatus}
              className="ml-2 scale-125 data-[state=checked]:bg-green-600"
            />
          </CardContent>
        </Card>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Today's Earnings</CardTitle>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.earnings.toLocaleString()} VND</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" /> +0% from yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Completed Trips</CardTitle>
            <Car className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.trips}</div>
            <p className="text-xs text-slate-500 mt-1">Trips today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Driver Rating</CardTitle>
            <div className="w-4 h-4 text-yellow-400 fill-yellow-400">★</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rating}</div>
            <p className="text-xs text-slate-500 mt-1">Average rating</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: ACTIVE TRIP OR JOBS CTA */}
        <div className="lg:col-span-2 space-y-8">

          {/* SECTION 1: CURRENT ACTIVITY (Active Trip OR None) */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Current Activity</h2>
            {currentTrip ? (
              <Card className="border-l-4 border-l-blue-500 shadow-md">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl text-blue-700 flex items-center gap-2">
                        {currentTrip.status === 'ACCEPTED' ? 'Heading to Pickup' : (currentTrip.status === 'IN_PROGRESS' ? 'Trip in Progress' : currentTrip.status)}
                      </CardTitle>
                      <CardDescription>Trip ID: #{currentTrip.id.slice(0, 8)}</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                      {currentTrip.vehicleType}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <div className="w-3 h-3 rounded-full bg-green-500 ring-4 ring-green-100" />
                        <div className="w-0.5 h-10 bg-slate-200 mx-auto my-1" />
                        <div className="w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-100" />
                      </div>
                      <div className="space-y-4 flex-1">
                        <div>
                          <p className="text-sm font-medium text-slate-500">PICKUP</p>
                          <p className="text-base font-semibold text-slate-900">{currentTrip.pickupLocation?.address}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500">DROPOFF</p>
                          <p className="text-base font-semibold text-slate-900">{currentTrip.dropoffLocation?.address}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg flex justify-between items-center">
                    <span className="font-medium text-slate-600">Estimated Fare</span>
                    <span className="text-lg font-bold text-green-700">{currentTrip.fare?.toLocaleString()} VND</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 pb-6">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => navigate(`/trip/${currentTrip.id}`)}>
                    View Trip Details <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                    <Car className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">No Active Trip</h3>
                  <p className="text-slate-500 max-w-sm mb-6">
                    {isOnline ? "You are online and waiting for jobs." : "You are currently offline."}
                  </p>
                  <Button onClick={() => navigate("/jobs")} variant="outline">
                    Find Jobs
                  </Button>
                </CardContent>
              </Card>
            )}
          </section>

          {/* SECTION 2: AVAILABLE JOBS (Displayed separately below) */}
          {!currentTrip && isOnline && trips.length > 0 && (
            <section className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  Available Jobs Nearby
                  <Badge className="bg-blue-600 hover:bg-blue-700">{trips.length}</Badge>
                </h3>
                <Button variant="link" onClick={() => navigate('/jobs')} className="text-blue-600">View All</Button>
              </div>
              <div className="grid gap-4">
                {trips.slice(0, 3).map(trip => (
                  <Card key={trip.id} className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
                    <div className="flex flex-col md:flex-row">
                      <CardContent className="flex-1 py-4">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="secondary" className="mb-2">{trip.vehicleType}</Badge>
                          <span className="text-lg font-bold text-blue-700">{trip.fare?.toLocaleString() || 0} VND</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-slate-700">
                            <MapPin className="w-4 h-4 text-green-600 shrink-0" />
                            <span className="truncate">{trip.pickupLocation?.address}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-700">
                            <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                            <span className="truncate">{trip.dropoffLocation?.address}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="py-4 md:pl-0 flex items-center justify-center md:justify-end bg-slate-50 md:bg-transparent">
                        <Button size="sm" className="w-full md:w-auto px-6 h-10" onClick={() => handleAccept(trip.id)}>Accept</Button>
                      </CardFooter>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT COLUMN: RECENT ACTIVITY */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
          <Card>
            <CardContent className="p-0">
              {recentTrips.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {recentTrips.map((trip) => (
                    <div key={trip.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-slate-900">{trip.dropoffLocation?.address?.split(',')[0]}</span>
                        <span className="text-green-600 font-bold text-sm">+{trip.fare?.toLocaleString()}đ</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-xs text-slate-500">{new Date(trip.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <Badge variant="outline" className="text-xs font-normal">Completed</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No recent history available.
                </div>
              )}
              <div className="p-4 border-t border-slate-100">
                <Button variant="ghost" className="w-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50" onClick={() => navigate('/history')}>
                  View All History
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}