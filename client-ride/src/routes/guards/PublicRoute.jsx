import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingScreen from '../../components/shared/LoadingScreen';

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <LoadingScreen message="Checking session..." />;

    if (user) {
        const role = user.role?.toUpperCase();
        if (role === 'DRIVER') return <Navigate to="/driver" replace />;
        if (role === 'RIDER') return <Navigate to="/home" replace />;

    }

    return children;
};

export default PublicRoute;
