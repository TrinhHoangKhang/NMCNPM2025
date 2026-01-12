import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users 
} from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Products', href: '/product', icon: Package },
    { label: 'Orders', href: '/order', icon: ShoppingCart },
    { label: 'Customers', href: '/Profile', icon: Users },
  ];

  return (
    <aside className="w-full md:w-1/3 border bg-sky-50
        border-gray-300 rounded">
        <h2 className="p-4 mt-4 text-lg">NAVIGATION</h2>
        <div className="p-4 space-y-2 text-black font-bold">
            {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;

                return (
                    <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                        ${isActive 
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                        }`}
                    >
                    <Icon className="h-4 w-4" />
                    {item.label}
                    </Link>
                );
            })}
      </div>
    </aside>
  );
}