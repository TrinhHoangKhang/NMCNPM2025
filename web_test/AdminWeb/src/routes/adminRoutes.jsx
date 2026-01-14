import ProtectedRoute from '../components/ProtectedRoute';
import AdminLayout from '../layouts/AdminLayout';
import TripsManagement from '../pages/TripsManagement';
import RidersManagement from '../pages/RidersManagement';
import DriversManagement from '../pages/DriversManagement';
import AdminsManagement from '../pages/AdminsManagement';
import Dashboard from '../pages/Dashboard';
import Settings from '../pages/Settings';
import DiscountsManagement from '../pages/DiscountsManagement';
import Achievement from '../pages/Achievement';
import DriverDetail from '../pages/DriverDetail';
import RiderDetail from '../pages/RiderDetail';
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
          { path: "riders/:id", element: <RiderDetail /> },
          { path: "drivers", element: <DriversManagement /> },
          { path: "drivers/:id", element: <DriverDetail /> },
          { path: "admins", element: <AdminsManagement /> },
          { path: "discounts", element: <DiscountsManagement /> },
          { path: "trips", element: <TripsManagement /> },
          { path: "settings", element: <Settings /> },
          { path: "achievements", element: <Achievement /> }
        ]
      }
    ]
  }
];