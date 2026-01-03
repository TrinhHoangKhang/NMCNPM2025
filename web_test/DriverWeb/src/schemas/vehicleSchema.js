import * as z from "zod";

export const vehicleSchema = z.object({
    type: z.enum(["Motorbike", "Car 4-Seat", "Car 7-Seat"], {
        required_error: "Please select a vehicle type",
    }),
    plate: z.string()
        .min(1, "License plate is required")
        .regex(/^[0-9]{2}-[A-Z0-9]{1,2}\s[0-9]{3,5}(\.[0-9]{2})?$/, "Invalid license plate format (e.g. 59-X1 123.45)"),
    color: z.string().min(1, "Color is required"),
    model: z.string().min(1, "Model is required"),
});
