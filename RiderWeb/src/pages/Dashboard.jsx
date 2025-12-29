import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tripRequestSchema } from "@/schemas/trip";
import { tripService } from "@/services/tripService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, MapPin } from "lucide-react";
import { useToast } from "@/hooks/useToast";

export default function Dashboard() {
  const { showToast } = useToast();
  const [estimate, setEstimate] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(tripRequestSchema),
    defaultValues: {
      pickupLocation: { lat: 10.762622, lng: 106.660172, address: "University of Science" }, // Default for demo
      dropoffLocation: { lat: 10.7769, lng: 106.7009, address: "Ben Thanh Market" },
      vehicleType: "MOTORBIKE",
      paymentMethod: "CASH"
    }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await tripService.requestTrip(data);
      if (res && res.id) {
        showToast("Success", "Trip requested successfully!", "success");
        // Logic to redirect or show "Waiting for driver" state
      } else {
        showToast("Error", "Failed to request trip", "error");
      }
    } catch (error) {
      showToast("Error", "An unexpected error occurred", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEstimate = async () => {
    const values = form.getValues();
    try {
      // Mock estimate call if backend isn't ready for complex logic
      const res = await tripService.estimateTrip({
        pickupLocation: values.pickupLocation,
        dropoffLocation: values.dropoffLocation,
        vehicleType: values.vehicleType
      });
      if (res) setEstimate(res);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="flex flex-col md:flex-row h-full gap-4 p-4">
      {/* Booking Form Side */}
      <div className="w-full md:w-1/3 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Book a Ride</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                <div className="space-y-2 border p-3 rounded bg-slate-50">
                  <FormLabel className="flex items-center gap-2"><MapPin className="h-4 w-4 text-green-600" /> Pickup</FormLabel>
                  <div className="text-sm font-medium text-slate-700">{form.watch('pickupLocation.address')}</div>
                  <Button variant="outline" size="sm" type="button">Select on Map</Button>
                </div>

                <div className="space-y-2 border p-3 rounded bg-slate-50">
                  <FormLabel className="flex items-center gap-2"><MapPin className="h-4 w-4 text-red-600" /> Dropoff</FormLabel>
                  <div className="text-sm font-medium text-slate-700">{form.watch('dropoffLocation.address')}</div>
                  <Button variant="outline" size="sm" type="button">Select on Map</Button>
                </div>

                <FormField
                  control={form.control}
                  name="vehicleType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select vehicle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MOTORBIKE">Motorbike</SelectItem>
                          <SelectItem value="4 SEAT">Car (4 Seat)</SelectItem>
                          <SelectItem value="7 SEAT">Car (7 Seat)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CASH">Cash</SelectItem>
                          <SelectItem value="WALLET">Wallet</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {estimate && (
                  <div className="p-4 bg-blue-50 rounded text-sm space-y-1">
                    <p><strong>Distance:</strong> {estimate.distance} km</p>
                    <p><strong>Price:</strong> {estimate.price} VND</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={getEstimate} className="flex-1">
                    Get Estimate
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin" /> : "Request Ride"}
                  </Button>
                </div>

              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Map Side */}
      <div className="w-full md:w-2/3 bg-slate-200 rounded min-h-[400px] flex items-center justify-center text-slate-500 font-bold text-lg border-2 border-dashed">
        MAP PLACEHOLDER
      </div>
    </div>
  );
}