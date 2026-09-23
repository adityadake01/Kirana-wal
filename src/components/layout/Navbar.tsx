import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, Search, Store, LogOut, X, Package, MapPin, Globe } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useNotificationStore } from '../../store/notificationStore';
import { Bell } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';

export default function Navbar() {
  const { user, role } = useAuthStore();
  const { logoUrl } = useSettingsStore();
  const { unreadCount } = useNotificationStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [langDropdown, setLangDropdown] = useState(false);
  const [currentLang, setCurrentLang] = useState('English');

  const handleLogout = async () => {
    await signOut(auth);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Desktop Logo */}
            <div className="hidden md:flex items-center">
              <Link to="/" className="flex items-center gap-2">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="h-8 max-w-[150px] object-contain" />
                ) : (
                  <>
                    <Store className="h-8 w-8 text-green-700" />
                    <span className="text-2xl font-bold text-gray-900 tracking-tight">
                      <span className="text-green-700">Kirana</span>wala
                    </span>
                  </>
                )}
              </Link>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl px-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search for groceries, shops, or categories..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Navigation Items */}
            <div className="hidden md:flex items-center gap-6">
              {/* Language Switcher */}
              <div className="relative">
                <button 
                  onClick={() => setLangDropdown(!langDropdown)}
                  className="flex items-center gap-1 text-gray-600 hover:text-emerald-600 font-medium transition-colors"
                >
                  <Globe className="h-4 w-4" /> {currentLang}
                </button>
                {langDropdown && (
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100">
                    {['English', 'मराठी', 'हिंदी'].map((l) => (
                      <button 
                        key={l}
                        onClick={() => { setCurrentLang(l); setLangDropdown(false); }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Link to="/shops" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">
                All Shops
              </Link>
              
              
              {role === 'admin' && (
                <Link to="/admin" className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors">
                  Admin Panel
                </Link>
              )}

              {!user ? (
                <>
                  <Link to="/login" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">
                    Login
                  </Link>
                  <Link to="/register" className="bg-emerald-500 text-white px-5 py-2 rounded-full font-medium hover:bg-emerald-600 transition-colors shadow-sm">
                    Sign Up
                  </Link>
                  <Link to="/register?role=shopkeeper" className="text-emerald-600 border border-emerald-500 px-5 py-2 rounded-full font-medium hover:bg-emerald-50 transition-colors">
                    Become a Seller
                  </Link>
                </>
              ) : (
                <>
                  {role === 'customer' && (
                    <Link to="/cart" className="relative p-2 text-gray-600 hover:text-emerald-600 transition-colors">
                      <ShoppingCart className="h-6 w-6" />
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-emerald-500 rounded-full">
                        0
                      </span>
                    </Link>
                  )}
                  
                  
                  <Link to="/notifications" className="relative p-2 text-gray-600 hover:text-emerald-600 transition-colors">
                    <Bell className="h-6 w-6" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-orange-500 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                    {/* Live notification badge will be handled dynamically */}
                  </Link>

                  <div className="relative group">
                    <button className="flex items-center gap-2 p-2 text-gray-600 hover:text-emerald-600 transition-colors">
                      <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                        {user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                      </div>
                    </button>
                    
                    {/* Dropdown menu */}
                    <div className="absolute right-0 w-48 mt-2 bg-white rounded-lg shadow-xl py-2 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 border border-gray-100">
                      <div className="px-4 py-2 border-b border-gray-100 mb-2">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.displayName || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      
                      {role === 'admin' && (
                        <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600">
                          Admin Dashboard
                        </Link>
                      )}
                      {role === 'shopkeeper' && (
                        <Link to="/shopkeeper" className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600">
                          Shop Dashboard
                        </Link>
                      )}
                      {role === 'customer' && (
                        <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600">
                          My Orders
                        </Link>
                      )}
                      
                      <button 
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 mt-1 border-t border-gray-100"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile layout */}
            <div className="md:hidden flex items-center justify-between w-full">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="text-gray-800 hover:text-green-700 p-1"
              >
                <Menu className="h-7 w-7" />
              </button>
              
              <Link to="/" className="flex items-center gap-1">
                <Store className="h-7 w-7 text-green-700" />
                <span className="text-2xl font-bold text-gray-900 tracking-tight">
                  <span className="text-green-700">Kirana</span>wala
                </span>
              </Link>

              <div className="flex items-center gap-4">
                <button className="relative text-gray-800 hover:text-green-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bell"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-orange-500 rounded-full border-2 border-white">
                    3
                  </span>
                </button>
                <Link to="/cart" className="text-gray-800 hover:text-green-700">
                  <ShoppingCart className="h-6 w-6" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div 
            className="absolute top-0 right-0 h-full w-72 bg-white shadow-2xl flex flex-col transform transition-transform"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <span className="font-bold text-gray-900 flex items-center gap-2">
                <Store className="h-5 w-5 text-emerald-500" />
                Menu
              </span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500 hover:text-gray-900 bg-white rounded-full shadow-sm">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-4">
              {user && (
                <div className="px-6 pb-6 mb-6 border-b border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-lg">
                      {user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{user.displayName || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  
                  {role === 'customer' && (
                    <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg">
                      <Package className="h-4 w-4" /> My Orders
                    </Link>
                  )}
                  {role === 'shopkeeper' && (
                    <Link to="/shopkeeper" onClick={() => setIsMobileMenuOpen(false)} className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg">
                      <Store className="h-4 w-4" /> Shop Dashboard
                    </Link>
                  )}
                  {role === 'admin' && (
                    <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg">
                      <Store className="h-4 w-4" /> Admin Dashboard
                    </Link>
                  )}
                </div>
              )}
              
              <div className="px-4 space-y-1">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-lg">
                  Home
                </Link>
                <Link to="/shops" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-lg">
                  All Shops
                </Link>
                
                {!user && (
                  <>
                    <div className="my-4 border-t border-gray-100"></div>
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-lg">
                      Login
                    </Link>
                    <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-base font-medium text-emerald-600 bg-emerald-50 rounded-lg">
                      Sign Up
                    </Link>
                    <Link to="/register?role=shopkeeper" onClick={() => setIsMobileMenuOpen(false)} className="block mt-2 px-4 py-3 text-base font-medium text-gray-700 border border-gray-200 rounded-lg">
                      Register as Seller
                    </Link>
                  </>
                )}
                
                {user && (
                  <>
                    <div className="my-4 border-t border-gray-100"></div>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                    >
                      <LogOut className="h-5 w-5" /> Sign out
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
