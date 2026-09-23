import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, onSnapshot, addDoc } from 'firebase/firestore';
import { useAuthStore } from '../../store/authStore';
import { db } from '../../lib/firebase';
import { Store, CheckCircle, XCircle, Search, Edit } from 'lucide-react';

export default function AdminSellerList() {
  const { user } = useAuthStore();
  
  const addAuditLog = async (action, targetId, description) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'audit_logs'), {
        adminId: user.uid,
        adminEmail: user.email,
        action,
        targetId,
        targetType: 'seller',
        description,
        timestamp: new Date().toISOString()
      });
    } catch (e) { console.error('Failed to write audit log', e); }
  };
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // 'pending', 'active', 'all'

  useEffect(() => {
    // Listen to all sellers
    const q = query(collection(db, 'shops'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allSellers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSellers(allSellers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleApprove = async (sellerId: string) => {
    if (!window.confirm('Are you sure you want to approve this seller?')) return;
    try {
      await updateDoc(doc(db, 'shops', sellerId), { status: 'active', updatedAt: new Date().toISOString() });
      await updateDoc(doc(db, 'users', sellerId), { status: 'active', updatedAt: new Date().toISOString() });
      await addAuditLog('Seller Approved', sellerId, 'Admin approved seller registration');
    } catch (error) {
      console.error('Error approving seller:', error);
      alert('Failed to approve seller: ' + (error as any).message);
    }
  };

  const handleReject = async (sellerId: string) => {
    if (!window.confirm('Are you sure you want to reject/ban this seller?')) return;
    try {
      await updateDoc(doc(db, 'shops', sellerId), { status: 'rejected', updatedAt: new Date().toISOString() });
      await updateDoc(doc(db, 'users', sellerId), { status: 'banned', updatedAt: new Date().toISOString() });
      await addAuditLog('Seller Rejected/Banned', sellerId, 'Admin rejected/banned seller');
    } catch (error) {
      console.error('Error rejecting seller:', error);
      alert('Failed to reject seller.');
    }
  };

  const handleReactivate = async (sellerId: string) => {
      if (!window.confirm('Are you sure you want to reactivate this seller?')) return;
      try {
        await updateDoc(doc(db, 'shops', sellerId), { status: 'active', updatedAt: new Date().toISOString() });
        await updateDoc(doc(db, 'users', sellerId), { status: 'active', updatedAt: new Date().toISOString() });
        await addAuditLog('Seller Reactivated', sellerId, 'Admin reactivated seller');
      } catch (error) {
        console.error('Error reactivating seller:', error);
        alert('Failed to reactivate seller.');
      }
  };

  const filteredSellers = sellers.filter(s => {
      if (filter === 'all') return true;
      return s.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-xl font-bold text-gray-900">Seller Management</h3>
          <div className="flex bg-gray-100 p-1 rounded-lg">
              <button 
                  onClick={() => setFilter('pending')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition \${filter === 'pending' ? 'bg-white shadow-sm text-emerald-700' : 'text-gray-600 hover:text-gray-900'}`}
              >
                  Pending ({sellers.filter(s => s.status === 'pending').length})
              </button>
              <button 
                  onClick={() => setFilter('active')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition \${filter === 'active' ? 'bg-white shadow-sm text-emerald-700' : 'text-gray-600 hover:text-gray-900'}`}
              >
                  Active ({sellers.filter(s => s.status === 'active').length})
              </button>
              <button 
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition \${filter === 'all' ? 'bg-white shadow-sm text-emerald-700' : 'text-gray-600 hover:text-gray-900'}`}
              >
                  All
              </button>
          </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
            <div className="p-8 text-center text-gray-500">Loading sellers...</div>
        ) : filteredSellers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No sellers found in this category.</div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 text-gray-500 text-sm">
                        <tr>
                            <th className="px-6 py-4 font-medium">Shop Details</th>
                            <th className="px-6 py-4 font-medium">Owner Info</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredSellers.map(seller => (
                            <tr key={seller.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold overflow-hidden">
                                            {seller.shopImage ? (
                                                <img src={seller.shopImage} alt="logo" className="w-full h-full object-cover" />
                                            ) : (
                                                (seller.name || seller.shopName || 'S').charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{seller.name || seller.shopName || 'Unnamed Shop'}</p>
                                            <p className="text-xs text-gray-500 max-w-[200px] truncate" title={seller.address}>{seller.address || 'No address'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <p className="text-gray-900 font-medium">{seller.ownerName || 'Unknown Owner'}</p>
                                    <p className="text-gray-500">{seller.phone || 'No phone'}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase \${seller.status === 'rejected' ? 'bg-red-100 text-red-700' : seller.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                        {seller.status || 'unknown'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {seller.status === 'pending' && (
                                            <>
                                                <button onClick={() => handleApprove(seller.id)} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700">Approve</button>
                                                <button onClick={() => handleReject(seller.id)} className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded-lg hover:bg-red-100">Reject</button>
                                            </>
                                        )}
                                        {seller.status === 'active' && (
                                            <button onClick={() => handleReject(seller.id)} className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded-lg hover:bg-red-100">Suspend</button>
                                        )}
                                        {seller.status === 'rejected' && (
                                            <button onClick={() => handleReactivate(seller.id)} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold rounded-lg hover:bg-emerald-100">Reactivate</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
}
