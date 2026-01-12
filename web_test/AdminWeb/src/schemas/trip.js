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

    vehicleType: z.enum(["MOTORBIKE", "4 SEAT", "7 SEAT"], {
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
    vehicleType: z.enum(["MOTORBIKE", "4 SEAT", "7 SEAT"])
});
