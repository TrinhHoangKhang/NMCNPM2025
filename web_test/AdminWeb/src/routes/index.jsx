import { createBrowserRouter } from 'react-router-dom';
import { publicRoutes } from './publicRoutes';
import { adminRoutes } from './adminRoutes';
import NotFound from '../pages/NotFound';

const router = createBrowserRouter([
  ...publicRoutes,
  ...adminRoutes,

  {
    path: "*",
    element: <NotFound />
  }
]);

export default router;