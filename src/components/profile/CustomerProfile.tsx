import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Camera, Save, X, Edit, MapPin, Plus, Trash2 } from 'lucide-react';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, addDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { useAuthStore } from '../../store/authStore';

export default function CustomerProfile() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  
  const [isSaving, setIsSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressData, setAddressData] = useState({
    fullName: '', phone: '', house: '', street: '', area: '', city: '', state: '', pinCode: '', landmark: '', type: 'Home'
  });

  useEffect(() => {
    fetchProfile();
    fetchAddresses();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const docRef = doc(db, 'users', user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setProfile(data);
        setFormData({ name: data.name || user.displayName || '', phone: data.phone || '' });
      } else {
        const fallback = { name: user.displayName || '', email: user.email || '', phone: '' };
        setProfile(fallback);
        setFormData({ name: user.displayName || '', phone: '' });
      }
    } catch (err) {
      console.warn("fetchProfile error:", err);
      const fallback = { name: user.displayName || '', email: user.email || '', phone: '' };
      setProfile(fallback);
      setFormData({ name: user.displayName || '', phone: '' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'addresses'), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      setAddresses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    setImageUploading(true);
    setError('');
    try {
      const storageRef = ref(storage, `profiles/${user.uid}/profile_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      await setDoc(doc(db, 'users', user.uid), { photoURL: url }, { merge: true });
      await updateProfile(user, { photoURL: url });
      
      fetchProfile();
      setSuccess('Profile photo updated successfully.');
    } catch (err: any) {
      setError('Failed to upload image.');
    } finally {
      setImageUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      await setDoc(doc(db, 'users', user.uid), {
        name: formData.name,
        phone: formData.phone,
        email: user.email,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      await updateProfile(user, { displayName: formData.name });
      setEditMode(false);
      setSuccess('Profile updated successfully.');
      fetchProfile();
    } catch (err) {
      setError('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await addDoc(collection(db, 'addresses'), {
        ...addressData,
        userId: user.uid,
        isDefault: addresses.length === 0, // make default if it's the first one
        createdAt: new Date().toISOString()
      });
      setSuccess('Address added successfully.');
      setShowAddressForm(false);
      setAddressData({ fullName: '', phone: '', house: '', street: '', area: '', city: '', state: '', pinCode: '', landmark: '', type: 'Home' });
      fetchAddresses();
    } catch (err) {
      setError('Failed to save address.');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'addresses', id));
      setSuccess('Address deleted.');
      fetchAddresses();
    } catch (err) {
      setError('Failed to delete address.');
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      // Unset old default
      const defaultAddr = addresses.find(a => a.isDefault);
      if (defaultAddr) {
        await updateDoc(doc(db, 'addresses', defaultAddr.id), { isDefault: false });
      }
      // Set new default
      await updateDoc(doc(db, 'addresses', id), { isDefault: true });
      fetchAddresses();
    } catch (err) {
      setError('Failed to update default address.');
    }
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-b-2 border-emerald-500 rounded-full"></div></div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h2>
      
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{error}</div>}
      {success && <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg mb-4">{success}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="relative mb-4 group">
              <div className="h-32 w-32 rounded-full overflow-hidden bg-emerald-100 flex items-center justify-center border-4 border-white shadow-lg">
                {profile?.photoURL ? (
                  <img src={profile.photoURL} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-emerald-600">{profile?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-emerald-500 text-white rounded-full cursor-pointer hover:bg-emerald-600 shadow-md">
                <Camera className="h-5 w-5" />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={imageUploading} />
              </label>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900">{profile?.name || 'Customer User'}</h3>
            <p className="text-emerald-600 font-medium mb-4 capitalize">{profile?.role}</p>
            
            <div className="w-full space-y-3">
              <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Joined:</span>
                <span className="font-semibold text-gray-900">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                <span className="flex items-center gap-2"><User className="h-4 w-4" /> Status:</span>
                <span className="font-semibold text-gray-900 capitalize">{profile?.status || 'active'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
              {!editMode ? (
                <button onClick={() => setEditMode(true)} className="flex items-center gap-2 text-sm text-emerald-600 font-medium hover:text-emerald-700">
                  <Edit className="h-4 w-4" /> Edit Profile
                </button>
              ) : (
                <button onClick={() => setEditMode(false)} className="flex items-center gap-2 text-sm text-gray-500 font-medium hover:text-gray-700">
                  <X className="h-4 w-4" /> Cancel
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                {editMode ? (
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-emerald-500" />
                ) : (
                  <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg"><User className="h-5 w-5 text-gray-400" /><span>{profile?.name || 'Not set'}</span></div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="flex items-center gap-3 px-3 py-2 bg-gray-100 rounded-lg opacity-70 cursor-not-allowed">
                  <Mail className="h-5 w-5 text-gray-400" /><span>{user?.email}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                {editMode ? (
                  <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-emerald-500" />
                ) : (
                  <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg"><Phone className="h-5 w-5 text-gray-400" /><span>{profile?.phone || 'Not set'}</span></div>
                )}
              </div>

              {editMode && (
                <div className="pt-4 flex justify-end">
                  <button onClick={handleSaveProfile} disabled={isSaving} className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-emerald-700">
                    {isSaving ? 'Saving...' : <><Save className="h-4 w-4" /> Save Changes</>}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Saved Addresses</h3>
              <button onClick={() => setShowAddressForm(!showAddressForm)} className="flex items-center gap-2 text-sm text-emerald-600 font-medium hover:bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <Plus className="h-4 w-4" /> Add Address
              </button>
            </div>

            {showAddressForm && (
              <form onSubmit={handleSaveAddress} className="mb-6 p-4 border border-emerald-100 bg-emerald-50/30 rounded-xl space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label><input required type="text" value={addressData.fullName} onChange={e=>setAddressData({...addressData, fullName: e.target.value})} className="w-full p-2 border rounded text-sm" /></div>
                  <div><label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label><input required type="tel" value={addressData.phone} onChange={e=>setAddressData({...addressData, phone: e.target.value})} className="w-full p-2 border rounded text-sm" /></div>
                  <div className="md:col-span-2"><label className="block text-xs font-medium text-gray-700 mb-1">House / Flat No.</label><input required type="text" value={addressData.house} onChange={e=>setAddressData({...addressData, house: e.target.value})} className="w-full p-2 border rounded text-sm" /></div>
                  <div className="md:col-span-2"><label className="block text-xs font-medium text-gray-700 mb-1">Street / Area</label><input required type="text" value={addressData.area} onChange={e=>setAddressData({...addressData, area: e.target.value})} className="w-full p-2 border rounded text-sm" /></div>
                  <div><label className="block text-xs font-medium text-gray-700 mb-1">City</label><input required type="text" value={addressData.city} onChange={e=>setAddressData({...addressData, city: e.target.value})} className="w-full p-2 border rounded text-sm" /></div>
                  <div><label className="block text-xs font-medium text-gray-700 mb-1">PIN Code</label><input required type="text" value={addressData.pinCode} onChange={e=>setAddressData({...addressData, pinCode: e.target.value})} className="w-full p-2 border rounded text-sm" /></div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Address Type</label>
                    <select value={addressData.type} onChange={e=>setAddressData({...addressData, type: e.target.value})} className="w-full p-2 border rounded text-sm bg-white">
                      <option>Home</option><option>Work</option><option>Other</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowAddressForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                  <button type="submit" className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Save Address</button>
                </div>
              </form>
            )}

            {addresses.length === 0 && !showAddressForm ? (
              <p className="text-sm text-gray-500 text-center py-4">No addresses saved yet.</p>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div key={addr.id} className="border rounded-xl p-4 flex justify-between items-start hover:border-emerald-200 transition-colors bg-white">
                    <div className="flex gap-3">
                      <div className="mt-1"><MapPin className="h-5 w-5 text-gray-400" /></div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{addr.fullName}</h4>
                          <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full font-medium text-gray-600 uppercase">{addr.type}</span>
                          {addr.isDefault && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">DEFAULT</span>}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{addr.house}, {addr.area}</p>
                        <p className="text-sm text-gray-600">{addr.city}, {addr.state} - {addr.pinCode}</p>
                        <p className="text-sm text-gray-600 mt-1">Phone: <span className="font-medium">{addr.phone}</span></p>
                        
                        {!addr.isDefault && (
                          <button onClick={() => handleSetDefaultAddress(addr.id)} className="text-xs text-emerald-600 font-medium mt-2 hover:underline">
                            Set as Default
                          </button>
                        )}
                      </div>
                    </div>
                    <button onClick={() => handleDeleteAddress(addr.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
