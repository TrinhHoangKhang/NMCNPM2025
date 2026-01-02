import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tripRequestSchema } from "@/schemas/trip";
import { tripService } from "@/services/tripService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, Bike, Car, Navigation, Wallet, Banknote } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { useSocket } from "@/context";

export default function BookingForm({
    pickupLocation, setPickupLocation,
    dropoffLocation, setDropoffLocation,
    selectionMode, setSelectionMode,
    onCreatePath
}) {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { connectSocket, socket } = useSocket();
    const [estimate, setEstimate] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [findingDriver, setFindingDriver] = useState(false);
    const [countdown, setCountdown] = useState(60);

    // Socket Listeners for Trip Matching
    useEffect(() => {
        if (!socket) return;

        const onTripAccepted = (data) => {
            console.log("Trip Accepted:", data);
            setFindingDriver(false);
            showToast("Driver Found!", `Your driver ${data.driverName} is on the way.`);
            navigate(`/trip/${data.tripId}`);
        };

        const onTripNoDriver = (data) => {
            console.log("No Driver Found:", data);
            setFindingDriver(false);
            showToast("No Driver Found", data.message);
            setCountdown(60); // Reset
        };

        socket.on('trip_accepted', onTripAccepted);
        socket.on('trip_no_driver', onTripNoDriver);

        return () => {
            socket.off('trip_accepted', onTripAccepted);
            socket.off('trip_no_driver', onTripNoDriver);
        };
    }, [socket, showToast]);

    // Check for active trip on mount to restore state
    useEffect(() => {
        const checkActiveTrip = async () => {
            try {
                const activeTrip = await tripService.getCurrentTrip();
                if (activeTrip) {
                    console.log("Found active trip:", activeTrip);
                    // Determine state based on trip status
                    if (activeTrip.status === 'REQUESTED' || activeTrip.status === 'SEARCHING') {
                        setFindingDriver(true);
                        // Connect socket if not already connected
                        connectSocket();
                    } else if (['ACCEPTED', 'IN_PROGRESS', 'PICKUP', 'ARRIVED'].includes(activeTrip.status)) {
                        navigate(`/trip/${activeTrip.id}`);
                    }
                }
            } catch (error) {
                // It's fine if there's no active trip or 404
                console.log("No active trip found or check failed", error);
            }
        };

        checkActiveTrip();
    }, [navigate, connectSocket]);

    // Countdown Timer
    useEffect(() => {
        let timer;
        if (findingDriver && countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        } else if (countdown === 0) {
            // Client-side timeout safety (Waiting for server confirmation though)
            // setFindingDriver(false); 
        }
        return () => clearInterval(timer);
    }, [findingDriver, countdown]);

    const form = useForm({
        resolver: zodResolver(tripRequestSchema),
        defaultValues: {
            pickupLocation: pickupLocation,
            dropoffLocation: dropoffLocation,
            vehicleType: "MOTORBIKE",
            paymentMethod: "CASH" // Defaulting to CASH as UI is removed
        }
    });

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        // Connect socket before request (User requirement)
        connectSocket();

        try {
            await tripService.requestTrip({
                pickupLocation: data.pickupLocation,
                dropoffLocation: data.dropoffLocation,
                vehicleType: data.vehicleType,
                paymentMethod: data.paymentMethod,
                price: estimate?.price || 0,
                distance: estimate?.distance || 0
            });
            // Request sent successfully, now wait for driver
            setFindingDriver(true);
            setCountdown(60);
        } catch (error) {
            console.error("Trip request error:", error);
            showToast("Error", "Failed to request ride. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getEstimate = async () => {
        const values = form.getValues();
        if (!values.pickupLocation?.address || !values.dropoffLocation?.address) {
            showToast("Error", "Please select pickup and dropoff locations");
            return;
        }

        try {
            // Mock estimate or call API
            const result = await tripService.estimateTrip({
                pickupLocation: values.pickupLocation.address,
                dropoffLocation: values.dropoffLocation.address,
                vehicleType: values.vehicleType
            });
            setEstimate(result);
        } catch (error) {
            console.error("Estimate error", error);
            // Fallback
            setEstimate({ distance: 12.5, price: 45000 });
        }
    };

    const handlePickupChange = (e) => {
        const val = e.target.value;
        const newLoc = { ...pickupLocation, address: val };
        setPickupLocation(newLoc);
        form.setValue("pickupLocation", newLoc);
    };

    const handleDropoffChange = (e) => {
        const val = e.target.value;
        const newLoc = { ...dropoffLocation, address: val };
        setDropoffLocation(newLoc);
        form.setValue("dropoffLocation", newLoc);
    };

    const handleCreatePathClick = async () => {
        const values = form.getValues();
        if (!values.pickupLocation?.address || !values.dropoffLocation?.address) {
            showToast("Error", "Please select pickup and dropoff locations");
            return;
        }

        try {
            // New service method
            const routeData = await tripService.getRoute(values.pickupLocation, values.dropoffLocation);
            if (routeData) {
                onCreatePath(routeData.path);
            }
        } catch (error) {
            console.error("Path creation error", error);
            // Fallback to straight line handled by Map.jsx if we don't pass anything, 
            // but tripService returns fallback anyway.
            onCreatePath(null);
        }
    };

    // Update form when props change
    useEffect(() => {
        form.setValue("pickupLocation", pickupLocation);
    }, [pickupLocation, form]);

    useEffect(() => {
        form.setValue("dropoffLocation", dropoffLocation);
    }, [dropoffLocation, form]);

    return (
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="pb-4 border-b">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Book Your Ride
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* Location Inputs with Timeline Connector */}
                        <div className="relative space-y-4">
                            {/* Vertical Line Connector */}
                            <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-slate-200 -z-10"></div>

                            {/* Pickup */}
                            <div className={`bg-white border rounded-lg p-3 shadow-sm transition-colors group ${selectionMode === 'PICKUP' ? 'ring-2 ring-green-500 border-green-500' : 'hover:border-green-400'}`}>
                                <FormLabel className="flex items-center gap-3 text-sm font-semibold text-slate-600 mb-1">
                                    <div className="h-3 w-3 rounded-full bg-green-500 ring-4 ring-green-100"></div> Pickup Location
                                </FormLabel>
                                <div className="pl-6">
                                    <FormField
                                        control={form.control}
                                        name="pickupLocation.address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter pickup location"
                                                        className="border-0 shadow-none p-0 h-auto text-sm font-medium focus-visible:ring-0 px-0 rounded-none placeholder:text-slate-400"
                                                        {...field}
                                                        onChange={handlePickupChange}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        variant="link"
                                        size="sm"
                                        type="button"
                                        className={`p-0 h-auto text-xs font-normal ${selectionMode === 'PICKUP' ? 'text-green-600 font-bold' : 'text-slate-400'}`}
                                        onClick={() => setSelectionMode(selectionMode === 'PICKUP' ? null : 'PICKUP')}
                                    >
                                        {selectionMode === 'PICKUP' ? 'Done picking' : 'Pick on map'}
                                    </Button>
                                </div>
                            </div>

                            {/* Dropoff */}
                            <div className={`bg-white border rounded-lg p-3 shadow-sm transition-colors group ${selectionMode === 'DROPOFF' ? 'ring-2 ring-red-500 border-red-500' : 'hover:border-red-400'}`}>
                                <FormLabel className="flex items-center gap-3 text-sm font-semibold text-slate-600 mb-1">
                                    <div className="h-3 w-3 rounded-full bg-red-500 ring-4 ring-red-100"></div> Dropoff Location
                                </FormLabel>
                                <div className="pl-6">
                                    <FormField
                                        control={form.control}
                                        name="dropoffLocation.address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter dropoff location"
                                                        className="border-0 shadow-none p-0 h-auto text-sm font-medium focus-visible:ring-0 px-0 rounded-none placeholder:text-slate-400"
                                                        {...field}
                                                        onChange={handleDropoffChange}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        variant="link"
                                        size="sm"
                                        type="button"
                                        className={`p-0 h-auto text-xs font-normal ${selectionMode === 'DROPOFF' ? 'text-red-600 font-bold' : 'text-slate-400'}`}
                                        onClick={() => setSelectionMode(selectionMode === 'DROPOFF' ? null : 'DROPOFF')}
                                    >
                                        {selectionMode === 'DROPOFF' ? 'Done picking' : 'Pick on map'}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <Button
                            type="button"
                            onClick={handleCreatePathClick}
                            variant="outline"
                            className="w-full h-10 border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                        >
                            <span className="flex items-center gap-2">
                                <Navigation className="h-4 w-4" /> Create Path
                            </span>
                        </Button>

                        <FormField
                            control={form.control}
                            name="vehicleType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base font-semibold">Select Vehicle</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            className="grid grid-cols-1 gap-3"
                                        >
                                            <FormItem>
                                                <FormControl>
                                                    <RadioGroupItem value="MOTORBIKE" id="MOTORBIKE" className="peer sr-only" />
                                                </FormControl>
                                                <Label
                                                    htmlFor="MOTORBIKE"
                                                    className="flex items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-slate-50 peer-data-[state=checked]:border-indigo-600 peer-data-[state=checked]:bg-indigo-50 [&:has([data-state=checked])]:border-indigo-600 cursor-pointer transition-all"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="bg-slate-100 p-2 rounded-full peer-data-[state=checked]:bg-indigo-200">
                                                            <Bike className="h-6 w-6 text-slate-600" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="font-semibold leading-none">RideGo Bike</div>
                                                            <div className="text-xs text-muted-foreground">Fast & Affordable</div>
                                                        </div>
                                                    </div>
                                                    <div className="font-bold text-lg">15K</div>
                                                </Label>
                                            </FormItem>

                                            <FormItem>
                                                <FormControl>
                                                    <RadioGroupItem value="4 SEAT" id="4_SEAT" className="peer sr-only" />
                                                </FormControl>
                                                <Label
                                                    htmlFor="4_SEAT"
                                                    className="flex items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-slate-50 peer-data-[state=checked]:border-indigo-600 peer-data-[state=checked]:bg-indigo-50 [&:has([data-state=checked])]:border-indigo-600 cursor-pointer transition-all"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="bg-slate-100 p-2 rounded-full">
                                                            <Car className="h-6 w-6 text-slate-600" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="font-semibold leading-none">RideGo Car 4</div>
                                                            <div className="text-xs text-muted-foreground">Comfort for 4</div>
                                                        </div>
                                                    </div>
                                                    <div className="font-bold text-lg">45K</div>
                                                </Label>
                                            </FormItem>

                                            <FormItem>
                                                <FormControl>
                                                    <RadioGroupItem value="7 SEAT" id="7_SEAT" className="peer sr-only" />
                                                </FormControl>
                                                <Label
                                                    htmlFor="7_SEAT"
                                                    className="flex items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-slate-50 peer-data-[state=checked]:border-indigo-600 peer-data-[state=checked]:bg-indigo-50 [&:has([data-state=checked])]:border-indigo-600 cursor-pointer transition-all"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="bg-slate-100 p-2 rounded-full">
                                                            <Car className="h-6 w-6 text-slate-600" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="font-semibold leading-none">RideGo Car 7</div>
                                                            <div className="text-xs text-muted-foreground">Spacious for groups</div>
                                                        </div>
                                                    </div>
                                                    <div className="font-bold text-lg">60K</div>
                                                </Label>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Payment Method removed as per request, defaulting to CASH */}

                        {estimate && (
                            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg text-sm space-y-1">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600 font-medium">Est. Distance</span>
                                    <span className="font-bold text-slate-900">{estimate.distance} km</span>
                                </div>
                                <div className="flex justify-between items-center text-lg">
                                    <span className="text-slate-600 font-medium">Total Price</span>
                                    <span className="font-bold text-indigo-700">{estimate.price} VND</span>
                                </div>
                            </div>
                        )}

                        <div className="pt-2">
                            <Button type="button" onClick={getEstimate} variant="ghost" className="w-full mb-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                                Check Price
                            </Button>
                            <Button type="submit" className="w-full h-14 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "Request Ride Now"}
                            </Button>
                        </div>

                    </form>
                </Form>

                {findingDriver && (
                    <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl animate-in fade-in duration-300">
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse rounded-full"></div>
                            <div className="relative h-32 w-32 rounded-full border-4 border-indigo-100 flex items-center justify-center bg-white shadow-xl">
                                <div className="text-4xl font-bold text-indigo-600 font-mono">
                                    {countdown}
                                </div>
                                <svg className="absolute inset-0 h-full w-full -rotate-90 stroke-indigo-600" viewBox="0 0 100 100">
                                    <circle
                                        className="text-gray-200"
                                        strokeWidth="4"
                                        stroke="currentColor"
                                        fill="transparent"
                                        r="46"
                                        cx="50"
                                        cy="50"
                                        style={{ strokeDasharray: 289, strokeDashoffset: 289 - (289 * countdown) / 60, transition: 'stroke-dashoffset 1s linear' }}
                                    />
                                </svg>
                            </div>
                        </div>
                        <h3 className="mt-8 text-xl font-bold text-slate-800">Finding your driver...</h3>
                        <p className="text-slate-500 mt-2 text-center px-8">
                            Please wait while we connect you with nearby drivers.
                        </p>
                        <Button
                            variant="ghost"
                            className="mt-8 text-slate-400 hover:text-red-500"
                            onClick={async () => {
                                try {
                                    await tripService.cancelTrip();
                                    setFindingDriver(false);
                                    setCountdown(60);
                                    showToast("Request Cancelled", "Your trip request has been cancelled.");
                                } catch (error) {
                                    console.error("Cancel error:", error);
                                    showToast("Error", "Failed to cancel request. Please try again.");
                                }
                            }}
                        >
                            Cancel Request
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
