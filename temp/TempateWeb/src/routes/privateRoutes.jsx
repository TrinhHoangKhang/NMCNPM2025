import ProtectedRoute from '../components/ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import Order from '../pages/Order';
import Product from '@/pages/Product';
import { productService } from '@/services/productService.js';

const productsLoader = async () => {  
  let products = JSON.parse(localStorage.getItem("products"));

  if (!products || products.length === 0) {
    console.log('Fetch product from API')
    products = await productService.getall();
    localStorage.setItem("products", JSON.stringify(products));
  }
  else console.log("Load product from localStoage")
    // console.log(products);
  return products;  
};

export const privateRoutes = [
  {
    element: <ProtectedRoute allowedRoles={['user', 'admin']} />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/dashboard", element: <Dashboard />, loader: productsLoader },
          { path: "/product", element: <Product /> },
          { path: "/order", element: <Order /> },
          { path: "/profile", element: <Profile /> }
        ]
      }
    ]
  }
];