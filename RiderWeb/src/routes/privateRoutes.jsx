import ProtectedRoute from '../components/ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import Map from '../pages/Map';
import Dashboard from '../pages/Dashboard';
import History from '../pages/History';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import Achievement from '../pages/Achievement';
import TripDetails from '../pages/TripDetails';

export const privateRoutes = [
  {
    element: <ProtectedRoute allowedRoles={['user', 'admin']} />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/map", element: <Map /> },
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/history", element: <History /> },
          { path: "/profile", element: <Profile /> },
          { path: "/settings", element: <Settings /> },
          { path: "/achievements", element: <Achievement /> },
          { path: "/trip/:id", element: <TripDetails /> }
        ]
      }
    ]
  }
];