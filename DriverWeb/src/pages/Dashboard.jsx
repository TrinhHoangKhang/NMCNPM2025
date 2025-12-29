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
  const [loading, setLoading] = useState(true);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await tripService.getAvailableTrips();
      if (Array.isArray(data)) setTrips(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleAccept = async (id) => {
    try {
      await tripService.acceptTrip(id);
      showToast("Success", "Trip accepted!", "success");
      loadJobs(); // Refresh list
    } catch (e) {
      showToast("Error", "Failed to accept trip", "error");
    }
  }

  return (
    <div className="p-6 w-full space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Available Jobs</h1>
        <Button variant="outline" onClick={loadJobs} size="sm">Refresh</Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-10"><Loader2 className="animate-spin h-8 w-8 text-blue-500" /></div>
      ) : trips.length === 0 ? (
        <div className="text-center text-slate-500 border-2 border-dashed p-10 rounded-lg">
          No jobs available right now. Check back later!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trips.map(trip => (
            <Card key={trip.id} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span className="text-lg">{trip.price} VND</span>
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