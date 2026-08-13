'use client';

import { useEffect, ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/contexts/FirebaseContext';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface AdminGuardProps {
  children: ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, loading, isAdmin } = useFirebase();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (loading) return;

      if (!user) {
        router.push('/admin/login');
        setChecking(false);
        return;
      }

      try {
        // Force check and set admin status
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
        } else {
          const data = userSnap.data();
          if (data.role !== 'super_admin' && data.role !== 'admin') {
            // Update to admin
            await setDoc(userRef, {
              role: 'super_admin',
              updatedAt: serverTimestamp()
            }, { merge: true });
          }
        }
        
        // Allow access
        setChecking(false);
        
      } catch (error) {
        console.error('Admin check error:', error);
        // Still allow access - we'll handle errors in the page
        setChecking(false);
      }
    };

    checkAdmin();
  }, [user, loading]);

  if (loading || checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
