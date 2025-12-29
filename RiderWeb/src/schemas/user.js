import { z } from "zod";

export const userUpdateSchema = z.object({
    name: z.string().min(2).optional(),
    phone: z.string().regex(/^[0-9]{10,11}$/, "Invalid phone number").optional(),
    email: z.string().email().optional()
});
