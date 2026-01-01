import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDriver } from "@/context";
import { tripService } from "@/services/tripService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/useToast";
import MapComponent from "@/components/MapComponent";
import {
    MapPin,
    Navigation,
    DollarSign,
    ArrowLeft,
    Loader2
} from 'lucide-react';

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

export default function TripDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentTrip, setCurrentTrip, loadData } = useDriver();
    const { showToast } = useToast();

    // Local state for fetching if not in context (fallback)
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);

    // Dialog States
    const [showCompleteDialog, setShowCompleteDialog] = useState(false);
    const [showAbandonDialog, setShowAbandonDialog] = useState(false);

    // Simulation State
    const [driverLocation, setDriverLocation] = useState(null);
    const [routePath, setRoutePath] = useState(null);

    useEffect(() => {
        // If we have currentTrip in context and it matches ID, use it
        if (currentTrip && currentTrip.id === id) {
            setTrip(currentTrip);
            setLoading(false);
        } else {
            // Otherwise fetch individually
            const fetchTrip = async () => {
                try {
                    const data = await tripService.getTripDetails(id);
                    setTrip(data);
                } catch (error) {
                    console.error(error);
                    showToast("Error", "Failed to load trip details", "error");
                } finally {
                    setLoading(false);
                }
            };
            fetchTrip();
        }
    }, [id, currentTrip]);

    // Simulation Logic (Adapted from Dashboard)
    useEffect(() => {
        if (!trip || !trip.pickupLocation || !trip.dropoffLocation) {
            setDriverLocation(null);
            setRoutePath(null);
            return;
        }

        let start, end;
        const getCoords = (loc) => ({ lat: parseFloat(loc.lat), lng: parseFloat(loc.lng) });

        if (trip.status === 'ACCEPTED') {
            const pickup = getCoords(trip.pickupLocation);
            const driverStart = { lat: pickup.lat - 0.008, lng: pickup.lng - 0.008 };
            start = driverStart;
            end = pickup;
            if (!driverLocation) setDriverLocation(start);
        } else if (trip.status === 'IN_PROGRESS') {
            start = getCoords(trip.pickupLocation);
            end = getCoords(trip.dropoffLocation);
            if (!driverLocation) setDriverLocation(start);
        } else {
            setDriverLocation(null);
            setRoutePath(null);
            return;
        }

        if (!start || !end) return;

        setRoutePath([[start.lat, start.lng], [end.lat, end.lng]]);

        const duration = 15000;
        const fps = 60;
        const totalSteps = (duration / 1000) * fps;
        let step = 0;

        const interval = setInterval(() => {
            step++;
            const progress = Math.min(step / totalSteps, 1);
            const newLat = start.lat + (end.lat - start.lat) * progress;
            const newLng = start.lng + (end.lng - start.lng) * progress;
            setDriverLocation({ lat: newLat, lng: newLng });
            if (progress >= 1) clearInterval(interval);
        }, 1000 / fps);

        return () => clearInterval(interval);

    }, [trip?.status, trip?.id]);

    const handlePickup = async () => {
        if (!trip) return;
        try {
            const updated = await tripService.markPickup(trip.id);
            setCurrentTrip(updated); // Update context
            setTrip(updated);
            showToast("Info", "Trip Started", "info");
            setDriverLocation(null);
        } catch (e) { showToast("Error", "Action failed", "error"); }
    };

    const handleCancel = async () => {
        setLoading(true);
        try {
            console.log("Calling tripService.cancelTrip...");
            await tripService.cancelTrip(trip.id);
            setCurrentTrip(null);
            showToast("Success", "Trip Cancelled", "success");
            navigate('/dashboard');
        } catch (e) {
            console.error(e);
            showToast("Error", "Failed to cancel trip", "error");
        } finally {
            setLoading(false);
            setShowAbandonDialog(false);
        }
    };

    const handleComplete = async () => {
        setLoading(true);
        try {
            console.log("Calling tripService.markComplete...");
            // markComplete returns the updated trip object
            const updatedTrip = await tripService.markComplete(trip.id, { cashCollected: true });

            // 1. Update local state immediately to show "COMPLETED" UI
            setTrip(updatedTrip);

            // 2. Clear global context so Dashboard knows we are free
            setCurrentTrip(null);

            showToast("Success", "Trip Completed!", "success");
        } catch (e) {
            console.error("Complete error", e);
            // Show more visible error if something goes wrong
            alert(`Failed to complete trip: ${e.message}`);
            showToast("Error", "Action failed", "error");
        } finally {
            setLoading(false);
            setShowCompleteDialog(false);
        }
    };

    if (loading && !trip) return (
        <div className="flex flex-col items-center justify-center p-12 text-blue-600">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="text-lg font-medium text-slate-500">Loading Trip Details...</p>
        </div>
    );
    if (!trip) return <div className="p-8 text-center">Trip not found</div>;

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 bg-slate-50 min-h-screen">
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>

            <Card className="border-l-4 border-l-blue-500 shadow-md overflow-hidden">
                <CardHeader className="bg-slate-50/50 pb-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-xl text-blue-700 flex items-center gap-2">
                                {trip.status === 'ACCEPTED' ? 'Heading to Pickup' : (trip.status === 'IN_PROGRESS' ? 'Trip in Progress' : trip.status)}
                            </CardTitle>
                            <CardDescription>Trip ID: #{trip.id.slice(0, 8)}</CardDescription>
                        </div>
                        <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                            {trip.vehicleType}
                        </Badge>
                    </div>
                </CardHeader>

                <div className="h-96 w-full bg-slate-100 border-y border-slate-200 relative">
                    <MapComponent
                        pickupLocation={trip.pickupLocation}
                        dropoffLocation={trip.dropoffLocation}
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
                                    <p className="text-lg font-semibold text-slate-900">{trip.pickupLocation?.address}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500">DROPOFF</p>
                                    <p className="text-lg font-semibold text-slate-900">{trip.dropoffLocation?.address}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-100 p-4 rounded-lg flex justify-between items-center">
                        <span className="font-semibold text-slate-600">Estimated Fare</span>
                        <span className="text-xl font-bold text-green-700">{trip.fare?.toLocaleString()} VND</span>
                    </div>
                </CardContent>
                {trip.status === 'COMPLETED' && (
                    <div className="w-full p-4 bg-green-50 text-green-700 rounded-lg text-center font-bold border border-green-200">
                        TRIP COMPLETED
                    </div>
                )}
                {trip.status === 'CANCELLED' && (
                    <div className="w-full p-4 bg-red-50 text-red-700 rounded-lg text-center font-bold border border-red-200">
                        TRIP CANCELLED
                    </div>
                )}
                <CardFooter className="pt-2 pb-6 flex flex-col gap-3">
                    {trip.status === 'ACCEPTED' && (
                        <>
                            <Button
                                className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                                onClick={handlePickup}
                                disabled={loading}
                            >
                                <Navigation className="w-5 h-5 mr-2" /> {loading ? 'Processing...' : 'I Have Arrived'}
                            </Button>
                            <Button variant="destructive" className="w-full" onClick={() => setShowAbandonDialog(true)} disabled={loading}>
                                Cancel Trip
                            </Button>
                        </>
                    )}
                    {trip.status === 'IN_PROGRESS' && (
                        <>
                            <Button
                                className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200"
                                onClick={() => setShowCompleteDialog(true)}
                                disabled={loading}
                            >
                                <DollarSign className="w-5 h-5 mr-2" /> {loading ? 'Processing...' : 'Complete & Collect Cash'}
                            </Button>
                            <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={() => setShowAbandonDialog(true)} disabled={loading}>
                                Abandon Trip (Emergency)
                            </Button>
                        </>
                    )}
                </CardFooter>
            </Card>

            <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Complete Trip</AlertDialogTitle>
                        <AlertDialogDescription>
                            Please confirm that you have arrived at the destination and collected
                            <span className="font-bold text-green-600 ml-1">{trip.fare?.toLocaleString()} VND</span> in cash.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
                            Confirm Completion
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={showAbandonDialog} onOpenChange={setShowAbandonDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Abandon Trip</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to cancel this trip? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Go Back</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancel} className="bg-red-600 hover:bg-red-700">
                            Yes, Abandon Trip
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
