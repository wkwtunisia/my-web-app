'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/contexts/FirebaseContext';
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function FixPermissions() {
  const { user, loading } = useFirebase();
  const [fixing, setFixing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const router = useRouter();

  const fixPermissions = async () => {
    if (!user) {
      toast.error('Please sign in first');
      return;
    }

    setFixing(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
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
      } else {
        const data = userSnap.data();
        if (data.role !== 'super_admin' && data.role !== 'admin') {
          await updateDoc(userRef, {
            role: 'super_admin',
            updatedAt: serverTimestamp()
          });
        }
      }

      const countRef = doc(db, 'users', 'count');
      const countSnap = await getDoc(countRef);
      if (!countSnap.exists()) {
        await setDoc(countRef, { count: 1 });
      }

      setResult({
        success: true,
        message: '✅ Permissions fixed! Your are now super_admin.',
        uid: user.uid,
        email: user.email
      });
      
      toast.success('✅ Permissions fixed successfully!');
      
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 2000);
      
    } catch (error: any) {
      console.error('Error fixing permissions:', error);
      setResult({
        success: false,
        error: error.message
      });
      toast.error('Failed to fix permissions: ' + error.message);
    } finally {
      setFixing(false);
    }
  };

  // Auto-fix permissions when user loads
  useEffect(() => {
    if (user && !loading && !fixing) {
      fixPermissions();
    }
  }, [user, loading]);

  if (loading || fixing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{fixing ? 'Fixing permissions...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900">Please Sign In</h1>
          <p className="text-gray-500 mt-2">You need to sign in first</p>
          <a
            href="/admin/login"
            className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-3xl text-white">🔧</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Fix Permissions</h1>
          <p className="text-gray-500 mt-2">Auto-fixing your admin permissions...</p>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-medium text-gray-700">User Details:</p>
            <div className="mt-2 space-y-1 text-sm">
              <p>📧 <span className="text-gray-600">Email:</span> <strong>{user.email}</strong></p>
              <p>🆔 <span className="text-gray-600">UID:</span> <strong>{user.uid}</strong></p>
              <p>👤 <span className="text-gray-600">Name:</span> <strong>{user.displayName || 'Not set'}</strong></p>
            </div>
          </div>

          {result && (
            <div className={`p-4 rounded-lg ${result.success ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'}`}>
              <p className={result.success ? 'text-green-700' : 'text-red-700'}>
                {result.message || result.error}
              </p>
              {result.success && (
                <p className="text-sm text-green-600 mt-2">
                  ✅ You now have super_admin access! Redirecting to dashboard...
                </p>
              )}
            </div>
          )}

          {!result && (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Processing...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
