import ProtectedRoute from '../components/ProtectedRoute';
import AdminLayout from '../layouts/AdminLayout';
import UserManagement from '../pages/UserManagement';
import TripsManagement from '../pages/TripsManagement';
import RidersManagement from '../pages/RidersManagement';
import DriversManagement from '../pages/DriversManagement';
import { Navigate } from 'react-router-dom';

export const adminRoutes = [
  {
    path: "/",
    element: <ProtectedRoute allowedRoles={['ADMIN']} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="/riders" replace /> },
          { path: "riders", element: <RidersManagement /> },
          { path: "drivers", element: <DriversManagement /> },
          { path: "users", element: <UserManagement /> },
          { path: "trips", element: <TripsManagement /> }
        ]
      }
    ]
  }
];