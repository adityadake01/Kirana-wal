/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { useAuthStore, UserRole, UserStatus } from './store/authStore';
import { useSettingsStore } from './store/settingsStore';
import { useNotificationStore } from './store/notificationStore';

// Layouts
import Navbar from './components/layout/Navbar';
import MobileBottomNav from './components/layout/MobileBottomNav';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ShopPage from './pages/ShopPage';
import AllShops from './pages/AllShops';
import CategoryPage from './pages/CategoryPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import Notifications from './pages/Notifications';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import ShopkeeperDashboard from './pages/shopkeeper/ShopkeeperDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import PendingApproval from './pages/PendingApproval';
import ProfilePage from './pages/ProfilePage';

// Protected Route Wrapper
function ProtectedRoute({ element, allowedRole }: { element: React.ReactNode, allowedRole?: string }) {
  const { user, role, status, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-4 border-emerald-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRole && role !== allowedRole && !(allowedRole === 'admin' && user.email?.trim().toLowerCase() === 'adityadake627@gmail.com')) {
    return <Navigate to="/" replace />;
  }

  if (role === 'shopkeeper' && status === 'pending') {
    return <Navigate to="/pending-approval" replace />;
  }
  
  return <>{element}</>;
}

export default function App() {
  const { setUser, setLoading, loading, user, role } = useAuthStore();

  useEffect(() => {
    useSettingsStore.getState().init();
  }, []);


  useEffect(() => {
    let userUnsubscribe: (() => void) | undefined;

    const authUnsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (userUnsubscribe) {
        userUnsubscribe();
        userUnsubscribe = undefined;
      }

      if (firebaseUser) {
        if (firebaseUser.email?.trim().toLowerCase() === 'adityadake627@gmail.com') {
           setUser(firebaseUser, 'admin');
           setLoading(false);
           updateDoc(doc(db, 'users', firebaseUser.uid), { role: 'admin' }).catch(() => {});
           useNotificationStore.getState().init();
          useSettingsStore.getState().init();
           return;
        }

        const userDocRef = doc(db, 'users', firebaseUser.uid);
        userUnsubscribe = onSnapshot(userDocRef, (docSnap) => {
          let updatedRole: UserRole | null = null;
          let updatedStatus: UserStatus = 'active';
          
          if (docSnap.exists()) {
            if (docSnap.data().role) updatedRole = docSnap.data().role as UserRole;
            if (docSnap.data().status) updatedStatus = docSnap.data().status as UserStatus;
          }
          
          // Ensure shopkeeper gets their real status from shops collection
          if (updatedRole === 'shopkeeper') {
            if ((window as any).shopUnsubscribe) { (window as any).shopUnsubscribe(); }
            (window as any).shopUnsubscribe = onSnapshot(doc(db, 'shops', firebaseUser.uid), (shopSnap) => {
               if (shopSnap.exists() && shopSnap.data().status) {
                  setUser(firebaseUser, updatedRole, shopSnap.data().status);
               } else {
                  setUser(firebaseUser, updatedRole, updatedStatus);
               }
            }, (shopErr) => {
               console.warn("Shop snapshot error:", shopErr);
               setUser(firebaseUser, updatedRole, updatedStatus);
            });
            setLoading(false);
            return;
          } else {
            // Check if store already has the role (set by registration before snapshot fires)
            const currentStore = useAuthStore.getState();
            if (currentStore.user?.uid === firebaseUser.uid && currentStore.role) {
              updatedRole = currentStore.role;
              updatedStatus = currentStore.status;
            } else {
              updatedRole = 'customer'; // Ultimate fallback
            }
          }
          
          setUser(firebaseUser, updatedRole, updatedStatus);
          setLoading(false);
          useNotificationStore.getState().init();
          useSettingsStore.getState().init();
        }, (error) => {
          console.warn("Failed to listen to user role:", error);
          const currentStore = useAuthStore.getState();
          let fallbackRole: UserRole = 'customer';
          let fallbackStatus: UserStatus = 'active';
          if (currentStore.user?.uid === firebaseUser.uid && currentStore.role) {
             fallbackRole = currentStore.role;
             fallbackStatus = currentStore.status;
          }
          setUser(firebaseUser, fallbackRole, fallbackStatus);
          setLoading(false);
          useNotificationStore.getState().init();
          useSettingsStore.getState().init();
        });
      } else {
        setUser(null, null, null);
        setLoading(false);
        useNotificationStore.getState().init();
          useSettingsStore.getState().init();
      }
    });

    return () => {
      authUnsubscribe();
      if (userUnsubscribe) {
        userUnsubscribe();
      }
      if ((window as any).shopUnsubscribe) {
        (window as any).shopUnsubscribe();
      }
    };
  }, [setUser, setLoading]);

  return (
    <Router>
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Navbar />
        <main className={`flex-1 ${role === 'admin' || role === 'shopkeeper' ? '' : 'pb-16 md:pb-0'}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/shops" element={<AllShops />} />
            <Route path="/category/:categoryId" element={<CategoryPage />} />
            <Route path="/shop/:shopId" element={<ShopPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-conditions" element={<TermsConditions />} />
            <Route path="/pending-approval" element={<PendingApproval />} />
            <Route path="/notifications" element={<Notifications />} />
            
            {/* Unified Profile Route */}
            <Route path="/profile" element={<ProtectedRoute element={<ProfilePage />} />} />
            <Route path="/account" element={<Navigate to="/profile" replace />} />
            <Route path="/customer" element={<Navigate to="/profile" replace />} />
            <Route path="/customer/profile" element={<Navigate to="/profile" replace />} />
            <Route path="/customer/orders" element={<Navigate to="/dashboard?tab=orders" replace />} />
            <Route path="/categories" element={<Navigate to="/shops" replace />} />
            <Route path="/seller/profile" element={<Navigate to="/profile" replace />} />
            <Route path="/admin/profile" element={<Navigate to="/profile" replace />} />
            <Route path="/store/:sellerId" element={<Navigate to="/shop/:sellerId" replace />} />
            
            {/* Customer Routes */}
            <Route 
              path="/dashboard" 
              element={<ProtectedRoute element={<CustomerDashboard />} allowedRole="customer" />} 
            />
            
            {/* Shopkeeper Routes */}
            <Route 
              path="/shopkeeper/*" 
              element={<ProtectedRoute element={<ShopkeeperDashboard />} allowedRole="shopkeeper" />} 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin/*" 
              element={<ProtectedRoute element={<AdminDashboard />} allowedRole="admin" />} 
            />
          </Routes>
        </main>
        <MobileBottomNav />
      </div>
    </Router>
  );
}

