import React from 'react';
import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../store/authStore';
import { Store, Loader2 } from 'lucide-react';

export default function SellerShop() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    phone: '',
    address: '',
    image: '',
    deliveryAvailable: true,
    deliveryRadius: '5',
    deliveryCharge: '0',
    minimumOrder: '0',
    openStatus: true,
  });

  useEffect(() => {
    const fetchShop = async () => {
      if (!user?.uid) return;
      try {
        const docRef = doc(db, 'shops', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            name: data.name || '',
            ownerName: data.ownerName || '',
            phone: data.phone || '',
            address: data.address || '',
            image: data.image || '',
            deliveryAvailable: data.deliveryAvailable !== false,
            deliveryRadius: data.deliveryRadius || '5',
            deliveryCharge: data.deliveryCharge || '0',
            minimumOrder: data.minimumOrder || '0',
            openStatus: data.openStatus !== false,
          });
        }
      } catch (err) {
        console.error("Error fetching shop data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchShop();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;
    setSaving(true);
    setMessage('');
    
    try {
      await updateDoc(doc(db, 'shops', user.uid), {
        ...formData,
        updatedAt: new Date().toISOString()
      });
      setMessage('Shop details updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error("Error updating shop:", err);
      setMessage('Failed to update shop details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>;
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Shop Details</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          {message && (
            <div className={`p-4 rounded-lg text-sm font-medium ${message.includes('successfully') ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
              <input type="text" required value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
              <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Shop Address</label>
              <textarea required rows={2} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"></textarea>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Shop Banner / Cover Image URL</label>
              <input type="url" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://..." className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>

            {/* Delivery Settings */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Delivery & Order Settings</h3>
            </div>

            <div>
               <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                 <input type="checkbox" checked={formData.deliveryAvailable} onChange={e => setFormData({...formData, deliveryAvailable: e.target.checked})} className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" />
                 Delivery Available
               </label>
            </div>
            
            <div>
               <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                 <input type="checkbox" checked={formData.openStatus} onChange={e => setFormData({...formData, openStatus: e.target.checked})} className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" />
                 Shop Currently Open
               </label>
            </div>

            {formData.deliveryAvailable && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Radius (km)</label>
                  <input type="number" required value={formData.deliveryRadius} onChange={e => setFormData({...formData, deliveryRadius: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Charge (₹)</label>
                  <input type="number" required value={formData.deliveryCharge} onChange={e => setFormData({...formData, deliveryCharge: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Order Value (₹)</label>
              <input type="number" required value={formData.minimumOrder} onChange={e => setFormData({...formData, minimumOrder: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button type="submit" disabled={saving} className="bg-emerald-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-emerald-700 shadow-sm disabled:opacity-50 flex items-center gap-2">
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Store className="h-5 w-5" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
