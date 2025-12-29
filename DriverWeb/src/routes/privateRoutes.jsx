import ProtectedRoute from '../components/ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import Dashboard from '../pages/Dashboard';
import History from '../pages/History';
import Profile from '../pages/Profile';

export const privateRoutes = [
  {
    element: <ProtectedRoute allowedRoles={['driver', 'admin']} />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/history", element: <History /> },
          { path: "/profile", element: <Profile /> }
        ]
      }
    ]
  }
];