import AuthLayout from '../layouts/AuthLayout';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Unauthorized from '../pages/Unauthorized';
import Landing from '../pages/Landing';

export const publicRoutes = [
  {
    path: "/",
    element: <Landing />
  },

  {
    path: "/unauthorized",
    element: <Unauthorized />
  }
];