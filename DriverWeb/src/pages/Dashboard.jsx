import React, { useEffect, useState } from 'react';
import { useDriver } from "@/context";
import { tripService } from "@/services/tripService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/useToast";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import MapComponent from "@/components/MapComponent";
import {
  MapPin,
  Navigation,
  DollarSign,
  Clock,
  TrendingUp,
  Car,
  Calendar,
  Power
} from 'lucide-react';

export default function Dashboard() {
  const { currentTrip, setCurrentTrip, loading, formatTime, isOnline, timeLeft, toggleStatus, user } = useDriver();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ earnings: 0, trips: 0, rating: 4.9 });
  const [recentTrips, setRecentTrips] = useState([]);

  // Simulation State
  const [driverLocation, setDriverLocation] = useState(null);
  const [routePath, setRoutePath] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Simulation Logic
  useEffect(() => {
    if (!currentTrip || !currentTrip.pickupLocation || !currentTrip.dropoffLocation) {
      setDriverLocation(null);
      setRoutePath(null);
      return;
    }

    let start, end;

    // Helper to parser lat/lng safely
    const getCoords = (loc) => ({ lat: parseFloat(loc.lat), lng: parseFloat(loc.lng) });

    if (currentTrip.status === 'ACCEPTED') {
      // Simulate driver starting shortly away from pickup
      const pickup = getCoords(currentTrip.pickupLocation);
      // Rough offset ~1km away
      const driverStart = { lat: pickup.lat - 0.008, lng: pickup.lng - 0.008 };

      start = driverStart;
      end = pickup;
      // Initialize driver position immediately so they don't 'jump'
      if (!driverLocation) setDriverLocation(start);
    } else if (currentTrip.status === 'IN_PROGRESS') {
      start = getCoords(currentTrip.pickupLocation);
      end = getCoords(currentTrip.dropoffLocation);
      // Driver starts at pickup (or last known location if we were persisting it, but here we restart simulation)
      if (!driverLocation) setDriverLocation(start);
    } else {
      // For completed or other statuses, stop simulation
      setDriverLocation(null);
      setRoutePath(null);
      return;
    }

    if (!start || !end) return;

    // Set visualization path
    setRoutePath([[start.lat, start.lng], [end.lat, end.lng]]);

    // Animation Loop
    const duration = 15000; // 15 seconds to traverse
    const fps = 60;
    const totalSteps = (duration / 1000) * fps;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const progress = Math.min(step / totalSteps, 1);

      const newLat = start.lat + (end.lat - start.lat) * progress;
      const newLng = start.lng + (end.lng - start.lng) * progress;

      setDriverLocation({ lat: newLat, lng: newLng });

      if (progress >= 1) {
        clearInterval(interval);
      }
    }, 1000 / fps);

    return () => clearInterval(interval);

  }, [currentTrip?.status, currentTrip?.id]);

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
          rating: 4.9 // Mocked for now, assumes fetch from profile context if available
        });
        setRecentTrips(history.slice(0, 3));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  };

  const handlePickup = async () => {
    if (!currentTrip) return;
    try {
      const updated = await tripService.markPickup(currentTrip.id);
      setCurrentTrip(updated);
      showToast("Info", "Trip Started", "info");
      // Reset driver location to ensure smooth transition for next phase if needed
      setDriverLocation(null);
    } catch (e) { showToast("Error", "Action failed", "error"); }
  };

  const handleComplete = async () => {
    if (!currentTrip) return;
    const confirmed = window.confirm(`Fare: ${currentTrip.fare?.toLocaleString()} VND.\n\nHas the Rider paid the full amount?`);
    if (!confirmed) return;

    try {
      await tripService.markComplete(currentTrip.id);
      setCurrentTrip(null);
      showToast("Success", "Trip Completed!", "success");
      loadDashboardData(); // Refresh stats
    } catch (e) { showToast("Error", "Action failed", "error"); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen text-slate-500">
      <div className="animate-spin mr-2"><Navigation className="w-6 h-6" /></div> Loading Dashboard...
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
              <div className="font-semibold text-lg">{isOnline ? 'You are Online' : 'You are Offline'}</div>
              <div className="text-sm text-slate-500">{isOnline ? `Auto-offline in: ${formatTime(timeLeft)}` : 'Go online to receive jobs'}</div>
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
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Current Activity</h2>

          {currentTrip ? (
            <Card className="border-l-4 border-l-blue-500 shadow-md overflow-hidden">
              <CardHeader className="bg-slate-50/50 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-blue-700 flex items-center gap-2">
                      {currentTrip.status === 'ACCEPTED' ? 'Heading to Pickup' : 'Trip in Progress'}
                    </CardTitle>
                    <CardDescription>Trip ID: #{currentTrip.id.slice(0, 8)}</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                    {currentTrip.vehicleType}
                  </Badge>
                </div>
              </CardHeader>

              {/* MAP SECTION */}
              <div className="h-64 w-full bg-slate-100 border-y border-slate-200 relative">
                <MapComponent
                  pickupLocation={currentTrip.pickupLocation}
                  dropoffLocation={currentTrip.dropoffLocation}
                  driverLocation={driverLocation}
                  routePath={routePath}
                />
              </div>

              <CardContent className="pt-6 space-y-6">
                <div className="grid gap-6">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <div className="w-3 h-3 rounded-full bg-green-500 ring-4 ring-green-100" />
                      <div className="w-0.5 h-10 bg-slate-200 mx-auto my-1" />
                      <div className="w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-100" />
                    </div>
                    <div className="space-y-6 flex-1">
                      <div>
                        <p className="text-sm font-medium text-slate-500">PICKUP</p>
                        <p className="text-lg font-semibold text-slate-900">{currentTrip.pickupLocation?.address}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500">DROPOFF</p>
                        <p className="text-lg font-semibold text-slate-900">{currentTrip.dropoffLocation?.address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-100 p-4 rounded-lg flex justify-between items-center">
                  <span className="font-semibold text-slate-600">Estimated Fare</span>
                  <span className="text-xl font-bold text-green-700">{currentTrip.fare?.toLocaleString()} VND</span>
                </div>
              </CardContent>
              <CardFooter className="pt-2 pb-6">
                {currentTrip.status === 'ACCEPTED' && (
                  <Button className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200" onClick={handlePickup}>
                    <Navigation className="w-5 h-5 mr-2" /> I Have Arrived
                  </Button>
                )}
                {currentTrip.status === 'IN_PROGRESS' && (
                  <Button className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200" onClick={handleComplete}>
                    <DollarSign className="w-5 h-5 mr-2" /> Complete Trip & Collect Cash
                  </Button>
                )}
              </CardFooter>
            </Card>
          ) : (
            <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                  <Car className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">No Active Trip</h3>
                <p className="text-slate-500 max-w-sm mb-6">
                  You are currently free. Go online and find available jobs to start earning.
                </p>
                <Button onClick={() => navigate("/jobs")} size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                  Find Jobs
                </Button>
              </CardContent>
            </Card>
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