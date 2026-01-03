import { z } from "zod";

// Drivers might need to validate if they want to filter trips or something, 
// but primarily they accept/reject. 
// This schema could be used for verifying incoming trip data structure if needed.

export const tripAcceptSchema = z.object({
    tripId: z.string().uuid()
});
