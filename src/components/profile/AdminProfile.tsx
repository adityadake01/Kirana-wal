import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Clock, Shield, Upload, Camera, Save, X, Edit, Bell } from 'lucide-react';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider, updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../../lib/firebase';
import { useAuthStore } from '../../store/authStore';

export default function AdminProfile() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const [notificationPrefs, setNotificationPrefs] = useState({
    orderNotifs: true,
    sellerRegistration: true,
    sellerApproval: true,
    customerNotifs: true,
    promo: true,
    security: true,
    emailNotifs: true,
    pushNotifs: false,
  });

  useEffect(() => {
    fetchProfile();
    fetchActivities();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const docRef = doc(db, 'users', user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setProfile(data);
        setFormData({ name: data.name || '', phone: data.phone || '' });
        if (data.notificationPrefs) {
          setNotificationPrefs({ ...notificationPrefs, ...data.notificationPrefs });
        }
      }
    } catch (err) {
      console.error("Error fetching profile", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'auditLogs'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'), limit(10));
      const snap = await getDocs(q);
      setActivities(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Error fetching activities", err);
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
      
      await updateDoc(doc(db, 'users', user.uid), { photoURL: url });
      await updateProfile(user, { photoURL: url });
      
      // Audit log
      await addAuditLog('Profile Updated', 'user', user.uid, 'Updated profile picture');
      
      fetchProfile();
      setSuccess('Profile photo updated successfully.');
    } catch (err: any) {
      console.error(err);
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
      await updateDoc(doc(db, 'users', user.uid), {
        name: formData.name,
        phone: formData.phone,
        updatedAt: new Date().toISOString()
      });
      await updateProfile(user, { displayName: formData.name });
      
      await addAuditLog('Profile Updated', 'user', user.uid, 'Updated profile information');
      
      setEditMode(false);
      setSuccess('Profile updated successfully.');
      fetchProfile();
    } catch (err) {
      console.error(err);
      setError('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;
    if (passwordData.new !== passwordData.confirm) {
      setPasswordError("New passwords do not match.");
      return;
    }
    
    setPasswordError('');
    setPasswordSuccess('');
    
    try {
      const credential = EmailAuthProvider.credential(user.email, passwordData.current);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwordData.new);
      
      await addAuditLog('Password Changed', 'user', user.uid, 'Changed account password');
      
      setPasswordData({ current: '', new: '', confirm: '' });
      setPasswordSuccess('Password updated successfully.');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/wrong-password') {
        setPasswordError('Incorrect current password.');
      } else {
        setPasswordError('Failed to update password. You might have logged in with Google.');
      }
    }
  };
  
  const handleNotifToggle = async (key: keyof typeof notificationPrefs) => {
    if (!user) return;
    const newPrefs = { ...notificationPrefs, [key]: !notificationPrefs[key] };
    setNotificationPrefs(newPrefs);
    try {
      await updateDoc(doc(db, 'users', user.uid), { notificationPrefs: newPrefs });
      await addAuditLog('Settings Updated', 'user', user.uid, 'Updated notification preferences');
    } catch (err) {
      console.error("Failed to update prefs", err);
    }
  };

  const addAuditLog = async (action: string, targetType: string, targetId: string, description: string) => {
    if (!user) return;
    try {
      const { addDoc } = require('firebase/firestore');
      await addDoc(collection(db, 'auditLogs'), {
        userId: user.uid,
        role: 'admin',
        action,
        targetType,
        targetId,
        description,
        createdAt: new Date().toISOString()
      });
      fetchActivities();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-b-2 border-emerald-500 rounded-full"></div></div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Profile</h2>
      
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
              <label className="absolute bottom-0 right-0 p-2 bg-emerald-500 text-white rounded-full cursor-pointer hover:bg-emerald-600 shadow-md transition-transform transform hover:scale-110">
                <Camera className="h-5 w-5" />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={imageUploading} />
              </label>
            </div>
            {imageUploading && <p className="text-sm text-emerald-600 mb-2">Uploading...</p>}
            
            <h3 className="text-xl font-bold text-gray-900">{profile?.name || 'Admin User'}</h3>
            <p className="text-emerald-600 font-medium mb-4">{profile?.role === 'admin' ? 'Super Admin' : 'Admin'}</p>
            
            <div className="w-full space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                <Shield className="h-4 w-4 text-emerald-500" />
                Status: <span className="font-semibold capitalize text-gray-900">{profile?.status || 'active'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                <Calendar className="h-4 w-4 text-emerald-500" />
                Joined: {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
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
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500" />
                ) : (
                  <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
                    <User className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900">{profile?.name || 'Not set'}</span>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="flex items-center gap-3 px-3 py-2 bg-gray-100 rounded-lg cursor-not-allowed opacity-70">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-900">{user?.email}</span>
                </div>
                {editMode && <p className="text-xs text-gray-500 mt-1">Email cannot be changed directly.</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                {editMode ? (
                  <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500" />
                ) : (
                  <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900">{profile?.phone || 'Not set'}</span>
                  </div>
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
            <h3 className="text-lg font-bold text-gray-900 mb-4">Security</h3>
            {passwordError && <div className="bg-red-50 text-red-600 p-2 rounded-lg text-sm mb-4">{passwordError}</div>}
            {passwordSuccess && <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg text-sm mb-4">{passwordSuccess}</div>}
            
            <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Current Password</label>
                <input type="password" required value={passwordData.current} onChange={e => setPasswordData({...passwordData, current: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">New Password</label>
                <input type="password" required value={passwordData.new} onChange={e => setPasswordData({...passwordData, new: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Confirm New Password</label>
                <input type="password" required value={passwordData.confirm} onChange={e => setPasswordData({...passwordData, confirm: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500" />
              </div>
              <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800">
                Update Password
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Bell className="h-5 w-5" /> Notification Preferences</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(notificationPrefs).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={value} onChange={() => handleNotifToggle(key as keyof typeof notificationPrefs)} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
            {activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((act) => (
                  <div key={act.id} className="flex gap-4 p-3 border border-gray-50 rounded-lg bg-gray-50/50">
                    <div className="mt-1"><Clock className="h-4 w-4 text-gray-400" /></div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{act.action}</p>
                      <p className="text-xs text-gray-600">{act.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(act.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No recent activity.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
