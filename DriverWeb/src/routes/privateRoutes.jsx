import ProtectedRoute from '../components/ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import Dashboard from '../pages/Dashboard';
import AvailableJobs from '../pages/AvailableJobs';
import History from '../pages/History';
import Profile from '../pages/Profile';
import Simulation from '../pages/Simulation';

export const privateRoutes = [
  {
    element: <ProtectedRoute allowedRoles={['driver', 'admin']} />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/jobs", element: <AvailableJobs /> },
          { path: "/history", element: <History /> },
          { path: "/profile", element: <Profile /> },
          { path: "/simulation", element: <Simulation /> }
        ]
      }
    ]
  }
];