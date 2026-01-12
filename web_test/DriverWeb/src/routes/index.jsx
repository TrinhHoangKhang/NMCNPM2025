import { createBrowserRouter } from 'react-router-dom';
import { publicRoutes } from './publicRoutes';
import { privateRoutes } from './privateRoutes';
import NotFound from '../pages/NotFound';

const router = createBrowserRouter([
  ...publicRoutes,
  ...privateRoutes,

  {
    path: "*",
    element: <NotFound />
  }
]);

export default router;