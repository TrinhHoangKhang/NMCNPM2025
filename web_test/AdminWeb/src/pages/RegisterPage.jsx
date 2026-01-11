
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(2, 'Name is required'),
    phone: z.string().min(10, 'Phone number is required'),
});

const RegisterPage = () => {
    const { register: registerAuth } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data) => {
        try {
            // Force role to ADMIN
            const userData = { ...data, role: 'ADMIN' };
            const result = await registerAuth(userData);

            if (result && result.success) {
                navigate('/');
            } else {
                setError('root', {
                    type: 'manual',
                    message: result?.error || 'Registration failed'
                });
            }
        } catch (error) {
            setError('root', {
                type: 'manual',
                message: 'An unexpected error occurred'
            });
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                        Create Admin Account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Or{' '}
                        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            sign in to existing account
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="-space-y-px rounded-md shadow-sm">
                        <div>
                            <input
                                {...register('name')}
                                type="text"
                                className={`relative block w-full rounded-t-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3 ${errors.name ? 'ring-red-500' : ''
                                    }`}
                                placeholder="Full Name"
                            />
                            {errors.name && (
                                <p className="text-red-500 text-xs mt-1 px-1">{errors.name.message}</p>
                            )}
                        </div>
                        <div>
                            <input
                                {...register('email')}
                                type="email"
                                className={`relative block w-full border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3 ${errors.email ? 'ring-red-500' : ''
                                    }`}
                                placeholder="Email address"
                            />
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1 px-1">{errors.email.message}</p>
                            )}
                        </div>
                        <div>
                            <input
                                {...register('phone')}
                                type="tel"
                                className={`relative block w-full border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3 ${errors.phone ? 'ring-red-500' : ''
                                    }`}
                                placeholder="Phone Number"
                            />
                            {errors.phone && (
                                <p className="text-red-500 text-xs mt-1 px-1">{errors.phone.message}</p>
                            )}
                        </div>
                        <div>
                            <input
                                {...register('password')}
                                type="password"
                                className={`relative block w-full rounded-b-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3 ${errors.password ? 'ring-red-500' : ''
                                    }`}
                                placeholder="Password"
                            />
                            {errors.password && (
                                <p className="text-red-500 text-xs mt-1 px-1">{errors.password.message}</p>
                            )}
                        </div>
                    </div>

                    {errors.root && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">{errors.root.message}</h3>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-70"
                        >
                            {isSubmitting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Register Admin
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
