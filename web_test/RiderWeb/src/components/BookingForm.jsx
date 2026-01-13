import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tripRequestSchema } from "@/schemas/trip";
import { tripService } from "@/services/tripService";
import { apiClient } from "@/services/apiService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetDescription
} from "@/components/ui/sheet";
import { Loader2, MapPin, Bike, Car, Navigation, Wallet, Banknote, Tag, CheckCircle2, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { useSocket } from "@/context";

export default function BookingForm({
    pickupLocation, setPickupLocation,
    dropoffLocation, setDropoffLocation,
    selectionMode, setSelectionMode,
    onCreatePath,
    initialData = {} // New prop for pre-filling
}) {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { connectSocket, socket } = useSocket();
    const [estimate, setEstimate] = useState(null);
    const [baseEstimate, setBaseEstimate] = useState(null); // Price before discount
    const [routeInfo, setRouteInfo] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [findingDriver, setFindingDriver] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [myDiscounts, setMyDiscounts] = useState([]);
    const [selectedDiscountId, setSelectedDiscountId] = useState(null);
    const [isDiscountSheetOpen, setIsDiscountSheetOpen] = useState(false);

    // Fetch user discounts on mount
    useEffect(() => {
        const fetchDiscounts = async () => {
            try {
                const response = await apiClient('/discounts');
                setMyDiscounts(response || []);
            } catch (err) {
                console.error("Failed to fetch discounts", err);
            }
        };
        fetchDiscounts();
    }, []);

    // Socket Listeners for Trip Matching
    useEffect(() => {
        if (!socket) return;
        const onTripAccepted = (data) => {
            setFindingDriver(false);
            showToast("Driver Found!", `Your driver ${data.driverName} is on the way.`);
            navigate(`/trip/${data.tripId}`);
        };
        const onTripNoDriver = (data) => {
            setFindingDriver(false);
            showToast("No Driver Found", data.message);
            setCountdown(60);
        };
        socket.on('trip_accepted', onTripAccepted);
        socket.on('trip_no_driver', onTripNoDriver);
        return () => {
            socket.off('trip_accepted', onTripAccepted);
            socket.off('trip_no_driver', onTripNoDriver);
        };
    }, [socket, showToast, navigate]);

    // Check for active trip on mount to restore state
    useEffect(() => {
        const checkActiveTrip = async () => {
            try {
                const activeTrip = await tripService.getCurrentTrip();
                if (activeTrip && (activeTrip.status === 'REQUESTED' || activeTrip.status === 'SEARCHING')) {
                    setFindingDriver(true);
                    connectSocket();
                } else if (activeTrip && ['ACCEPTED', 'IN_PROGRESS', 'PICKUP', 'ARRIVED'].includes(activeTrip.status)) {
                    navigate(`/trip/${activeTrip.id}`);
                }
            } catch (error) {
                console.log("No active trip found", error);
            }
        };
        checkActiveTrip();
    }, [navigate, connectSocket]);

    // Countdown Timer
    useEffect(() => {
        let timer;
        if (findingDriver && countdown > 0) {
            timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
        } else if (countdown === 0) {
            setFindingDriver(false);
            showToast("Timeout", "No driver found. Please try again.");
        }
        return () => clearInterval(timer);
    }, [findingDriver, countdown, showToast]);

    const form = useForm({
        resolver: zodResolver(tripRequestSchema),
        defaultValues: {
            pickupLocation: pickupLocation,
            dropoffLocation: dropoffLocation,
            vehicleType: initialData.vehicleType || "Motorbike",
            paymentMethod: initialData.paymentMethod || "CASH"
        }
    });

    // Auto-prefill and re-estimate if initialData arrives from Chatbot
    useEffect(() => {
        if (initialData.pickupLocation) setPickupLocation(initialData.pickupLocation);
        if (initialData.dropoffLocation) setDropoffLocation(initialData.dropoffLocation);

        // If we have both locations, auto-create path and get estimate
        if (initialData.pickupLocation && initialData.dropoffLocation) {
            const autoInit = async () => {
                const routeData = await tripService.getRoute(initialData.pickupLocation, initialData.dropoffLocation);
                if (routeData) {
                    onCreatePath(routeData.path);
                    setRouteInfo({ distance: routeData.distance, duration: routeData.duration });
                    // Give it a small delay for state sync
                    const currentVehicle = form.getValues("vehicleType");
                    setTimeout(() => updateVehiclePrice(currentVehicle), 500);
                }
            };
            autoInit();
        }
    }, [initialData]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        connectSocket();

        try {
            await tripService.requestTrip({
                pickupLocation: data.pickupLocation,
                dropoffLocation: data.dropoffLocation,
                vehicleType: data.vehicleType,
                paymentMethod: data.paymentMethod,
                fare: estimate?.fare || 0, // Using server-calculated fare
                distance: estimate?.distance || routeInfo?.distance || 0,
                discountId: selectedDiscountId
            });
            setFindingDriver(true);
            setCountdown(60);
        } catch (error) {
            console.error("Trip request error:", error);
            showToast("Error", error.message || "Failed to request ride.");
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
            const result = await tripService.estimateTrip({
                pickupLocation: values.pickupLocation,
                dropoffLocation: values.dropoffLocation,
                vehicleType: values.vehicleType,
                discountId: selectedDiscountId
            });
            setEstimate(result);
            if (!selectedDiscountId) {
                setBaseEstimate(result);
            }
        } catch (error) {
            console.error("Estimate error", error);
            showToast("Price Error", "Could not calculate fare from server.");
        }
    };

    const updateVehiclePrice = async (vehicleType) => {
        const values = form.getValues();
        if (!values.pickupLocation?.address || !values.dropoffLocation?.address) return;

        try {
            const result = await tripService.estimateTrip({
                pickupLocation: values.pickupLocation,
                dropoffLocation: values.dropoffLocation,
                vehicleType: vehicleType,
                discountId: null // Force no discount for base price
            });
            setBaseEstimate(result);
            // If the current chosen discount is no longer applicable, reset it
            if (selectedDiscountId) {
                const discount = myDiscounts.find(d => d.id === selectedDiscountId);
                if (discount && discount.minOrderValue > result.fare) {
                    setSelectedDiscountId(null);
                    setEstimate(null);
                    showToast("Discount Removed", "The selected discount is not applicable for this vehicle price.");
                } else {
                    // Re-calculate estimate with existing discount for the new vehicle
                    const finalResult = await tripService.estimateTrip({
                        pickupLocation: values.pickupLocation,
                        dropoffLocation: values.dropoffLocation,
                        vehicleType: vehicleType,
                        discountId: selectedDiscountId
                    });
                    setEstimate(finalResult);
                }
            } else {
                setEstimate(null); // Force user to click "Check Final Price" or just show base as estimate?
                // User requirement: "press check final price will show price of the trip"
                // So I will setEstimate(null) to hide the final price card until they click it.
            }
        } catch (error) {
            console.error("Update price error", error);
        }
    };

    const usableDiscounts = myDiscounts.filter(d => {
        const baseFare = baseEstimate?.fare || 0;
        return d.minOrderValue <= baseFare;
    });

    const selectedDiscount = myDiscounts.find(d => d.id === selectedDiscountId);

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
            const routeData = await tripService.getRoute(values.pickupLocation, values.dropoffLocation);
            if (routeData) {
                onCreatePath(routeData.path);
                setRouteInfo({ distance: routeData.distance, duration: routeData.duration });
                // Reset estimate to force user to re-check with new distance
                setEstimate(null);
            }
        } catch (error) {
            console.error("Path creation error", error);
            onCreatePath(null);
        }
    };

    // Update form when props change from Map interaction
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
            <CardContent className="pt-6 relative">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* Location Inputs */}
                        <div className="relative space-y-4">
                            <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-slate-200 -z-10"></div>
                            <div className={`bg-white border rounded-lg p-3 shadow-sm transition-colors group ${selectionMode === 'PICKUP' ? 'ring-2 ring-green-500 border-green-500' : 'hover:border-green-400'}`}>
                                <FormLabel className="flex items-center gap-3 text-sm font-semibold text-slate-600 mb-1">
                                    <div className="h-3 w-3 rounded-full bg-green-500 ring-4 ring-green-100"></div> Pickup Location
                                </FormLabel>
                                <div className="pl-6">
                                    <FormField control={form.control} name="pickupLocation.address" render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter pickup location"
                                                    className="border-0 shadow-none p-0 h-auto text-sm font-medium focus-visible:ring-0 px-0 rounded-none placeholder:text-slate-400"
                                                    {...field}
                                                    onChange={handlePickupChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )} />
                                    <Button variant="link" size="sm" type="button" className={`p-0 h-auto text-xs font-normal ${selectionMode === 'PICKUP' ? 'text-green-600 font-bold' : 'text-slate-400'}`} onClick={() => setSelectionMode(selectionMode === 'PICKUP' ? null : 'PICKUP')}>
                                        {selectionMode === 'PICKUP' ? 'Done picking' : 'Pick on map'}
                                    </Button>
                                </div>
                            </div>

                            <div className={`bg-white border rounded-lg p-3 shadow-sm transition-colors group ${selectionMode === 'DROPOFF' ? 'ring-2 ring-red-500 border-red-500' : 'hover:border-red-400'}`}>
                                <FormLabel className="flex items-center gap-3 text-sm font-semibold text-slate-600 mb-1">
                                    <div className="h-3 w-3 rounded-full bg-red-500 ring-4 ring-red-100"></div> Dropoff Location
                                </FormLabel>
                                <div className="pl-6">
                                    <FormField control={form.control} name="dropoffLocation.address" render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter dropoff location"
                                                    className="border-0 shadow-none p-0 h-auto text-sm font-medium focus-visible:ring-0 px-0 rounded-none placeholder:text-slate-400"
                                                    {...field}
                                                    onChange={handleDropoffChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )} />
                                    <Button variant="link" size="sm" type="button" className={`p-0 h-auto text-xs font-normal ${selectionMode === 'DROPOFF' ? 'text-red-600 font-bold' : 'text-slate-400'}`} onClick={() => setSelectionMode(selectionMode === 'DROPOFF' ? null : 'DROPOFF')}>
                                        {selectionMode === 'DROPOFF' ? 'Done picking' : 'Pick on map'}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Button type="button" onClick={handleCreatePathClick} variant="outline" className="w-full h-10 border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50 transition-all active:scale-95">
                                <span className="flex items-center gap-2 font-bold"><Navigation className="h-4 w-4" /> Create Path & Calculate</span>
                            </Button>
                            {routeInfo && (
                                <div className="flex justify-between items-center px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg animate-in slide-in-from-top-1 duration-300">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <MapPin className="h-3 w-3" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Total Distance</span>
                                    </div>
                                    <span className="font-black text-indigo-600">{(Number(routeInfo.distance) / 1000).toFixed(1)} km</span>
                                </div>
                            )}
                        </div>

                        <FormField control={form.control} name="vehicleType" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-base font-semibold">Select Vehicle</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={(val) => {
                                        field.onChange(val);
                                        updateVehiclePrice(val);
                                    }} value={field.value} className="grid grid-cols-1 gap-3">
                                        {[
                                            { id: "Motorbike", label: "Motorbike", icon: Bike, desc: "Fast & Affordable" },
                                            { id: "Car 4-Seat", label: "Car 4 Seat", icon: Car, desc: "Comfort for 4" },
                                            { id: "Car 7-Seat", label: "Car 7 Seat", icon: Car, desc: "Spacious for groups" }
                                        ].map(v => (
                                            <FormItem key={v.id}>
                                                <FormControl><RadioGroupItem value={v.id} id={v.id} className="peer sr-only" /></FormControl>
                                                <Label htmlFor={v.id} className="flex items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-slate-50 peer-data-[state=checked]:border-indigo-600 peer-data-[state=checked]:bg-indigo-50 cursor-pointer transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="bg-slate-100 p-2 rounded-full"><v.icon className="h-6 w-6 text-slate-600" /></div>
                                                        <div className="space-y-1">
                                                            <div className="font-semibold">{v.label}</div>
                                                            <div className="text-xs text-muted-foreground">{v.desc}</div>
                                                        </div>
                                                    </div>
                                                    {baseEstimate && field.value === v.id && (
                                                        <div className="text-right">
                                                            <div className="font-black text-lg text-indigo-600">{(baseEstimate.fare / 1000).toFixed(0)}K</div>
                                                            <div className="text-[10px] text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded-sm">
                                                                {baseEstimate.duration} mins • Base
                                                            </div>
                                                        </div>
                                                    )}
                                                </Label>
                                            </FormItem>
                                        ))}
                                    </RadioGroup>
                                </FormControl>
                            </FormItem>
                        )} />

                        {baseEstimate && !estimate && (
                            <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-lg animate-in fade-in duration-300">
                                <span className="text-sm font-semibold text-slate-500">Estimate Base Fare</span>
                                <span className="text-lg font-black text-slate-700">{baseEstimate.fare.toLocaleString()} đ</span>
                            </div>
                        )}

                        {/* Discount Selection */}
                        <div className="space-y-3">
                            <FormLabel className="text-base font-semibold flex items-center gap-2">
                                <Tag className="h-4 w-4 text-indigo-500" /> Vouchers & Discounts
                            </FormLabel>

                            <Sheet open={isDiscountSheetOpen} onOpenChange={setIsDiscountSheetOpen}>
                                <SheetTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full flex justify-between items-center h-12 bg-slate-50 border-slate-200 hover:bg-slate-100 group"
                                        disabled={!baseEstimate}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Tag className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                            <span className="text-sm font-medium">
                                                {selectedDiscount ? (
                                                    <span className="text-indigo-600 font-bold">{selectedDiscount.code} Applied</span>
                                                ) : "Select a discount"}
                                            </span>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-slate-400" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl p-6">
                                    <SheetHeader className="mb-6">
                                        <SheetTitle className="text-2xl font-black">Available Discounts</SheetTitle>
                                        <SheetDescription>
                                            Choose one discount for your trip. Minimum order values apply.
                                        </SheetDescription>
                                    </SheetHeader>

                                    <div className="space-y-4 overflow-y-auto max-h-[50vh] pr-2 custom-scrollbar">
                                        {usableDiscounts.length === 0 ? (
                                            <div className="text-center py-12 space-y-4">
                                                <div className="bg-slate-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto">
                                                    <Tag className="h-8 w-8 text-slate-300" />
                                                </div>
                                                <p className="text-slate-500 font-medium">No usable discounts for this trip value.</p>
                                                {baseEstimate && (
                                                    <p className="text-xs text-slate-400">Base fare: {baseEstimate.fare.toLocaleString()} đ</p>
                                                )}
                                            </div>
                                        ) : (
                                            usableDiscounts.map(d => (
                                                <div
                                                    key={d.id}
                                                    onClick={() => {
                                                        setSelectedDiscountId(selectedDiscountId === d.id ? null : d.id);
                                                        setEstimate(null);
                                                        setIsDiscountSheetOpen(false);
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            setSelectedDiscountId(selectedDiscountId === d.id ? null : d.id);
                                                            setEstimate(null);
                                                            setIsDiscountSheetOpen(false);
                                                        }
                                                    }}
                                                    tabIndex={0}
                                                    className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md ${selectedDiscountId === d.id ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 bg-white hover:border-indigo-200'}`}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded tracking-wider uppercase">{d.code}</div>
                                                            {selectedDiscountId === d.id && <CheckCircle2 className="h-4 w-4 text-indigo-600 fill-indigo-100" />}
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-xl font-black text-indigo-600">
                                                                {d.type === 'PERCENT' ? `-${d.value}%` : `-${(d.value / 1000).toFixed(0)}k`}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm font-semibold text-slate-800">{d.description}</p>
                                                    <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold tracking-tighter">
                                                        Min order: {d.minOrderValue.toLocaleString()} đ • Max: {d.maxDiscount > 0 ? d.maxDiscount.toLocaleString() : "No limit"} đ
                                                    </p>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {selectedDiscountId && (
                                        <div className="mt-auto pt-6 border-t flex gap-3">
                                            <Button
                                                className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 font-bold"
                                                onClick={() => setIsDiscountSheetOpen(false)}
                                            >
                                                Confirm Selection
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                className="h-12 text-slate-500 font-semibold"
                                                onClick={() => { setSelectedDiscountId(null); setEstimate(null); setIsDiscountSheetOpen(false); }}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    )}
                                </SheetContent>
                            </Sheet>

                            {selectedDiscount && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-lg animate-in slide-in-from-left-2 duration-300">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    <span className="text-xs font-bold text-emerald-700">
                                        Applied: {selectedDiscount.description}
                                    </span>
                                </div>
                            )}
                        </div>

                        {estimate && (
                            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg text-sm space-y-3 animate-in slide-in-from-top-2 duration-300">
                                <div className="flex justify-between items-center text-xs pb-2 border-b border-indigo-100">
                                    <span className="text-slate-500 font-bold uppercase tracking-tighter">Fare Breakdown</span>
                                    {estimate.discountApplied && <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px]">DISCOUNT APPLIED</span>}
                                </div>

                                {estimate.fareBreakdown ? (
                                    <div className="space-y-1.5 pt-1 text-slate-600 font-medium">
                                        <div className="flex justify-between">
                                            <span>Base Fare</span>
                                            <span>{estimate.fareBreakdown.base.toLocaleString()} đ</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Distance & Time</span>
                                            <span>{estimate.fareBreakdown.distanceFare.toLocaleString()} đ</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-slate-600">
                                            <span>Platform Fee</span>
                                            <span className="font-medium text-slate-900">{estimate.fareBreakdown.platformFee.toLocaleString()} đ</span>
                                        </div>
                                        {estimate.fareBreakdown.discountAmount > 0 && (
                                            <div className="flex justify-between text-sm text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                                                <span>Discount Applied</span>
                                                <span>-{estimate.fareBreakdown.discountAmount.toLocaleString()} đ</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-xs text-slate-400 italic">Breakdown unavailable</div>
                                )}

                                <div className="pt-2 border-t border-indigo-100 flex justify-between items-baseline">
                                    <span className="text-slate-900 font-black text-base uppercase">Total Est.</span>
                                    <div className="text-right">
                                        <span className="font-black text-2xl text-indigo-700">{estimate.fare.toLocaleString()} đ</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="pt-2 space-y-3">
                            <Button type="button" onClick={getEstimate} variant="ghost" className="w-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border border-indigo-100 h-12">
                                Check Final Price
                            </Button>
                            <Button type="submit" className="w-full h-14 text-xl font-black bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 active:scale-95 transition-all" disabled={isSubmitting || !estimate}>
                                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "Đặt Xe Ngay"}
                            </Button>
                        </div>
                    </form>
                </Form>

                {findingDriver && (
                    <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl animate-in fade-in duration-300">
                        <div className="relative h-32 w-32 rounded-full border-4 border-indigo-100 flex items-center justify-center bg-white shadow-xl">
                            <div className="text-4xl font-bold text-indigo-600 font-mono">{countdown}</div>
                            <svg className="absolute inset-0 h-full w-full -rotate-90 stroke-indigo-600" viewBox="0 0 100 100">
                                <circle className="text-gray-100" strokeWidth="4" stroke="currentColor" fill="transparent" r="46" cx="50" cy="50" style={{ strokeDasharray: 289, strokeDashoffset: 289 - (289 * countdown) / 60, transition: 'stroke-dashoffset 1s linear' }} />
                            </svg>
                        </div>
                        <h3 className="mt-8 text-xl font-bold text-slate-800">Đang tìm tài xế...</h3>
                        <p className="text-slate-500 mt-2 text-center px-8 text-sm">Hệ thống đang kết nối bạn với tài xế gần nhất.</p>
                        <Button variant="ghost" className="mt-8 text-slate-400 hover:text-rose-500 font-bold" onClick={async () => {
                            try { await tripService.cancelTrip(); setFindingDriver(false); setCountdown(60); showToast("Đã hủy yêu cầu", "Chuyến đi của bạn đã được hủy."); } catch (error) { showToast("Lỗi", "Không thể hủy yêu cầu."); }
                        }}>Hủy yêu cầu</Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
