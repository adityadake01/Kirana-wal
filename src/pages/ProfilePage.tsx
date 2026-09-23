import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import CustomerProfile from '../components/profile/CustomerProfile';
import SellerProfile from '../components/profile/SellerProfile';
import AdminProfile from '../components/profile/AdminProfile';
import { Shield, Store, User as UserIcon, LayoutDashboard, ShoppingBag } from 'lucide-react';

export default function ProfilePage() {
  const { user, role, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Quick Role & Switch Header */}
        <div className="mb-6 bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center text-emerald-700 font-bold text-xl shrink-0 shadow-sm">
              {user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-gray-900">
                  {user.displayName || 'User Profile'}
                </h1>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full capitalize ${
                  role === 'admin' 
                    ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                    : role === 'shopkeeper' 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}>
                  {role === 'admin' ? '🛡️ Admin' : role === 'shopkeeper' ? '🏪 Shopkeeper' : '👤 Customer'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{user.email}</p>
            </div>
          </div>

          {/* Quick Dashboard Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {role === 'admin' && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>ॲडमिन डॅशबोर्ड (Admin Panel)</span>
              </Link>
            )}

            {role === 'shopkeeper' && (
              <Link
                to="/shopkeeper"
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
              >
                <Store className="h-4 w-4" />
                <span>दुकान डॅशबोर्ड (Shop Panel)</span>
              </Link>
            )}

            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>माझ्या ऑर्डर्स (Orders)</span>
            </Link>
          </div>
        </div>

        {/* Dynamic Role Profile Component */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-8">
          {role === 'admin' ? (
            <AdminProfile />
          ) : role === 'shopkeeper' ? (
            <SellerProfile />
          ) : (
            <CustomerProfile />
          )}
        </div>

      </div>
    </div>
  );
}
