import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripService } from "@/services/tripService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Phone, MessageSquare, ShieldCheck, Star } from "lucide-react";
import { useSocket } from "@/context";
import { useToast } from "@/hooks/useToast";

export default function TripDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { socket } = useSocket();
    const { showToast } = useToast();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchTrip = async () => {
        if (!id || id === 'undefined') {
            setLoading(false);
            return;
        }
        try {
            const data = await tripService.getTripDetails(id);
            setTrip(data);
        } catch (error) {
            console.error("Failed to fetch trip", error);
            showToast("Error", "Could not load trip details", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrip();
    }, [id]);

    useEffect(() => {
        if (!socket) return;

        const onTripUpdate = (data) => {
            if (data.tripId === id) {
                // Refresh full details or patch local state
                if (data.status === 'COMPLETED') {
                    showToast("Trip Completed", `You have arrived! Fare: ${data.fare} VND`, "success");
                    // Optionally navigate to rating/history
                }
                fetchTrip();
            }
        };

        const onDriverLocation = (data) => {
            // Handle driver location updates on map (future impl)
            console.log("Driver Location:", data);
        };

        socket.on('trip_pickup', onTripUpdate); // Assuming event name
        socket.on('trip_completed', onTripUpdate);
        socket.on('driver_location', onDriverLocation);

        return () => {
            socket.off('trip_pickup', onTripUpdate);
            socket.off('trip_completed', onTripUpdate);
            socket.off('driver_location', onDriverLocation);
        };
    }, [socket, id]);

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>;

    if (!trip) return <div className="p-8 text-center">Trip not found</div>;

    const getStatusColor = (status) => {
        switch (status) {
            case 'ACCEPTED': return 'bg-blue-500 hover:bg-blue-600';
            case 'IN_PROGRESS': return 'bg-green-500 hover:bg-green-600';
            case 'COMPLETED': return 'bg-slate-500 hover:bg-slate-600';
            default: return 'bg-slate-500';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header / Status */}
                <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Trip #{trip.id ? trip.id.substring(0, 8) : '...'}</h1>
                        <p className="text-sm text-slate-500">{new Date(trip.createdAt).toLocaleString()}</p>
                    </div>
                    <Badge className={`${getStatusColor(trip.status)} text-white px-4 py-1`}>
                        {trip.status.replace('_', ' ')}
                    </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Driver Info Card */}
                    <Card className="border-0 shadow-md overflow-hidden">
                        <CardHeader className="bg-indigo-600 text-white p-6">
                            <CardTitle className="flex items-center gap-2">
                                <ShieldCheck className="h-6 w-6" /> Your Driver
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {trip.driverId ? (
                                <div className="flex items-start gap-4">
                                    <div className="h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center text-2xl font-bold text-slate-500">
                                        {trip.driverName ? trip.driverName.charAt(0) : "D"}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold">{trip.driverName || "Unknown Driver"}</h3>
                                        <div className="flex items-center text-yellow-500 text-sm mb-2">
                                            <Star className="h-4 w-4 fill-current" /> 5.0 (500+ trips)
                                        </div>
                                        <p className="text-slate-600 font-medium">
                                            {trip.vehicleType} • {trip.vehiclePlate || "Plate Hidden"}
                                        </p>
                                        <div className="flex gap-2 mt-4">
                                            <Button size="sm" variant="outline" className="flex-1 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                                                <Phone className="h-4 w-4 mr-2" /> Call
                                            </Button>
                                            <Button size="sm" variant="outline" className="flex-1 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                                                <MessageSquare className="h-4 w-4 mr-2" /> Chat
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6 text-slate-500">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                                    Waiting for driver assignment...
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Trip Info Card */}
                    <Card className="border-0 shadow-md">
                        <CardHeader className="border-b bg-white">
                            <CardTitle>Trip Details</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            {/* Route */}
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="flex flex-col items-center mt-1">
                                        <div className="w-3 h-3 rounded-full bg-green-500 ring-4 ring-green-100" />
                                        <div className="w-0.5 h-10 bg-slate-200 my-1" />
                                        <div className="w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-100" />
                                    </div>
                                    <div className="flex-1 space-y-6">
                                        <div>
                                            <p className="text-xs text-slate-500 font-semibold mb-1">PICKUP</p>
                                            <p className="text-sm font-medium">{trip.pickupLocation?.address}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-semibold mb-1">DROPOFF</p>
                                            <p className="text-sm font-medium">{trip.dropoffLocation?.address}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t flex justify-between items-end">
                                <div>
                                    <p className="text-xs text-slate-500">PAYMENT</p>
                                    <p className="font-semibold">{trip.paymentMethod}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500">ESTIMATED FARE</p>
                                    <p className="text-xl font-bold text-indigo-700">
                                        {trip.fare?.toLocaleString()} VND
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
