import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const DashboardRedirect = () => {
    const { user } = useAuth();
    const role = user?.role?.toUpperCase();
    if (role === 'DRIVER') return <Navigate to="/driver" replace />;

    return <Navigate to="/home" replace />;
};

export default DashboardRedirect;
