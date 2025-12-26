import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const userRole = user.role?.toUpperCase();
    const normalizedAllowedRoles = allowedRoles?.map(role => role.toUpperCase());

    if (normalizedAllowedRoles && !normalizedAllowedRoles.includes(userRole)) {
        return <Navigate to="/not-found" replace />;
    }

    return children;
};

export default ProtectedRoute;
