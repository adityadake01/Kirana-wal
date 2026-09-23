import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { User, Shield, Ban, CheckCircle, Edit, ExternalLink } from 'lucide-react';

export default function AdminCustomerList() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'customer'));
      const snap = await getDocs(q);
      setCustomers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
    try {
      await updateDoc(doc(db, 'users', id), { status: newStatus });
      fetchCustomers();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  if (loading) return <div>Loading customers...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h3 className="font-bold text-gray-800 text-lg">All Customers</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 text-gray-500 text-sm">
            <tr>
              <th className="px-6 py-4 font-medium">Customer</th>
              <th className="px-6 py-4 font-medium">Contact</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Joined</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">{c.name?.charAt(0) || c.email?.charAt(0)}</div>
                    <div>
                      <p className="font-semibold text-gray-900">{c.name || 'Unnamed'}</p>
                      <p className="text-xs text-gray-500">{c.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <p className="text-gray-900">{c.email}</p>
                  <p className="text-gray-500">{c.phone || 'No phone'}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase ${c.status === 'banned' ? 'bg-red-100 text-red-700' : c.status === 'suspended' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {c.status || 'active'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {c.status !== 'banned' ? (
                      <button onClick={() => handleStatusChange(c.id, 'banned')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg tooltip" title="Ban Customer"><Ban className="h-4 w-4" /></button>
                    ) : (
                      <button onClick={() => handleStatusChange(c.id, 'active')} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg tooltip" title="Unban Customer"><CheckCircle className="h-4 w-4" /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr><td colSpan={5} className="text-center py-8 text-gray-500">No customers found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
