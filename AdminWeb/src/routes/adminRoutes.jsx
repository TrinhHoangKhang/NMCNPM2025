import ProtectedRoute from '../components/ProtectedRoute';
import AdminLayout from '../layouts/AdminLayout';
import TripsManagement from '../pages/TripsManagement';
import RidersManagement from '../pages/RidersManagement';
import DriversManagement from '../pages/DriversManagement';
import AdminsManagement from '../pages/AdminsManagement';
import Dashboard from '../pages/Dashboard';
import { Navigate } from 'react-router-dom';

export const adminRoutes = [
  {
    path: "/",
    element: <ProtectedRoute allowedRoles={['ADMIN']} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: "dashboard", element: <Dashboard /> },
          { path: "riders", element: <RidersManagement /> },
          { path: "drivers", element: <DriversManagement /> },
          { path: "admins", element: <AdminsManagement /> },
          { path: "trips", element: <TripsManagement /> }
        ]
      }
    ]
  }
];