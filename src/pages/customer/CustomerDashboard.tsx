import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Package, ShoppingBag, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../store/authStore';
import CustomerProfile from '../../components/profile/CustomerProfile';
import { User } from 'lucide-react';

export default function CustomerDashboard() {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') || 'orders';
  const [activeTab, setActiveTab] = useState(tabParam);
  
  useEffect(() => {
    if (tabParam) setActiveTab(tabParam);
  }, [tabParam]);
  
  const handleTabChange = (id: string) => {
    setActiveTab(id);
    setSearchParams({ tab: id });
  };
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.uid) return;
      try {
        const q = query(collection(db, 'orders'), where('customerId', '==', user.uid));
        const snap = await getDocs(q);
        let data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Manual sort by createdAt desc
        data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [user, activeTab]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 text-center">
            <div className="h-20 w-20 bg-emerald-100 rounded-full mx-auto flex items-center justify-center text-emerald-600 text-2xl font-bold mb-4">
              {user?.displayName?.charAt(0) || 'U'}
            </div>
            <h2 className="font-bold text-gray-900 text-lg">{user?.displayName || 'Customer'}</h2>
            <p className="text-gray-500 text-sm">{user?.email}</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <nav className="flex flex-col">
              <button 
                onClick={() => handleTabChange('orders')}
                className={`px-6 py-4 text-left font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'orders' ? 'bg-emerald-50 text-emerald-600 border-l-4 border-emerald-500' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Package className="h-4 w-4" /> My Orders
              </button>
              <button 
                onClick={() => handleTabChange('profile')}
                className={`px-6 py-4 text-left font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'profile' ? 'bg-emerald-50 text-emerald-600 border-l-4 border-emerald-500' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <User className="h-4 w-4" /> My Profile
              </button>
              <button 
                onClick={() => handleTabChange('profile')}
                className={`px-6 py-4 text-left font-medium text-sm transition-colors ${activeTab === 'profile' ? 'bg-emerald-50 text-emerald-600 border-l-4 border-emerald-500' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Profile Settings
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {activeTab === 'profile' && <CustomerProfile />}
          {activeTab === 'orders' && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Order History</h1>
              
              {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>
              ) : orders.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No Orders Yet</h3>
                  <p className="text-gray-500 text-sm">You haven't placed any orders. Start shopping!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-gray-100 mb-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">ORDER ID: #{order.id.slice(-6).toUpperCase()}</p>
                          <p className="font-bold text-gray-900">{order.shopName}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xs text-gray-500 mb-1">Amount</p>
                            <p className="font-bold text-emerald-600">₹{order.totalAmount}</p>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                            ['Pending'].includes(order.status) ? 'bg-orange-100 text-orange-700' :
                            ['Accepted', 'Preparing', 'Ready', 'Dispatched'].includes(order.status) ? 'bg-blue-100 text-blue-700' :
                            order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {order.status === 'Delivered' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />} 
                            {order.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {(order.items || []).map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{item.quantity}x</span>
                              <span className="text-gray-600">{item.name}</span>
                            </div>
                            <span className="font-medium text-gray-900">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="pt-4 border-t border-gray-50 flex justify-end gap-3">
                        <button className="text-sm font-medium bg-emerald-50 text-emerald-600 rounded-lg px-4 py-2 hover:bg-emerald-100 transition-colors">Reorder</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Settings</h2>
              <p className="text-gray-500">Profile management coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
