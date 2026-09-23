import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { 
  Users, Tractor, FileText, Settings, LayoutDashboard, 
  MessageSquare, UserCheck, Smartphone, DollarSign, User,
  ChevronRight, LogOut, CheckCircle2, X, Store
, Menu } from 'lucide-react';
import { auth, db } from '../../lib/firebase';
import { useAuthStore } from '../../store/authStore';
import AdminSettings from './AdminSettings';
import AdminProfile from '../../components/profile/AdminProfile';
import AdminCustomerList from './AdminCustomerList';
import AdminSellerList from './AdminSellerList';

export default function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(tabParam);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    if (tabParam) setActiveTab(tabParam);
  }, [tabParam]);
  
  const handleTabChange = (id: string) => {
    setIsMobileMenuOpen(false);
    setActiveTab(id);
    setSearchParams({ tab: id });
  };
  const navigate = useNavigate();
  const setUser = useAuthStore(state => state.setUser);
  
  const [pendingSellers, setPendingSellers] = useState<any[]>([]);
  const [stats, setStats] = useState({ users: 0, shops: 0, orders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for pending sellers
    const q = query(collection(db, 'shops'), where('status', '==', 'pending'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sellers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPendingSellers(sellers);
      setLoading(false);
    });

    const fetchStats = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const shopsSnap = await getDocs(collection(db, 'shops'));
        const ordersSnap = await getDocs(collection(db, 'orders'));
        setStats({
          users: usersSnap.docs.filter(d => d.data().role === 'customer').length,
          shops: shopsSnap.docs.length,
          orders: ordersSnap.docs.length
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null, null, null);
      navigate('/login');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const handleApproveSeller = async (sellerId: string) => {
    if (!window.confirm('Are you sure you want to approve this seller?')) return;
    try {
      // Update shop status
      await updateDoc(doc(db, 'shops', sellerId), {
        status: 'active',
        updatedAt: new Date().toISOString()
      });
      // Update user status
      await updateDoc(doc(db, 'users', sellerId), {
        status: 'active',
        updatedAt: new Date().toISOString()
      });
      alert('Seller approved successfully!');
    } catch (error) {
      console.error('Error approving seller:', error);
      alert('Failed to approve seller.');
    }
  };

  const handleRejectSeller = async (sellerId: string) => {
    if (!window.confirm('Are you sure you want to reject this seller?')) return;
    try {
      await updateDoc(doc(db, 'shops', sellerId), {
        status: 'rejected',
        updatedAt: new Date().toISOString()
      });
      await updateDoc(doc(db, 'users', sellerId), {
        status: 'rejected',
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error rejecting seller:', error);
      alert('Failed to reject seller.');
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-gray-50 font-sans">
      
      {/* Sidebar */}
            {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 w-64 bg-white shadow-xl flex flex-col z-50 shrink-0 transition-transform duration-300 ease-in-out`}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
           <h1 className="text-2xl font-black text-emerald-700 tracking-tight">Kiranawala Admin</h1>
        </div>
        
        
        <div className="p-4 flex-1 overflow-y-auto space-y-1">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-4 px-4">Main</div>
          <button onClick={() => handleTabChange('overview')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${activeTab === 'overview' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}><LayoutDashboard size={18} /> Dashboard</button>
          
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6 px-4">Users</div>
          <button onClick={() => handleTabChange('users')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${activeTab === 'users' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}><Users size={18} /> Customers</button>
          <button onClick={() => handleTabChange('sellers')} className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition ${activeTab === 'sellers' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>
             <div className="flex items-center gap-3"><Store size={18} /> Sellers</div>
             {pendingSellers.length > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingSellers.length}</span>}
          </button>
          
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6 px-4">System</div>
          <button onClick={() => handleTabChange('settings')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${activeTab === 'settings' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}><Settings size={18} /> Settings</button>
          <button onClick={() => handleTabChange('profile')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${activeTab === 'profile' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}><User size={18} /> Profile</button>
        </div>
        <div className="p-4 border-t border-gray-100">
           <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition font-medium">
              <LogOut size={20} /> Logout
           </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-gray-100 p-4 flex items-center justify-between shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold text-gray-800 capitalize">{activeTab} Panel</h2>
          </div>
        </div>

        {/* Header */}
        <header className="bg-white border-b border-gray-100 p-4 px-6 flex justify-between items-center shrink-0 shadow-sm z-10 hidden md:flex">
           <h2 className="text-xl font-bold text-gray-800 capitalize">
             {activeTab} Panel
           </h2>
           <div className="flex items-center gap-4">
              <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                 <CheckCircle2 size={16} /> Admin Active
              </div>
           </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 relative">
            
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition cursor-pointer" onClick={() => handleTabChange('sellers')}>
                           <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                              <Store size={24} />
                           </div>
                           <div>
                              <p className="text-sm text-gray-500 font-medium">Pending Sellers</p>
                              <h3 className="text-2xl font-bold text-gray-900">{pendingSellers.length}</h3>
                           </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition cursor-pointer" onClick={() => handleTabChange('sellers')}>
                           <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                              <Store size={24} />
                           </div>
                           <div>
                              <p className="text-sm text-gray-500 font-medium">Total Shops</p>
                              <h3 className="text-2xl font-bold text-gray-900">{stats.shops}</h3>
                           </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition cursor-pointer" onClick={() => handleTabChange('users')}>
                           <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                              <Users size={24} />
                           </div>
                           <div>
                              <p className="text-sm text-gray-500 font-medium">Customers</p>
                              <h3 className="text-2xl font-bold text-gray-900">{stats.users}</h3>
                           </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
                           <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                              <DollarSign size={24} />
                           </div>
                           <div>
                              <p className="text-sm text-gray-500 font-medium">Total Orders</p>
                              <h3 className="text-2xl font-bold text-gray-900">{stats.orders}</h3>
                           </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'sellers' && (
                <AdminSellerList />
            )}
            
            {activeTab === 'users' && (
                <div className="space-y-6">
                   <h3 className="text-xl font-bold text-gray-900">Customer Management</h3>
                   <AdminCustomerList />
                </div>
            )}
            
            {activeTab !== 'overview' && activeTab !== 'sellers' && activeTab !== 'users' && activeTab !== 'settings' && activeTab !== 'profile' && (
                <div className="flex items-center justify-center h-full min-h-[400px]">
                   <div className="text-center text-gray-400">
                      <LayoutDashboard size={48} className="mx-auto mb-4 opacity-20" />
                      <h2 className="text-xl font-medium">{activeTab} Panel Content goes here</h2>
                      <p className="text-sm mt-2">Architecture is ready for future expansion.</p>
                   </div>
                </div>
            )}
        </main>
      </div>
    </div>
  );
}
