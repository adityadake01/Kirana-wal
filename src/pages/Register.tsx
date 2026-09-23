import React from "react";
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, addDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { Store, User, Mail, Lock, Phone, MapPin, Eye, EyeOff, Loader2 } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';

export default function Register() {
  const [searchParams] = useSearchParams();
  const requestedRole = searchParams.get('role') === 'shopkeeper' ? 'shopkeeper' : 'customer';
  
  const [role, setRole] = useState<'customer' | 'shopkeeper'>(requestedRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopImage, setShopImage] = useState('');
  
  // Location States
  const [pincode, setPincode] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState('');
  const [stateName, setStateName] = useState('');
  const [district, setDistrict] = useState('');
  const [areas, setAreas] = useState<string[]>([]);
  const [selectedArea, setSelectedArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  
  
  const [imageUploading, setImageUploading] = useState(false);
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImageUploading(true);
    try {
      const storageRef = ref(storage, `shop_images/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setShopImage(url);
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("Failed to upload image. Please check your storage rules.");
    } finally {
      setImageUploading(false);
    }
  };
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { enableGoogleLogin } = useSettingsStore();
  const navigate = useNavigate();

  // Fetch location details using Postal PIN Code API
  useEffect(() => {
    const fetchPinDetails = async () => {
      if (pincode.length !== 6) return;
      setPinLoading(true);
      setPinError('');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 seconds timeout
      
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, { signal: controller.signal });
        clearTimeout(timeoutId);
        const data = await response.json();
        
        if (data && data[0].Status === 'Success') {
          const postOffices = data[0].PostOffice;
          setStateName(postOffices[0].State);
          setDistrict(postOffices[0].District);
          
          const uniqueAreas = Array.from(new Set(postOffices.map((po: any) => po.Name))) as string[];
          setAreas(uniqueAreas);
          if (uniqueAreas.length > 0) {
            setSelectedArea(uniqueAreas[0]);
          }
        } else {
          setPinError('Invalid Pincode');
          setStateName('');
          setDistrict('');
          setAreas([]);
        }
      } catch (err) {
        clearTimeout(timeoutId);
        setPinError('Could not fetch location automatically, please type below.');
      } finally {
        setPinLoading(false);
      }
    };

    if (pincode.length === 6) {
      fetchPinDetails();
    } else {
      setStateName('');
      setDistrict('');
      setAreas([]);
      setPinError('');
    }
  }, [pincode]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!privacyAccepted) {
      setError('You must accept the Terms & Conditions and Privacy Policy.');
      return;
    }

    if (pincode.length !== 6 || !stateName || !district || !selectedArea) {
      setError('Please complete your full address (Pincode, State, District, Area).');
      return;
    }

    setLoading(true);

    try {
      const fullAddress = `${landmark ? landmark + ', ' : ''}${selectedArea}, ${district}, ${stateName} - ${pincode}`;
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userData: any = {
        name,
        email,
        phone,
        address: fullAddress,
        role,
        status: role === 'shopkeeper' ? 'pending' : 'active',
        createdAt: new Date().toISOString(),
      };

      const promises: Promise<any>[] = [
        updateProfile(user, { displayName: name }),
        setDoc(doc(db, 'users', user.uid), userData)
      ];

      if (role === 'shopkeeper') {
        promises.push(
          setDoc(doc(db, 'shops', user.uid), {
            ownerId: user.uid,
            ownerName: name,
            name: shopName,
            image: shopImage,
            address: fullAddress,
            phone,
            status: 'pending',
            createdAt: new Date().toISOString(),
          })
        );
      }

      await Promise.all(promises);
      
      if (role === 'shopkeeper') {
        await addDoc(collection(db, 'notifications'), {
          recipientId: 'admin',
          title: 'New Seller Registration',
          message: `${shopName} has registered and is pending approval.`,
          read: false,
          createdAt: new Date().toISOString(),
          actionUrl: '/admin?tab=sellers'
        });
      }

      // Force update the local store to avoid race condition with onAuthStateChanged
      useAuthStore.getState().setUser(user, role);

      if (role === 'shopkeeper') {
        navigate('/pending-approval'); // Redirect directly to pending approval
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.warn("Registration error:", err);
      setError(err.message || 'Failed to create an account.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        const isAdmin = user.email?.trim().toLowerCase() === 'adityadake627@gmail.com';
        const assignedRole = isAdmin ? 'admin' : 'customer';
        
        const userData = {
          name: user.displayName || (isAdmin ? 'Admin User' : 'Google User'),
          email: user.email,
          phone: user.phoneNumber || '',
          address: '',
          role: assignedRole,
          status: 'active',
          createdAt: new Date().toISOString(),
        };
        await setDoc(docRef, userData);
        useAuthStore.getState().setUser(user, assignedRole, 'active');
      } else {
        let existingRole = docSnap.data().role;
        const existingStatus = docSnap.data().status || 'active';
        if (user.email?.trim().toLowerCase() === 'adityadake627@gmail.com') {
           existingRole = 'admin';
           updateDoc(docRef, { role: 'admin' }).catch(() => {});
        }
        useAuthStore.getState().setUser(user, existingRole, existingStatus);
      }
      navigate('/');
    } catch (err: any) {
      console.warn("Google Login error:", err);
      setError(`Failed to sign up with Google: ${err.message || 'Unknown error'}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <Store className="mx-auto h-12 w-12 text-emerald-500" />
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900">Create an Account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Join Kirana Wala today
          </p>
        </div>

        {/* Role Toggle */}
        <div className="flex p-1 bg-gray-100 rounded-lg mb-8">
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${role === 'customer' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
            onClick={() => setRole('customer')}
          >
            Customer
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${role === 'shopkeeper' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
            onClick={() => setRole('shopkeeper')}
          >
            Seller
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleRegister}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="John Doe"
              />
            </div>
          </div>

          {role === 'shopkeeper' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Store className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Sharma General Store"
                />
              </div>
            </div>
          )}

          {role === 'shopkeeper' && (
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shop Photo (Upload)</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {imageUploading && <p className="text-sm text-emerald-600 mt-1 flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Uploading image...</p>}
                {shopImage && !imageUploading && <img src={shopImage} alt="Preview" className="mt-2 h-24 rounded-lg object-cover" />}
              </div>
            </div>

          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="+91 9876543210"
              />
            </div>
          </div>

          <div className="space-y-4 border border-gray-100 rounded-lg p-4 bg-gray-50/50">
            <h3 className="text-sm font-bold text-gray-900 mb-2">Location Details</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="6 Digit Pincode"
                />
                {pinLoading && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                  </div>
                )}
              </div>
              {pinError && <p className="text-xs text-red-500 mt-1">{pinError}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input 
                  type="text" 
                  required
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-emerald-500 focus:border-emerald-500" 
                  placeholder="State"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                <input 
                  type="text" 
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-emerald-500 focus:border-emerald-500" 
                  placeholder="District"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Village / Area</label>
              {areas.length > 0 ? (
                <select
                  required
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="" disabled>Select your area</option>
                  {areas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter your area (Enter Pincode first)"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Landmark / Building Name (Optional)</label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Near temple, building number, etc."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-start mt-4">
            <div className="flex items-center h-5">
              <input
                id="privacy"
                type="checkbox"
                required
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="privacy" className="font-medium text-gray-700">
                I agree to the <Link to="/privacy-policy" className="text-emerald-600 hover:underline" target="_blank">Terms & Conditions and Privacy Policy</Link>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors mt-6"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        {role === 'customer' && (
          <>
            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Sign in with Google
              </button>
            </div>
          </>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-500">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
