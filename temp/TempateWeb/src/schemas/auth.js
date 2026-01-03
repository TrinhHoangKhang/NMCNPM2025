import { z } from "zod"

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, { message: "Username is required" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores" }),
  password: z
    .string()
    .min(1, { message: "Password is required" }),
})

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores" }),

  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" }),
    
  email: z
    .string()
    .email({ message: "Invalid email address" }),
    
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
    
  confirmPassword: z.string(),
  
  terms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms" }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})