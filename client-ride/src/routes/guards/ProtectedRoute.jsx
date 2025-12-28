import LoadingScreen from '../../components/shared/LoadingScreen';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) return <LoadingScreen message="Verifying authentication..." />;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const userRole = user.role?.toUpperCase();
    const normalizedAllowedRoles = allowedRoles?.map(role => role.toUpperCase());

    console.log('ProtectedRoute Check:', {
        path: window.location.pathname,
        userRole,
        allowedRoles: normalizedAllowedRoles,
        hasUser: !!user
    });

    if (normalizedAllowedRoles && !normalizedAllowedRoles.includes(userRole)) {
        return <Navigate to="/not-found" replace />;
    }

    return children;
};

export default ProtectedRoute;
