import { createBrowserRouter } from 'react-router-dom';
import { publicRoutes } from './publicRoutes';
import { privateRoutes } from './privateRoutes';
import { adminRoutes } from './adminRoutes';
import NotFound from '../pages/NotFound';

const router = createBrowserRouter([
  ...publicRoutes,
  ...privateRoutes,
  ...adminRoutes,
  
  {
    path: "*",
    element: <NotFound />
  }
]);

export default router;