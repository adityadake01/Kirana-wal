import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Store, LogOut, Package, Globe, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useSettingsStore } from '../../store/settingsStore';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import GlobalSearchBar from './GlobalSearchBar';
import NotificationDropdown from './NotificationDropdown';

export default function Navbar() {
  const { user, role } = useAuthStore();
  const { logoUrl } = useSettingsStore();
  const navigate = useNavigate();
  const [langDropdown, setLangDropdown] = useState(false);
  const [currentLang, setCurrentLang] = useState('मराठी');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await signOut(auth);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Header Row */}
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          
          {/* Brand Logo */}
          <div className="flex items-center shrink-0">
            <Link to="/" className="flex items-center gap-2">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-8 max-w-[140px] sm:max-w-[160px] object-contain" />
              ) : (
                <>
                  <Store className="h-7 w-7 sm:h-8 sm:w-8 text-green-700" />
                  <span className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                    <span className="text-green-700">Kirana</span>wala
                  </span>
                </>
              )}
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-4">
            <GlobalSearchBar />
          </div>

          {/* Right Navigation & Action Items */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            
            {/* Language Switcher (Desktop) */}
            <div className="relative hidden lg:block">
              <button 
                onClick={() => setLangDropdown(!langDropdown)}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-emerald-600 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>{currentLang}</span>
              </button>
              {langDropdown && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl py-1 z-50 border border-gray-100">
                  {['मराठी', 'English', 'हिंदी'].map((l) => (
                    <button 
                      key={l}
                      onClick={() => { setCurrentLang(l); setLangDropdown(false); }}
                      className="block w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                    >
                      {l}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* All Shops Link (Desktop) */}
            <Link 
              to="/shops" 
              className="hidden sm:inline-flex text-sm font-semibold text-gray-700 hover:text-emerald-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              सर्व दुकाने (Shops)
            </Link>
            
            {/* Admin Panel Direct Link */}
            {role === 'admin' && (
              <Link 
                to="/admin" 
                className="text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg shadow-sm transition-colors"
              >
                Admin
              </Link>
            )}

            {/* Notification Bell Dropdown (Click opens live notifications!) */}
            <NotificationDropdown />

            {/* Customer Cart */}
            <Link 
              to="/cart" 
              className="p-2 text-gray-700 hover:text-emerald-600 rounded-full hover:bg-gray-100 transition-colors relative"
              title="Cart"
              aria-label="Cart"
            >
              <ShoppingCart className="h-6 w-6" />
            </Link>

            {/* Auth Buttons / User Profile */}
            {!user ? (
              <div className="flex items-center gap-2">
                <Link 
                  to="/login" 
                  className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-emerald-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  लॉगिन
                </Link>
                <Link 
                  to="/register" 
                  className="hidden sm:inline-flex text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-1.5 rounded-full shadow-sm transition-colors"
                >
                  नोंदणी
                </Link>
              </div>
            ) : (
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setUserMenuOpen(prev => !prev)}
                  className="flex items-center gap-2 p-1 text-gray-600 hover:text-emerald-600 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  aria-label="User Account"
                >
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 font-bold text-sm shadow-sm">
                    {user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                  </div>
                </button>
                
                {/* User Dropdown menu */}
                <div className={`absolute right-0 w-56 mt-2 bg-white rounded-2xl shadow-xl py-2 transition-all duration-150 border border-gray-100 z-50 ${
                  userMenuOpen 
                    ? 'opacity-100 scale-100 visible pointer-events-auto' 
                    : 'opacity-0 scale-95 invisible pointer-events-none'
                }`}>
                  <div className="px-4 py-2 border-b border-gray-100 mb-1">
                    <p className="text-xs font-bold text-gray-900 truncate">{user.displayName || 'माझे खाते'}</p>
                    <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 capitalize">
                      {role === 'admin' ? '🛡️ Admin' : role === 'shopkeeper' ? '🏪 Shopkeeper' : '👤 Customer'}
                    </span>
                  </div>
                  
                  {role === 'admin' && (
                    <Link 
                      to="/admin" 
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition"
                    >
                      ॲडमिन डॅशबोर्ड (Admin Panel)
                    </Link>
                  )}
                  {role === 'shopkeeper' && (
                    <Link 
                      to="/shopkeeper" 
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition"
                    >
                      दुकान डॅशबोर्ड (Seller Panel)
                    </Link>
                  )}
                  <Link 
                    to="/dashboard?tab=orders" 
                    onClick={() => setUserMenuOpen(false)}
                    className="block px-4 py-2 text-xs font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition"
                  >
                    माझ्या ऑर्डर्स (My Orders)
                  </Link>
                  <Link 
                    to="/profile" 
                    onClick={() => setUserMenuOpen(false)}
                    className="block px-4 py-2 text-xs font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition"
                  >
                    माझी प्रोफाईल (Profile)
                  </Link>
                  
                  <button 
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 mt-1 border-t border-gray-100 transition"
                  >
                    <LogOut className="h-3.5 w-3.5 mr-2" />
                    लॉगआउट (Sign Out)
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Mobile Search Bar Row - Instant access on mobile screens */}
        <div className="md:hidden pb-3 pt-1">
          <GlobalSearchBar />
        </div>

      </div>
    </header>
  );
}
