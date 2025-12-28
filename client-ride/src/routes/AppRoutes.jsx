import React from 'react';
import { createBrowserRouter } from 'react-router-dom';

import ProtectedRoute from './guards/ProtectedRoute';
import PublicRoute from './guards/PublicRoute';
import DashboardRedirect from '../components/shared/DashboardRedirect';


// Layouts
import MainLayout from '../layout/MainLayout';
import AuthLayout from '../layout/AuthLayout';

// Pages
import LandingPage from '../pages/LandingPage';
import Login from '../pages/Login';
import Register from '../pages/Register';
import HistoryPage from '../pages/HistoryPage';
import UserProfile from '../pages/UserProfile';
import DriverDashboard from '../pages/DriverDashboard';
import UserHome from '../pages/UserHome';
import RiderDashboard from '../pages/RiderDashboard';
import NotFound from '../pages/NotFound';

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
                    <ProtectedRoute allowedRoles={['RIDER']}>
                        <UserHome />
                    </ProtectedRoute>
                )
            },
            {
                path: "/map",
                element: (
                    <ProtectedRoute allowedRoles={['RIDER']}>
                        <RiderDashboard />
                    </ProtectedRoute>
                )
            },

            // Driver Routes
            {
                path: "/driver",
                element: (
                    <ProtectedRoute allowedRoles={['DRIVER']}>
                        <DriverDashboard />
                    </ProtectedRoute>
                ),
                loader: driverLoader
            },
            {
                path: "/driver/history",
                element: (
                    <ProtectedRoute allowedRoles={['DRIVER']}>
                        <HistoryPage />
                    </ProtectedRoute>
                )
            },



            // Shared Routes
            {
                path: "/dashboard",
                element: (
                    <ProtectedRoute allowedRoles={['RIDER', 'DRIVER']}>
                        {/* This will trigger the redirect logic in ProtectedRoute if role doesn't match the current path, but we want a dedicated component or logic here */}
                        <DashboardRedirect />
                    </ProtectedRoute>
                )
            },
            {
                path: "/history",
                element: (
                    <ProtectedRoute allowedRoles={['RIDER', 'DRIVER']}>
                        <HistoryPage />
                    </ProtectedRoute>
                )
            },
            {
                path: "/profile",
                element: (
                    <ProtectedRoute allowedRoles={['RIDER', 'DRIVER']}>
                        <UserProfile />
                    </ProtectedRoute>
                )
            },
            {
                path: "*",
                element: <NotFound />
            }
        ]
    }
]);

export default router;
