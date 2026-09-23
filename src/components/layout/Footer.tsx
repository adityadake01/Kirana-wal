import { Store } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Store className="h-8 w-8 text-emerald-500" />
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
                Kirana Wala
              </span>
            </Link>
            <p className="text-gray-500 text-sm mb-6 max-w-xs">
              Your local neighborhood Kirana stores, now online. Fresh groceries delivered fast.
            </p>
            <div className="inline-flex items-center gap-2 text-sm font-medium text-emerald-800 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
              Powered by shivshakti Udyog
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-500 hover:text-emerald-600 transition-colors">Home</Link></li>
              <li><Link to="/shops" className="text-gray-500 hover:text-emerald-600 transition-colors">All Shops</Link></li>
              <li><Link to="/login" className="text-gray-500 hover:text-emerald-600 transition-colors">Login / Register</Link></li>
              <li><Link to="/register?role=shopkeeper" className="text-gray-500 hover:text-emerald-600 transition-colors">Sell with us</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Legal & Support</h3>
            <ul className="space-y-3">
              <li><Link to="/privacy-policy" className="text-gray-500 hover:text-emerald-600 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-conditions" className="text-gray-500 hover:text-emerald-600 transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-100 mt-12 pt-8 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Kirana Wala. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
