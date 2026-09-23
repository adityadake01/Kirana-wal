import React from 'react';
import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import { db } from '../../lib/firebase';
import { Settings, Save, Loader2 } from 'lucide-react';

export default function AdminSettings() {
  const [logoUrl, setLogoUrl] = useState('');
  const [enableGoogleLogin, setEnableGoogleLogin] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [imageUploading, setImageUploading] = useState(false);
  
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImageUploading(true);
    try {
      const storageRef = ref(storage, `settings/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setLogoUrl(url);
    } catch (err) {
      console.error("Logo upload failed:", err);
      alert("Failed to upload logo. Please check Firebase Storage rules.");
    } finally {
      setImageUploading(false);
    }
  };
  
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'general');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setLogoUrl(snap.data().logoUrl || '');
          setEnableGoogleLogin(snap.data().enableGoogleLogin !== false);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await setDoc(doc(db, 'settings', 'general'), {
        logoUrl,
        enableGoogleLogin
      }, { merge: true });
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>;

  return (
    <div className="max-w-2xl">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Settings className="h-6 w-6 text-emerald-600" /> Global Settings
      </h3>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        {message && (
          <div className={`p-4 rounded-lg text-sm font-medium ${message.includes('successfully') ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
            {message}
          </div>
        )}

        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">App Logo (Upload)</label>
          <div className="flex items-center gap-4">
            <input 
              type="file" 
              accept="image/*"
              onChange={handleLogoUpload}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          {imageUploading && <p className="text-sm text-emerald-600 mt-2 flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</p>}
          {logoUrl && !imageUploading && (
             <div className="mt-4">
               <p className="text-xs text-gray-500 mb-2">Current Logo Preview:</p>
               <img src={logoUrl} alt="Logo Preview" className="h-12 object-contain bg-gray-50 rounded p-2 border" />
             </div>
          )}
        </div>


        <div className="pt-4 border-t border-gray-100">
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={enableGoogleLogin} 
              onChange={e => setEnableGoogleLogin(e.target.checked)} 
              className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <span className="text-sm font-medium text-gray-700">Enable Google Login</span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-8">Allow users and sellers to register/login using their Google accounts.</p>
        </div>

        <div className="pt-6">
          <button 
            onClick={handleSave} 
            disabled={saving} 
            className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-emerald-700 transition flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
