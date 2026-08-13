'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/contexts/FirebaseContext';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import toast from 'react-hot-toast';

export default function FixAdmin() {
  const { user, loading } = useFirebase();
  const [fixing, setFixing] = useState(false);
  const [status, setStatus] = useState('Checking...');
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      fixPermissions();
    }
  }, [user, loading]);

  const fixPermissions = async () => {
    if (!user) {
      setStatus('❌ Please sign in first');
      return;
    }

    setFixing(true);
    setStatus('🔧 Fixing permissions...');

    try {
      // 1. Check if user document exists
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Create user document with admin role
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Admin',
          photoURL: user.photoURL || '',
          role: 'super_admin',
          subscription: {
            level: 3,
            isActive: true,
            startDate: serverTimestamp(),
          },
          isActive: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setStatus('✅ Created user document with super_admin role');
      } else {
        // Update existing user to admin
        const data = userSnap.data();
        if (data.role !== 'super_admin' && data.role !== 'admin') {
          await updateDoc(userRef, {
            role: 'super_admin',
            updatedAt: serverTimestamp()
          });
          setStatus('✅ Updated user role to super_admin');
        } else {
          setStatus(`✅ User is already ${data.role}`);
        }
      }

      // 2. Create necessary collections if they don't exist
      const collections = ['stores', 'quizzes', 'stories', 'subscriptionPlans'];
      
      for (const collectionName of collections) {
        const collectionRef = doc(db, collectionName, '_temp');
        try {
          await setDoc(collectionRef, { temp: true, createdAt: serverTimestamp() }, { merge: true });
          await updateDoc(collectionRef, { temp: true });
          setStatus(`✅ ${collectionName} collection ready`);
        } catch (err) {
          console.log(`Collection ${collectionName} already exists or created`);
        }
      }

      // 3. Create count document
      const countRef = doc(db, 'users', 'count');
      const countSnap = await getDoc(countRef);
      if (!countSnap.exists()) {
        await setDoc(countRef, { count: 1 });
        setStatus('✅ Count document created');
      }

      // 4. Add a sample store if none exist
      const storesSnapshot = await getDoc(doc(db, 'stores', 'temp'));
      if (!storesSnapshot.exists()) {
        await setDoc(doc(db, 'stores', 'sample-store'), {
          name: 'Sample Store',
          description: 'This is a sample store created automatically',
          category: 'Demo',
          price: 29.99,
          imageUrl: '',
          isActive: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setStatus('✅ Sample store created');
      }

      setStatus('✅ All permissions fixed! Redirecting...');
      toast.success('Admin permissions fixed successfully!');
      
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 2000);

    } catch (error: any) {
      console.error('Error fixing permissions:', error);
      setStatus(`❌ Error: ${error.message}`);
      toast.error('Failed to fix permissions: ' + error.message);
    } finally {
      setFixing(false);
    }
  };

  if (loading || fixing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{status}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <span className="text-5xl block mb-4">🔒</span>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Please Sign In</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">You need to sign in first</p>
          <a
            href="/"
            className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
        <span className="text-5xl block mb-4">🔧</span>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fix Admin Permissions</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Click the button below to fix your admin permissions</p>
        
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            📧 Email: <strong>{user.email}</strong>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            🆔 UID: <strong>{user.uid.slice(0, 12)}...</strong>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            👤 Name: <strong>{user.displayName || 'Not set'}</strong>
          </p>
        </div>

        <button
          onClick={fixPermissions}
          className="mt-6 w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Fix Permissions
        </button>
      </div>
    </div>
  );
}
