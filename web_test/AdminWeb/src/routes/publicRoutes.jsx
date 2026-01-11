import AuthLayout from '../layouts/AuthLayout';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import Unauthorized from '../pages/Unauthorized';
import Landing from '../pages/Landing';

export const publicRoutes = [
  {
    path: "/",
    element: <Landing />
  },
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/register",
    element: <RegisterPage />
  },

  {
    path: "/unauthorized",
    element: <Unauthorized />
  }
];