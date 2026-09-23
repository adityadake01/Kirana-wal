import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  LayoutDashboard, Store, Package, ShoppingCart, 
  IndianRupee, Settings, MapPin, Clock 
, Menu } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import SellerProducts from './SellerProducts';
import SellerShop from './SellerShop';
import SellerOrders from './SellerOrders';
import SellerProfile from '../../components/profile/SellerProfile';

export default function ShopkeeperDashboard() {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') || 'dashboard';
  
  const [activeTab, setActiveTab] = useState(tabParam);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (id: string) => {
    setIsMobileMenuOpen(false);
    setActiveTab(id);
    setSearchParams({ tab: id });
  };
  
    const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'myshop', label: 'My Store', icon: Store },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'settings', label: 'Settings & Profile', icon: Settings },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
            <Store className="h-5 w-5 text-emerald-600" />
            Seller Panel
          </h2>
          <p className="text-xs text-gray-500 mt-1 truncate">{user?.email}</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id 
                  ? 'bg-emerald-50 text-emerald-600 shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="h-5 w-5" /> {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className="md:hidden w-full p-4 bg-white border-b border-gray-100 flex gap-2 overflow-x-auto whitespace-nowrap">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => handleTabChange(item.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              activeTab === item.id 
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                : 'bg-gray-50 text-gray-600 border border-gray-100'
            }`}
          >
            <item.icon className="h-4 w-4" /> {item.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in duration-300">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Seller Dashboard</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              {[
                { title: 'Today\'s Orders', value: '0', color: 'text-blue-600' },
                { title: 'Pending Orders', value: '0', color: 'text-orange-600' },
                { title: 'Today\'s Sales', value: '₹0', color: 'text-emerald-600' },
                { title: 'Total Sales', value: '₹0', color: 'text-purple-600' },
                { title: 'Low Stock', value: '0', color: 'text-red-600' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                  <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center flex flex-col items-center justify-center">
               <Store className="h-12 w-12 text-gray-300 mb-4" />
               <h3 className="text-lg font-bold text-gray-900 mb-2">Welcome to Kirana Wala Seller Panel</h3>
               <p className="text-gray-500 text-sm max-w-md">
                 Configure your shop details from the "My Shop" tab and start adding your products to receive orders in your neighborhood.
               </p>
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="animate-in fade-in duration-300">
            <SellerProducts />
          </div>
        )}

        {/* MY SHOP TAB */}
        {activeTab === 'myshop' && (
          <div className="animate-in fade-in duration-300">
            <SellerShop />
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="animate-in fade-in duration-300">
            <SellerOrders />
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className="animate-in fade-in duration-300">
            <SellerProfile />
          </div>
        )}

        

      </div>
    </div>
  );
}
