'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '@/lib/firebase/config';

export default function ForceAdmin() {
  const [status, setStatus] = useState('Checking...');
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAndSetAdmin = async () => {
      // Listen for auth state changes
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (!currentUser) {
          setStatus('❌ Please sign in first');
          return;
        }

        setUser(currentUser);
        setStatus('✅ User found: ' + currentUser.email);

        try {
          // Check if user document exists
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            // Create new user document with admin role
            await setDoc(userRef, {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName || 'Admin',
              photoURL: currentUser.photoURL || '',
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
            setStatus('✅ New admin document created!');
          } else {
            // Update existing user to admin
            const data = userSnap.data();
            if (data.role !== 'super_admin' && data.role !== 'admin') {
              await setDoc(userRef, {
                role: 'super_admin',
                updatedAt: serverTimestamp()
              }, { merge: true });
              setStatus('✅ User role updated to super_admin!');
            } else {
              setStatus(`✅ User is already ${data.role}!`);
            }
          }

          // Also create count document if needed
          const countRef = doc(db, 'users', 'count');
          const countSnap = await getDoc(countRef);
          if (!countSnap.exists()) {
            await setDoc(countRef, { count: 1 });
          }

          setStatus('🎉 Admin access granted! Redirecting...');
          
          // Redirect to admin dashboard after 2 seconds
          setTimeout(() => {
            router.push('/admin/dashboard');
          }, 2000);

        } catch (error: any) {
          console.error('Error:', error);
          setStatus('❌ Error: ' + error.message);
        }
      });

      return () => unsubscribe();
    };

    checkAndSetAdmin();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <div className="text-center">
          <div className="text-5xl mb-4">🔑</div>
          <h1 className="text-2xl font-bold text-gray-900">Force Admin Access</h1>
          <p className="text-gray-500 mt-2">Setting admin permissions...</p>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className={`font-medium ${status.includes('✅') || status.includes('🎉') ? 'text-green-600' : status.includes('❌') ? 'text-red-600' : 'text-gray-600'}`}>
              {status}
            </p>
            {user && (
              <div className="mt-3 text-left text-sm text-gray-600">
                <p>📧 Email: <strong>{user.email}</strong></p>
                <p>🆔 UID: <strong>{user.uid}</strong></p>
              </div>
            )}
          </div>

          {status.includes('Redirecting') && (
            <div className="mt-4 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Redirecting...</span>
            </div>
          )}

          {!user && !status.includes('Redirecting') && (
            <a
              href="/"
              className="mt-4 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Homepage
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
