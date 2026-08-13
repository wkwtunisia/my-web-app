'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useFirebase } from '@/contexts/FirebaseContext';

export default function PageAnalytics() {
  const pathname = usePathname();
  const { user } = useFirebase();

  useEffect(() => {
    const trackPageView = async () => {
      try {
        await addDoc(collection(db, 'analytics'), {
          page: pathname,
          userId: user?.uid || 'anonymous',
          timestamp: serverTimestamp(),
          userAgent: window.navigator.userAgent,
        });
      } catch (error) {
        console.error('Error tracking page view:', error);
      }
    };

    trackPageView();
  }, [pathname, user]);

  return null;
}
