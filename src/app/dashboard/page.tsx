'use client';

import { useFirebase } from '@/contexts/FirebaseContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FaBook, 
  FaTrophy, 
  FaShoppingBag, 
  FaCrown, 
  FaArrowLeft,
  FaStore,
  FaQuestionCircle,
  FaUsers,
  FaCreditCard
} from 'react-icons/fa';

export default function DashboardPage() {
  const { user, userData, isAdmin } = useFirebase();
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
      <div className="container mx-auto px-4 max-w-6xl">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6">
          <FaArrowLeft className="w-4 h-4" />
          {t('nav.home')}
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Dashboard
        </h1>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.subscription')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userData?.subscription?.level === 3 ? 'VIP' :
                   userData?.subscription?.level === 2 ? 'Premium' :
                   userData?.subscription?.level === 1 ? 'Basic' : 'Free'}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                <FaCrown className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isAdmin ? 'Admin' : 'User'}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <FaTrophy className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Admin Section - Only visible to admins */}
        {isAdmin && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white mb-6">
              <h2 className="text-2xl font-bold mb-2">👑 Admin Dashboard</h2>
              <p className="text-blue-100">
                You have full access to manage users, stores, quizzes, stories, and subscriptions.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Super Admin</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Full Access</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">All Permissions</span>
              </div>
            </div>

            {/* Admin Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/admin/stores"
                className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm hover:shadow-lg transition-all text-center border border-gray-200 dark:border-gray-700"
              >
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <FaStore className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Manage Stores</span>
              </Link>

              <Link
                href="/admin/quizzes"
                className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm hover:shadow-lg transition-all text-center border border-gray-200 dark:border-gray-700"
              >
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <FaQuestionCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Manage Quizzes</span>
              </Link>

              <Link
                href="/admin/stories"
                className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm hover:shadow-lg transition-all text-center border border-gray-200 dark:border-gray-700"
              >
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <FaBook className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Manage Stories</span>
              </Link>

              <Link
                href="/admin/users"
                className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm hover:shadow-lg transition-all text-center border border-gray-200 dark:border-gray-700"
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <FaUsers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Manage Users</span>
              </Link>
            </div>
          </div>
        )}

        {/* User Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/stores" className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
              <span className="text-2xl block mb-1">🛍️</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('nav.stores')}</span>
            </Link>
            <Link href="/quizzes" className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
              <span className="text-2xl block mb-1">❓</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('nav.quizzes')}</span>
            </Link>
            <Link href="/stories" className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
              <span className="text-2xl block mb-1">📖</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('nav.stories')}</span>
            </Link>
            <Link href="/profile" className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <span className="text-2xl block mb-1">👤</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('nav.profile')}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
