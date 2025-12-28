import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (user) {
        if (user.role === 'driver') return <Navigate to="/driver" replace />;
        // FIX: Redirect rider to /home (Main Menu) instead of /map
        if (user.role === 'rider') return <Navigate to="/home" replace />;
        if (user.role === 'admin') return <Navigate to="/users" replace />;
    }

    return children;
};

export default PublicRoute;
