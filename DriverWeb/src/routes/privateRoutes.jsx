import ProtectedRoute from '../components/ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import Dashboard from '../pages/Dashboard';
import AvailableJobs from '../pages/AvailableJobs';
import OtherUserProfile from '../pages/OtherUserProfile';
import Settings from '../pages/Settings';
import Achievement from '../pages/Achievement';
import History from '../pages/History';
import Ranking from '../pages/Ranking';
import Profile from '../pages/Profile';
import Simulation from '../pages/Simulation';
import TripDetails from '../pages/TripDetails';

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
          { path: "/ranking", element: <Ranking /> },
          { path: "/profile", element: <Profile /> },
          { path: "/profile/:id", element: <OtherUserProfile /> },
          { path: "/settings", element: <Settings /> },
          { path: "/achievements", element: <Achievement /> },
          { path: "/simulation", element: <Simulation /> },
          { path: "/trip/:id", element: <TripDetails /> }
        ]
      }
    ]
  }
];