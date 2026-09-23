import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, Store, FileText, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function MobileBottomNav() {
  const location = useLocation();
  const { user, role } = useAuthStore();

  // Do not show on desktop or if user is admin or shopkeeper (they have their own dashboard navs)
  if (role === 'admin' || role === 'shopkeeper') return null;

  const isActive = (path: string) => location.pathname === path;

  // Customer Bottom Nav
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 px-2 pb-safe">
      <div className="flex justify-between items-center h-16">
        <Link to="/" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/') ? 'text-green-700 font-bold' : 'text-gray-500 hover:text-gray-900'}`}>
          <Home className={`h-6 w-6 ${isActive('/') ? 'fill-green-700' : ''}`} />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link to="/categories" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/categories') ? 'text-green-700 font-bold' : 'text-gray-500 hover:text-gray-900'}`}>
          <LayoutGrid className={`h-6 w-6 ${isActive('/categories') ? 'text-green-700' : ''}`} />
          <span className="text-[10px] font-medium">Categories</span>
        </Link>
        <Link to="/shops" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/categories') || isActive('/shops') ? 'text-green-700 font-bold' : 'text-gray-500 hover:text-gray-900'}`}>
          <Store className={`h-6 w-6 ${isActive('/shops') || isActive('/categories') ? 'text-green-700' : ''}`} />
          <span className="text-[10px] font-medium">Stores</span>
        </Link>
        <Link to={user ? "/dashboard?tab=orders" : "/login"} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname.startsWith('/dashboard') || isActive('/customer/orders') ? 'text-green-700 font-bold' : 'text-gray-500 hover:text-gray-900'}`}>
          <FileText className={`h-6 w-6 ${location.pathname.startsWith('/dashboard') ? 'text-green-700' : ''}`} />
          <span className="text-[10px] font-medium">Orders</span>
        </Link>
        <Link to={user ? "/profile" : "/login"} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/profile') || isActive('/customer') || (!user && isActive('/login')) ? 'text-green-700 font-bold' : 'text-gray-500 hover:text-gray-900'}`}>
          <User className={`h-6 w-6 ${isActive('/profile') || isActive('/customer') ? 'text-green-700' : ''}`} />
          <span className="text-[10px] font-medium">Account</span>
        </Link>
      </div>
    </div>
  );
}
