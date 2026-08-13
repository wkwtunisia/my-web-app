'use client';

import { useFirebase } from '@/contexts/FirebaseContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { FaUser, FaEnvelope, FaCrown, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, userData } = useFirebase();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-md">
          <p className="text-gray-600 dark:text-gray-400">{t('nav.signIn')}</p>
          <Link href="/" className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            {t('nav.signIn')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6">
          <FaArrowLeft className="w-4 h-4" />
          {t('nav.home')}
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-24 h-24 rounded-full mx-auto ring-4 ring-blue-500" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 mx-auto flex items-center justify-center text-white text-4xl font-bold">
                {user?.displayName?.[0] || user?.email?.[0] || 'U'}
              </div>
            )}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
              {user?.displayName || 'User'}
            </h1>
            {userData?.role && (
              <span className="inline-block mt-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-xs rounded-full font-medium">
                👑 {userData.role}
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <FaEnvelope className="text-gray-400 dark:text-gray-500" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.email')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <FaCrown className="text-yellow-500" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.subscription')}</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {userData?.subscription?.level === 3 ? t('profile.vip') :
                   userData?.subscription?.level === 2 ? t('profile.premium') :
                   userData?.subscription?.level === 1 ? t('profile.basic') : t('profile.free')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <FaUser className="text-gray-400 dark:text-gray-500" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.userId')}</p>
                <p className="font-mono text-sm text-gray-900 dark:text-white">{user?.uid}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
