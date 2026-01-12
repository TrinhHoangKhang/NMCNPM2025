import ProtectedRoute from '../components/ProtectedRoute';
import AdminLayout from '../layouts/AdminLayout'; 
import UserManagement from '../pages/UserManagement';

export const adminRoutes = [
  {
    path: "/admin",
    element: <ProtectedRoute allowedRoles={['admin']} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: "users", element: <UserManagement /> }
        ]
      }
    ]
  }
];