import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useAuth();
  const location = useLocation();

  // 1. Check Login: Are they authenticated?
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Check Role: Are they authorized?
  // We check if the user's role is in the 'allowedRoles' array.
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Optional: Redirect to unauthorized page or just home
    console.warn(`User role ${user.role} not authorized. Allowed: ${allowedRoles}`);
    return <Navigate to="/login" replace />;
  }



  // 3. Success
  return <Outlet />;
};

export default ProtectedRoute;