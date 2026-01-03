import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-400 rounded-lg border bg-card text-card-foreground shadow-sm p-8">

        <Outlet />
        
      </div>
    </div>
  );
};

export default AuthLayout;