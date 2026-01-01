import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Car, Plus, Trash2, Star, ShieldCheck, TrendingUp, Clock, Calendar, MapPin } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/useToast';
import { tripService } from '@/services/tripService';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  // Stats State
  const [stats, setStats] = useState({
    totalTrips: 0,
    hoursActive: 0,
    weeklyTrips: 0,
    acceptRate: 100, // Default to 100% until we have rejection data
    rank: 'Bronze',
    progress: 0,
    nextRank: 'Silver',
    points: 0,
    pointsNeeded: 50
  });

  // Fetch Trip History for Stats
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.uid) return;
      try {
        const trips = await tripService.getDriverHistory();
        const allTrips = trips || [];
        setRecentTrips(allTrips.slice(0, 3));

        // Calculate Stats
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        let totalDurationSec = 0;
        let weeklyTripsCount = 0;

        allTrips.forEach(t => {
          // Count duration (assuming it's in seconds)
          if (t.duration) totalDurationSec += t.duration;

          // Weekly Trips
          if (t.completedAt && new Date(t.completedAt) > oneWeekAgo) {
            weeklyTripsCount++;
          } else if (t.createdAt && new Date(t.createdAt) > oneWeekAgo) {
            // Fallback to createdAt if completedAt missing
            weeklyTripsCount++;
          }
        });

        const hours = (totalDurationSec / 3600).toFixed(1);
        const totalCount = allTrips.length;

        // Ranking Logic
        let currentRank = 'Bronze';
        let next = 'Silver';
        let progressVal = 0;
        let needed = 50;

        if (totalCount >= 100) {
          currentRank = 'Gold';
          next = 'Platinum';
          progressVal = 100;
          needed = 0;
        } else if (totalCount >= 50) {
          currentRank = 'Silver';
          next = 'Gold';
          progressVal = ((totalCount - 50) / 50) * 100;
          needed = 100 - totalCount;
        } else {
          progressVal = (totalCount / 50) * 100;
          needed = 50 - totalCount;
        }

        setStats({
          totalTrips: totalCount,
          hoursActive: hours,
          weeklyTrips: weeklyTripsCount,
          acceptRate: 98, // Mocked for now as we don't track rejections
          rank: currentRank,
          progress: progressVal,
          nextRank: next,
          pointsNeeded: needed
        });

      } catch (err) {
        console.warn("Failed to fetch history for profile", err);
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  if (!user) return <div className="p-8 text-center text-slate-500">Please log in</div>;

  // Use registeredVehicles from user, or fallback to current vehicle if array is empty
  const vehicles = user.registeredVehicles || (user.vehicle ? [user.vehicle] : []);

  // ... (Keep existing handlers)

  // ... (Render Block)
  return (
    <div className="bg-slate-50 min-h-screen p-4 md:p-8 space-y-6">
      {/* Header Profile Card */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6 flex items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-slate-200 flex items-center justify-center text-2xl font-bold text-slate-500 overflow-hidden">
            {user.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : (user.name?.charAt(0) || "D")}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
            <div className="flex items-center gap-2 text-slate-500 mt-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{user.rating || "5.0"} Rating</span>
              <span>•</span>
              <span>{stats.totalTrips} Trips</span>
            </div>
            <Badge variant="secondary" className="mt-2 text-slate-600 bg-slate-100">
              {stats.rank} Driver
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* RANKING BLOCK */}
        <Card className="border-0 shadow-md flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-700">
              <TrendingUp className="w-5 h-5 text-indigo-600" /> Ranking
            </CardTitle>
            <CardDescription>Your current driver tier and progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end mb-2">
              <span className="text-3xl font-bold text-indigo-600">{stats.rank}</span>
              <span className="text-sm text-slate-500">Next: {stats.nextRank}</span>
            </div>
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${stats.progress}%` }} />
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {stats.pointsNeeded > 0 ? `${stats.pointsNeeded} more trips to reach ${stats.nextRank}` : "You are at the top tier!"}
            </p>

            <div className="mt-6 flex gap-4 text-center">
              <div className="flex-1 p-2 bg-slate-50 rounded">
                <div className="text-xl font-bold text-slate-800">#{Math.max(10 - stats.totalTrips, 1)}</div>
                <div className="text-xs text-slate-500">City Rank</div>
              </div>
              <div className="flex-1 p-2 bg-slate-50 rounded">
                <div className="text-xl font-bold text-slate-800">Top {stats.rank === 'Gold' ? '1' : (stats.rank === 'Silver' ? '10' : '20')}%</div>
                <div className="text-xs text-slate-500">Percentile</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* TIME ACTIVE BLOCK */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-700">
              <Clock className="w-5 h-5 text-green-600" /> Drive Time
            </CardTitle>
            <CardDescription>Activity based on trip duration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Total Hours</p>
                  <p className="text-xs text-slate-500">All Time</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-slate-900">{stats.hoursActive} Hrs</p>
                <p className="text-xs text-slate-500">Driving</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                <p className="text-2xl font-bold text-slate-900">{stats.weeklyTrips}</p>
                <p className="text-xs text-slate-500 uppercase font-semibold">Trips (Week)</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                <p className="text-2xl font-bold text-slate-900">{stats.acceptRate}%</p>
                <p className="text-xs text-slate-500 uppercase font-semibold">Accept Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RECENT ACTIVITY BLOCK */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-700">
            <Calendar className="w-5 h-5 text-blue-600" /> Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="text-center py-4 text-slate-500"><Loader2 className="w-5 h-5 animate-spin mx-auto" /> Loading history...</div>
          ) : recentTrips.length === 0 ? (
            <div className="text-center py-4 text-slate-500">No recent trips found.</div>
          ) : (
            <div className="space-y-4">
              {recentTrips.map((trip) => (
                <div key={trip.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-white p-1.5 rounded-full border shadow-sm">
                      <MapPin className="w-4 h-4 text-slate-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{new Date(trip.createdAt).toLocaleDateString()}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[200px]">{trip.dropoffLocation?.address || "Destination"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-indigo-600">{trip.fare?.toLocaleString()}đ</p>
                    <Badge variant="outline" className="text-xs scale-90">{trip.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="ghost" className="w-full text-sm text-slate-500" onClick={() => window.location.href = '/history'}>View All History</Button>
        </CardFooter>
      </Card>

      {/* Vehicle Management Section */}
      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5" /> My Vehicles
            </CardTitle>
            <CardDescription>Manage the vehicles you use for driving</CardDescription>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-slate-900 text-white hover:bg-slate-800">
                <Plus className="w-4 h-4 mr-2" /> Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Vehicle</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Vehicle Type</Label>
                  <Select
                    value={newVehicle.type}
                    onValueChange={(val) => setNewVehicle({ ...newVehicle, type: val })}
                  >
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Motorbike">Motorbike</SelectItem>
                      <SelectItem value="Car 4-Seat">Car 4-Seat</SelectItem>
                      <SelectItem value="Car 7-Seat">Car 7-Seat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>License Plate</Label>
                    <Input
                      placeholder="59-X1 123.45"
                      value={newVehicle.plate}
                      onChange={(e) => setNewVehicle({ ...newVehicle, plate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <Input
                      placeholder="Red, White..."
                      value={newVehicle.color}
                      onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Model</Label>
                  <Input
                    placeholder="Honda Vision, Toyota Vios..."
                    value={newVehicle.model}
                    onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={handleAddVehicle} disabled={loading} className="bg-slate-900 text-white">
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {vehicles.length === 0 ? (
            <div className="text-center py-8 text-slate-500 border-2 border-dashed rounded-lg">
              No vehicles registered. Please add one to start driving.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {vehicles.map((v, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                      <Car className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{v.model}</h3>
                      <p className="text-sm text-slate-500">{v.plate} • {v.color}</p>
                      <Badge variant="outline" className="mt-1 text-xs">{v.type}</Badge>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleRemoveVehicle(idx)}>
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
