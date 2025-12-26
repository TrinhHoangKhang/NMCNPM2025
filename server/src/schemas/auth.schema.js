import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters')
});

export const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().regex(/^\+?[\d\s-]{10,15}$/, 'Invalid phone number format'),
    role: z.enum(['RIDER', 'DRIVER']),
    password: z.string().min(6, 'Password must be at least 6 characters')
});
