import { useDriver } from "@/context";
import { tripService } from "@/services/tripService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { useNavigate } from "react-router-dom";

export default function AvailableJobs() {
    const {
        trips,
        loading,
        isOnline,
        timeLeft,
        toggleStatus,
        formatTime,
        fetchAvailableJobs,
        setCurrentTrip
    } = useDriver();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleAccept = async (id) => {
        try {
            const trip = await tripService.acceptTrip(id);
            showToast("Success", "Trip accepted!", "success");
            setCurrentTrip(trip);
            navigate("/dashboard"); // Go to Active Trip view
        } catch (e) {
            console.error("Accept error:", e);
            const msg = e.response?.data?.error || e.message || "Failed to accept trip";
            showToast("Error", msg, "error");
        }
    };

    if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin h-8 w-8 mx-auto" /></div>;

    return (
        <div className="p-6 w-full space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Available Jobs</h1>
                <div className="flex gap-2">
                    <Button variant={isOnline ? "destructive" : "default"} onClick={toggleStatus}>
                        {isOnline ? `Stop Working (${formatTime(timeLeft)})` : "Start Working"}
                    </Button>
                    <Button variant="outline" onClick={fetchAvailableJobs} size="sm">Refresh</Button>
                </div>
            </div>

            {trips.length === 0 ? (
                <div className="text-center text-slate-500 border-2 border-dashed p-10 rounded-lg">
                    {isOnline ? "No jobs available right now. Check back later!" : "You are Not Working. Switch to Working mode to see jobs."}
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
