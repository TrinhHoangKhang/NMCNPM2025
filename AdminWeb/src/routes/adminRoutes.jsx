import ProtectedRoute from '../components/ProtectedRoute';
import AdminLayout from '../layouts/AdminLayout';
import UserManagement from '../pages/UserManagement';
import { Navigate } from 'react-router-dom';

export const adminRoutes = [
  {
    path: "/",
    element: <ProtectedRoute allowedRoles={['admin']} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="/users" replace /> },
          { path: "users", element: <UserManagement /> }
        ]
      }
    ]
  }
];