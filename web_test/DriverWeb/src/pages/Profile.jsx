import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Car, Plus, Trash2, Star, ShieldCheck, TrendingUp, Clock, Calendar, MapPin, CheckCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/useToast';
import { tripService } from '@/services/tripService';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { vehicleSchema } from "@/schemas/vehicleSchema";
import { useSocket } from '../context/SocketContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const { socket } = useSocket();
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [recentTrips, setRecentTrips] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  // Detail View State
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);





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

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      type: "Motorbike",
      plate: "",
      color: "",
      model: ""
    }
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (isAddOpen) {
      reset({
        type: "Motorbike",
        plate: "",
        color: "",
        model: ""
      });
    }
  }, [isAddOpen, reset]);

  const onSubmitVehicle = async (data) => {
    setLoading(true);
    try {
      const updatedVehicles = [...vehicles, { ...data, id: Date.now().toString() }];

      // If this is the first vehicle, set it as active immediately
      const updates = { registeredVehicles: updatedVehicles };
      if (!user.vehicle || vehicles.length === 0) {
        updates.vehicle = updatedVehicles[0];
        // Emit switch_vehicle since we are setting the first vehicle
        if (socket) {
          console.log("Adding first vehicle, using socket to switch room:", updatedVehicles[0].type);
          socket.emit('switch_vehicle', updatedVehicles[0].type);
        }
      }

      const res = await updateUser(updates);
      if (res.success) {
        showToast("Success", "Vehicle added successfully", "success");
        setIsAddOpen(false);
      } else {
        showToast("Error", res.error || "Failed to add vehicle", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error", "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSetActiveVehicle = async (vehicle) => {
    setLoading(true);
    try {
      // Optimistic check: if already active, do nothing
      if (user.vehicle && user.vehicle.id === vehicle.id) {
        showToast("Info", "This vehicle is already active", "info");
        setLoading(false);
        return;
      }

      const updates = { vehicle: vehicle };
      const res = await updateUser(updates);

      if (res.success) {
        showToast("Success", `Switched to ${vehicle.model}`, "success");
        // Notify Socket Server to Join correct room
        if (socket) {
          console.log("Setting active vehicle, emitting switch_vehicle:", vehicle.type);
          socket.emit('switch_vehicle', vehicle.type);
        }
        setSelectedVehicle(null); // Close dialog
      } else {
        showToast("Error", res.error || "Failed to switch vehicle", "error");
      }

    } catch (err) {
      console.error("Error switching vehicle:", err);
      showToast("Error", "Failed to switch vehicle", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVehicle = (e, idx) => {
    e.stopPropagation();
    setVehicleToDelete(idx);
  };

  const confirmDeleteVehicle = async () => {
    if (vehicleToDelete === null) return;

    setLoading(true);
    try {
      const updatedVehicles = vehicles.filter((_, idx) => idx !== vehicleToDelete);

      const newActiveVehicle = updatedVehicles.length > 0 ? updatedVehicles[0] : null;

      const updates = {
        registeredVehicles: updatedVehicles,
        vehicle: newActiveVehicle
      };

      const res = await updateUser(updates);

      if (res.success) {
        showToast("Success", "Vehicle removed", "success");
        if (selectedVehicle && vehicles[vehicleToDelete] && selectedVehicle.id === vehicles[vehicleToDelete].id) {
          setSelectedVehicle(null);
        }

        // If active vehicle changed (e.g. was deleted), notify socket
        if (newActiveVehicle && socket) {
          console.log("Deleted active vehicle, switching to next available:", newActiveVehicle.type);
          socket.emit('switch_vehicle', newActiveVehicle.type);
        } else if (!newActiveVehicle && socket) {
          // No vehicle left? What to emit? 
          // Maybe nothing, or leave all rooms. 'switch_vehicle' with null checks might fail.
          // But if they have no vehicle, they effectively can't receive trips anyway (getAvailableTrips checks).
        }

      } else {
        showToast("Error", res.error || "Failed to remove vehicle", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error", "Failed to remove vehicle", "error");
    } finally {
      setLoading(false);
      setVehicleToDelete(null);
    }
  };

  // Set first vehicle as active if none set (logic for Add as well)
  // ... Or just ensure Add updates it if it's the first one.

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
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary" className="text-slate-600 bg-slate-100">
                {stats.rank} Driver
              </Badge>
              {user.vehicle && (
                <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200">
                  {user.vehicle.model} - {user.vehicle.plate}
                </Badge>
              )}
            </div>
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
                  <Label>Vehicle Type <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <select
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                      {...register("type")}
                    >
                      <option value="Motorbike">Motorbike</option>
                      <option value="Car 4-Seat">Car 4-Seat</option>
                      <option value="Car 7-Seat">Car 7-Seat</option>
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-50"><path d="M4.93179 5.43179C4.75605 5.25605 4.75605 4.97113 4.93179 4.79539C5.10753 4.61965 5.39245 4.61965 5.56819 4.79539L7.49999 6.72718L9.43179 4.79539C9.60753 4.61965 9.89245 4.61965 10.0682 4.79539C10.2439 4.97113 10.2439 5.25605 10.0682 5.43179L7.81819 7.68179C7.73379 7.76619 7.61933 7.8136 7.49999 7.8136C7.38064 7.8136 7.26618 7.76619 7.18179 7.68179L4.93179 5.43179Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    </div>
                  </div>
                  {errors.type && <p className="text-red-500 text-xs">{errors.type.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>License Plate <span className="text-red-500">*</span></Label>
                    <Input
                      placeholder="59-X1 123.45"
                      {...register("plate")}
                    />
                    {errors.plate && <p className="text-red-500 text-xs">{errors.plate.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Color <span className="text-red-500">*</span></Label>
                    <Input
                      placeholder="Red, White..."
                      {...register("color")}
                    />
                    {errors.color && <p className="text-red-500 text-xs">{errors.color.message}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Model <span className="text-red-500">*</span></Label>
                  <Input
                    placeholder="Honda Vision, Toyota Vios..."
                    {...register("model")}
                  />
                  {errors.model && <p className="text-red-500 text-xs">{errors.model.message}</p>}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit(onSubmitVehicle)} disabled={loading} className="bg-slate-900 text-white">
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
                <div
                  key={idx}
                  className={`flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition cursor-pointer ${user.vehicle?.id === v.id ? 'border-green-500 bg-green-50' : ''}`}
                  onClick={() => setSelectedVehicle(v)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${user.vehicle?.id === v.id ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'}`}>
                      {user.vehicle?.id === v.id ? <CheckCircle className="w-6 h-6" /> : <Car className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{v.model}</h3>
                      <p className="text-sm text-slate-500">{v.plate} • {v.color}</p>
                      <div className="flex gap-2 items-center mt-1">
                        <Badge variant="outline" className="text-xs">{v.type}</Badge>
                        {user.vehicle?.id === v.id && (
                          <span className="text-xs font-semibold text-green-600">Active</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {user.vehicle?.id !== v.id && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetActiveVehicle(v);
                        }}
                      >
                        Activate
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={(e) => handleRemoveVehicle(e, idx)}>
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vehicle Detail Dialog */}
      <Dialog open={!!selectedVehicle} onOpenChange={(open) => !open && setSelectedVehicle(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vehicle Details</DialogTitle>
          </DialogHeader>
          {selectedVehicle && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-slate-500 uppercase">Type</Label>
                  <p className="font-medium text-slate-900">{selectedVehicle.type}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500 uppercase">License Plate</Label>
                  <p className="font-medium text-slate-900">{selectedVehicle.plate}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500 uppercase">Model</Label>
                  <p className="font-medium text-slate-900">{selectedVehicle.model}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500 uppercase">Color</Label>
                  <p className="font-medium text-slate-900">{selectedVehicle.color}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs text-slate-500 uppercase">Status</Label>
                  <div className="mt-1 flex items-center justify-between">
                    <Badge className={user.vehicle?.id === selectedVehicle.id ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"}>
                      {user.vehicle?.id === selectedVehicle.id ? "Active & Verified" : "Verified Only"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedVehicle && user.vehicle?.id !== selectedVehicle.id && (
              <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700 mr-auto" onClick={() => handleSetActiveVehicle(selectedVehicle)}>
                Set as Active
              </Button>
            )}
            <Button variant="outline" onClick={() => setSelectedVehicle(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={vehicleToDelete !== null} onOpenChange={(open) => !open && setVehicleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vehicle?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove the vehicle from your profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteVehicle} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
