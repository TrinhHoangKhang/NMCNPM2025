import { z } from "zod";

export const tripRequestSchema = z.object({
    pickupLocation: z.object({
        lat: z.number(),
        lng: z.number(),
        address: z.string().optional()
    }, { message: "Pickup location is required" }),

    dropoffLocation: z.object({
        lat: z.number(),
        lng: z.number(),
        address: z.string().optional()
    }, { message: "Dropoff location is required" }),

    vehicleType: z.enum(["Motorbike", "Car 4-Seat", "Car 7-Seat"], {
        message: "Invalid vehicle type"
    }),

    paymentMethod: z.enum(["CASH", "WALLET"], {
        message: "Invalid payment method"
    })
});

export const tripEstimateSchema = z.object({
    pickupLocation: z.object({
        lat: z.number(),
        lng: z.number()
    }),
    dropoffLocation: z.object({
        lat: z.number(),
        lng: z.number()
    }),
    vehicleType: z.enum(["Motorbike", "Car 4-Seat", "Car 7-Seat"])
});
