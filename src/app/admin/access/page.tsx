'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/contexts/FirebaseContext';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import toast from 'react-hot-toast';

export default function AdminAccess() {
  const { user, loading } = useFirebase();
  const router = useRouter();

  useEffect(() => {
    const setupAdmin = async () => {
      if (loading) return;

      if (!user) {
        toast.error('Please sign in first');
        router.push('/admin/login');
        return;
      }

      try {
        // Force set user as super_admin
        const userRef = doc(db, 'users', user.uid);
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
        }, { merge: true });

        toast.success('✅ Admin access granted!');
        
        // Redirect to dashboard
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 1500);
        
      } catch (error: any) {
        console.error('Error setting admin:', error);
        toast.error('Failed to set admin: ' + error.message);
      }
    };

    setupAdmin();
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
        <div className="text-5xl mb-4">🔑</div>
        <h1 className="text-2xl font-bold text-gray-900">Setting Admin Access</h1>
        <p className="text-gray-500 mt-2">Please wait while we grant you admin privileges...</p>
        <div className="mt-6">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-400 mt-3">This will take a moment</p>
        </div>
      </div>
    </div>
  );
}
