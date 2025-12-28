import React from 'react';
import { createBrowserRouter } from 'react-router-dom';

import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

// Layouts
import MainLayout from '../layout/MainLayout';
import AuthLayout from '../layout/AuthLayout';

// Pages
import LandingPage from '../pages/LandingPage';
import AdminDashboard from '../pages/AdminDashboard';
import Login from '../pages/Login';
import Register from '../pages/Register';
import UserManagement from '../pages/UserManagement';
import HistoryPage from '../pages/HistoryPage';
import UserProfile from '../pages/UserProfile';
import DriverDashboard from '../pages/DriverDashboard';
import UserHome from '../pages/UserHome';
import RiderDashboard from '../pages/RiderDashboard';

// Loaders
import { driverLoader } from '../loaders/driverLoader';

const router = createBrowserRouter([
    {
        element: <MainLayout />,
        children: [
            {
                path: "/",
                element: (
                    <PublicRoute>
                        <LandingPage />
                    </PublicRoute>
                )
            }
        ]
    },
    {
        element: <AuthLayout />,
        children: [
            {
                path: "/login",
                element: (
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                )
            },
            {
                path: "/register",
                element: (
                    <PublicRoute>
                        <Register />
                    </PublicRoute>
                )
            }
        ]
    },
    {
        element: <MainLayout />,
        children: [
            // Rider Routes
            {
                path: "/home",
                element: (
                    <ProtectedRoute allowedRoles={['rider', 'admin']}>
                        <UserHome />
                    </ProtectedRoute>
                )
            },
            {
                path: "/map",
                element: (
                    <ProtectedRoute allowedRoles={['rider', 'admin']}>
                        <RiderDashboard />
                    </ProtectedRoute>
                )
            },

            // Driver Routes
            {
                path: "/driver",
                element: (
                    <ProtectedRoute allowedRoles={['driver', 'admin']}>
                        <DriverDashboard />
                    </ProtectedRoute>
                ),
                loader: driverLoader
            },
            {
                path: "/driver/history",
                element: (
                    <ProtectedRoute allowedRoles={['driver']}>
                        <HistoryPage />
                    </ProtectedRoute>
                )
            },

            // Admin Routes
            {
                path: "/users",
                element: (
                    <ProtectedRoute allowedRoles={['admin']}>
                        <UserManagement />
                    </ProtectedRoute>
                )
            },

            // Shared Routes
            {
                path: "/history",
                element: (
                    <ProtectedRoute allowedRoles={['rider', 'driver', 'admin']}>
                        <HistoryPage />
                    </ProtectedRoute>
                )
            },
            {
                path: "/profile",
                element: (
                    <ProtectedRoute allowedRoles={['rider', 'driver', 'admin']}>
                        <UserProfile />
                    </ProtectedRoute>
                )
            }
        ]
    }
]);

export default router;
