import { useState, useEffect } from 'react';
import { tripService } from "@/services/tripService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin } from "lucide-react";
import { useToast } from "@/hooks/useToast";

export default function Dashboard() {
  const { showToast } = useToast();
  const [trips, setTrips] = useState([]);
  const [currentTrip, setCurrentTrip] = useState(null); // Active Trip State
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Check for Active Trip
      const active = await tripService.getCurrentTrip();
      if (active) {
        setCurrentTrip(active);
      } else {
        // 2. If no active trip, load available jobs
        setCurrentTrip(null);
        const data = await tripService.getAvailableTrips();
        if (Array.isArray(data)) setTrips(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleStatus = async () => {
    const newStatus = isOnline ? 'OFFLINE' : 'ONLINE';
    try {
      await tripService.updateDriverStatus(newStatus);
      setIsOnline(!isOnline);
      showToast("Success", `You are now ${newStatus}`, "success");
    } catch (e) {
      showToast("Error", "Failed to update status", "error");
    }
  };

  const handleAccept = async (id) => {
    try {
      const trip = await tripService.acceptTrip(id);
      showToast("Success", "Trip accepted!", "success");
      setCurrentTrip(trip); // Switch to Active View
    } catch (e) {
      showToast("Error", "Failed to accept trip", "error");
    }
  };

  const handlePickup = async () => {
    if (!currentTrip) return;
    try {
      const updated = await tripService.markPickup(currentTrip.id);
      setCurrentTrip(updated);
      showToast("Info", "Trip Started", "info");
    } catch (e) { showToast("Error", "Action failed", "error"); }
  };

  const handleComplete = async () => {
    if (!currentTrip) return;

    // USER REQUEST: Driver must ask if rider has paid
    const confirmed = window.confirm(`Far: ${currentTrip.fare} VND.\n\nHas the Rider paid the full amount?`);
    if (!confirmed) return;

    try {
      const updated = await tripService.markComplete(currentTrip.id);
      setCurrentTrip(null); // Back to job list
      showToast("Success", "Trip Completed!", "success");
      loadData(); // Refresh list
    } catch (e) { showToast("Error", "Action failed", "error"); }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  // ACTIVE TRIP VIEW
  if (currentTrip) {
    return (
      <div className="p-6 w-full max-w-lg mx-auto space-y-6">
        <Card className="border-l-4 border-l-green-500 shadow-lg">
          <CardHeader>
            <CardTitle>Current Trip: {currentTrip.status}</CardTitle>
            <Badge className="w-fit">{currentTrip.vehicleType}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-slate-50 rounded space-y-2">
              <p><strong>Pickup:</strong> {currentTrip.pickupLocation?.address}</p>
              <p><strong>Dropoff:</strong> {currentTrip.dropoffLocation?.address}</p>
              <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-gray-200">
                <span>Fare:</span>
                <span className="text-green-600">{currentTrip.fare} VND</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            {currentTrip.status === 'ACCEPTED' && (
              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handlePickup}>
                I Have Arrived / Pickup Rider
              </Button>
            )}

            {currentTrip.status === 'IN_PROGRESS' && (
              <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleComplete}>
                Complete Trip (Verify Payment)
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  }

  // JOB LIST VIEW
  return (
    <div className="p-6 w-full space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Available Jobs</h1>
        <div className="flex gap-2">
          <Button variant={isOnline ? "destructive" : "default"} onClick={toggleStatus}>
            {isOnline ? "Go Offline" : "Go Online"}
          </Button>
          <Button variant="outline" onClick={loadData} size="sm">Refresh</Button>
        </div>
      </div>

      {trips.length === 0 ? (
        <div className="text-center text-slate-500 border-2 border-dashed p-10 rounded-lg">
          No jobs available right now. Check back later!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trips.map(trip => (
            <Card key={trip.id} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span className="text-lg">{trip.fare || trip.price || 0} VND</span>
                  <Badge>{trip.vehicleType}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">PICKUP</p>
                    <p className="font-medium text-sm">{trip.pickupLocation?.address || "Unknown"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">DROPOFF</p>
                    <p className="font-medium text-sm">{trip.dropoffLocation?.address || "Unknown"}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => handleAccept(trip.id)}>Accept Job</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}