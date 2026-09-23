import React, { useState, useEffect } from 'react';
import { Store, User, Mail, Phone, MapPin, Clock, Edit, X, Save, Image as ImageIcon, Camera, CheckCircle, ExternalLink } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { useAuthStore } from '../../store/authStore';
import { Link } from 'react-router-dom';

export default function SellerProfile() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<any>({});
  
  const [isSaving, setIsSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      const userSnap = await getDoc(doc(db, 'users', user.uid));
      if (userSnap.exists()) setProfile(userSnap.data());
      
      const shopSnap = await getDoc(doc(db, 'shops', user.uid));
      if (shopSnap.exists()) {
        const data = shopSnap.data();
        setShop(data);
        setFormData({
          ownerName: data.ownerName || '',
          phone: data.phone || '',
          shopName: data.shopName || '',
          address: data.address || '',
          city: data.city || '',
          pinCode: data.pinCode || '',
          businessType: data.businessType || '',
          deliveryAvailable: data.deliveryAvailable || false,
          deliveryRadius: data.deliveryRadius || '',
          deliveryCharge: data.deliveryCharge || '',
          minimumOrder: data.minimumOrder || '',
          openingTime: data.openingTime || '',
          closingTime: data.closingTime || '',
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setImageUploading(type);
    try {
      const storageRef = ref(storage, `shops/${user.uid}/${type}_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'shops', user.uid), { [type === 'logo' ? 'shopImage' : 'shopBanner']: url });
      
      // Audit log
      const { addDoc, collection } = require('firebase/firestore');
      await addDoc(collection(db, 'auditLogs'), {
        userId: user.uid, role: 'shopkeeper', action: 'Store Information Updated',
        targetType: 'shop', targetId: user.uid, description: `Updated shop ${type}`,
        createdAt: new Date().toISOString()
      });
      
      fetchData();
      setSuccess(`${type === 'logo' ? 'Logo' : 'Banner'} updated successfully.`);
    } catch (err) {
      console.error(err);
      setError(`Failed to upload ${type}.`);
    } finally {
      setImageUploading('');
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateDoc(doc(db, 'shops', user.uid), {
        ...formData,
        updatedAt: new Date().toISOString()
      });
      
      // Sync phone and name to users collection too
      await updateDoc(doc(db, 'users', user.uid), {
        name: formData.ownerName,
        phone: formData.phone,
        updatedAt: new Date().toISOString()
      });
      
      // Audit log
      const { addDoc, collection } = require('firebase/firestore');
      await addDoc(collection(db, 'auditLogs'), {
        userId: user.uid, role: 'shopkeeper', action: 'Store Information Updated',
        targetType: 'shop', targetId: user.uid, description: 'Updated store profile details',
        createdAt: new Date().toISOString()
      });

      setEditMode(false);
      setSuccess('Profile updated successfully.');
      fetchData();
    } catch (err) {
      console.error(err);
      setError('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-b-2 border-emerald-500 rounded-full"></div></div>;

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Seller Profile</h2>
        <Link to={`/shop/${user?.uid}`} target="_blank" className="flex items-center gap-2 bg-white border border-emerald-500 text-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-50 font-medium">
          <ExternalLink className="h-4 w-4" /> View My Store
        </Link>
      </div>
      
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg">{error}</div>}
      {success && <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg">{success}</div>}

      {/* Banner & Logo Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
        <div className="h-48 bg-gray-200 w-full relative group">
          {shop?.shopBanner ? (
            <img src={shop.shopBanner} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon className="h-12 w-12 opacity-50" /></div>
          )}
          <label className="absolute bottom-4 right-4 bg-white/90 p-2 rounded-lg cursor-pointer hover:bg-white shadow flex items-center gap-2 text-sm font-medium">
            <Camera className="h-4 w-4" /> {imageUploading === 'banner' ? 'Uploading...' : 'Change Banner'}
            <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'banner')} disabled={!!imageUploading} />
          </label>
        </div>
        
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-12 mb-4">
            <div className="relative group z-10">
              <div className="h-24 w-24 rounded-2xl overflow-hidden bg-white border-4 border-white shadow-md flex items-center justify-center">
                {shop?.shopImage ? (
                  <img src={shop.shopImage} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Store className="h-10 w-10 text-emerald-200" />
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full cursor-pointer hover:bg-emerald-600 shadow">
                <Camera className="h-4 w-4" />
                <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'logo')} disabled={!!imageUploading} />
              </label>
            </div>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{shop?.shopName || 'My Store'}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                Status: <span className="capitalize font-medium text-gray-900">{shop?.status || 'pending'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900">Store Information</h3>
          {!editMode ? (
            <button onClick={() => setEditMode(true)} className="flex items-center gap-2 text-sm text-emerald-600 font-medium hover:text-emerald-700">
              <Edit className="h-4 w-4" /> Edit Details
            </button>
          ) : (
            <button onClick={() => setEditMode(false)} className="flex items-center gap-2 text-sm text-gray-500 font-medium hover:text-gray-700">
              <X className="h-4 w-4" /> Cancel
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shop Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
            {editMode ? (
              <input type="text" value={formData.shopName} onChange={e => setFormData({...formData, shopName: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500" />
            ) : (
              <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg"><Store className="h-5 w-5 text-gray-400" /><span>{shop?.shopName}</span></div>
            )}
          </div>
          
          {/* Owner Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
            {editMode ? (
              <input type="text" value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500" />
            ) : (
              <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg"><User className="h-5 w-5 text-gray-400" /><span>{shop?.ownerName}</span></div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="flex items-center gap-3 px-3 py-2 bg-gray-100 rounded-lg opacity-80 cursor-not-allowed"><Mail className="h-5 w-5 text-gray-400" /><span>{user?.email}</span></div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
            {editMode ? (
              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500" />
            ) : (
              <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg"><Phone className="h-5 w-5 text-gray-400" /><span>{shop?.phone}</span></div>
            )}
          </div>
          
          {/* Address */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Shop Address</label>
            {editMode ? (
              <textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500" rows={2} />
            ) : (
              <div className="flex items-start gap-3 px-3 py-2 bg-gray-50 rounded-lg"><MapPin className="h-5 w-5 text-gray-400 mt-0.5" /><span>{shop?.address}</span></div>
            )}
          </div>
          
          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            {editMode ? (
              <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500" />
            ) : (
              <div className="px-3 py-2 bg-gray-50 rounded-lg">{shop?.city}</div>
            )}
          </div>
          
          {/* PIN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
            {editMode ? (
              <input type="text" value={formData.pinCode} onChange={e => setFormData({...formData, pinCode: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500" />
            ) : (
              <div className="px-3 py-2 bg-gray-50 rounded-lg">{shop?.pinCode}</div>
            )}
          </div>
          
          <div className="md:col-span-2 border-t pt-4 mt-2">
            <h4 className="text-md font-bold text-gray-900 mb-4">Operations & Delivery</h4>
          </div>
          
          {/* Opening / Closing */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Opening Time</label>
            {editMode ? (
              <input type="time" value={formData.openingTime} onChange={e => setFormData({...formData, openingTime: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-emerald-500" />
            ) : (
              <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg"><Clock className="h-5 w-5 text-gray-400" /><span>{shop?.openingTime || 'N/A'}</span></div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Closing Time</label>
            {editMode ? (
              <input type="time" value={formData.closingTime} onChange={e => setFormData({...formData, closingTime: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-emerald-500" />
            ) : (
              <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg"><Clock className="h-5 w-5 text-gray-400" /><span>{shop?.closingTime || 'N/A'}</span></div>
            )}
          </div>

          {/* Delivery Available */}
          <div className="md:col-span-2 flex items-center mt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={formData.deliveryAvailable} onChange={e => editMode && setFormData({...formData, deliveryAvailable: e.target.checked})} disabled={!editMode} className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 disabled:opacity-50" />
              <span className="text-gray-900 font-medium">Delivery Available</span>
            </label>
          </div>
          
          {/* Delivery details if available */}
          {(editMode ? formData.deliveryAvailable : shop?.deliveryAvailable) && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Radius (km)</label>
                {editMode ? (
                  <input type="number" value={formData.deliveryRadius} onChange={e => setFormData({...formData, deliveryRadius: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-emerald-500" />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 rounded-lg">{shop?.deliveryRadius || '0'} km</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Charge (₹)</label>
                {editMode ? (
                  <input type="number" value={formData.deliveryCharge} onChange={e => setFormData({...formData, deliveryCharge: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-emerald-500" />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 rounded-lg">₹ {shop?.deliveryCharge || '0'}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Order (₹)</label>
                {editMode ? (
                  <input type="number" value={formData.minimumOrder} onChange={e => setFormData({...formData, minimumOrder: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-emerald-500" />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 rounded-lg">₹ {shop?.minimumOrder || '0'}</div>
                )}
              </div>
            </>
          )}

          {editMode && (
            <div className="md:col-span-2 pt-4 flex justify-end">
              <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700">
                {isSaving ? 'Saving...' : <><Save className="h-4 w-4" /> Save Changes</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
