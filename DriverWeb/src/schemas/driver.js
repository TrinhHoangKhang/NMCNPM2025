import { z } from "zod";

export const driverUpdateSchema = z.object({
    vehicleType: z.enum(["MOTORBIKE", "4 SEAT", "7 SEAT"], {
        message: "Invalid vehicle type"
    }),
    licensePlate: z.string().min(1, "License plate is required"),
    name: z.string().min(2).optional(),
    phone: z.string().regex(/^[0-9]{10,11}$/, "Invalid phone number").optional(),
});
