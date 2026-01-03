import { z } from "zod"

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Must be a valid email" }),
  password: z
    .string()
    .min(1, { message: "Password is required" }),
})

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" }),

  email: z
    .string()
    .email({ message: "Invalid email address" }),

  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .max(11, { message: "Phone number must be at most 11 digits" })
    .regex(/^[0-9]+$/, { message: "Phone number must contain only numbers" }),

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