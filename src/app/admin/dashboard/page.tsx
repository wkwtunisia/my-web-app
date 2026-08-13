'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy,
  limit 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { 
  FaUsers, 
  FaStore, 
  FaQuestionCircle, 
  FaBook, 
  FaCreditCard,
  FaUserPlus,
  FaCrown,
  FaChartLine
} from 'react-icons/fa';
import { useFirebase } from '@/contexts/FirebaseContext';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Stats {
  totalUsers: number;
  totalStores: number;
  totalQuizzes: number;
  totalStories: number;
  totalSubscriptions: number;
}

export default function DashboardPage() {
  const { user, userData } = useFirebase();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalStores: 0,
    totalQuizzes: 0,
    totalStories: 0,
    totalSubscriptions: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch users
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        setStats(prev => ({ ...prev, totalUsers: usersSnapshot.size }));
      } catch (err) {
        console.warn('Error fetching users:', err);
      }

      // Fetch stores
      try {
        const storesSnapshot = await getDocs(collection(db, 'stores'));
        setStats(prev => ({ ...prev, totalStores: storesSnapshot.size }));
      } catch (err) {
        console.warn('Error fetching stores:', err);
      }

      // Fetch quizzes
      try {
        const quizzesSnapshot = await getDocs(collection(db, 'quizzes'));
        setStats(prev => ({ ...prev, totalQuizzes: quizzesSnapshot.size }));
      } catch (err) {
        console.warn('Error fetching quizzes:', err);
      }

      // Fetch stories
      try {
        const storiesSnapshot = await getDocs(collection(db, 'stories'));
        setStats(prev => ({ ...prev, totalStories: storiesSnapshot.size }));
      } catch (err) {
        console.warn('Error fetching stories:', err);
      }

      // Fetch subscriptions
      try {
        const subsSnapshot = await getDocs(collection(db, 'subscriptionPlans'));
        setStats(prev => ({ ...prev, totalSubscriptions: subsSnapshot.size }));
      } catch (err) {
        console.warn('Error fetching subscriptions:', err);
      }

    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load some stats');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: FaUsers, color: 'blue', bg: 'bg-blue-100', text: 'text-blue-600' },
    { title: 'Stores', value: stats.totalStores, icon: FaStore, color: 'green', bg: 'bg-green-100', text: 'text-green-600' },
    { title: 'Quizzes', value: stats.totalQuizzes, icon: FaQuestionCircle, color: 'purple', bg: 'bg-purple-100', text: 'text-purple-600' },
    { title: 'Stories', value: stats.totalStories, icon: FaBook, color: 'orange', bg: 'bg-orange-100', text: 'text-orange-600' },
    { title: 'Subscriptions', value: stats.totalSubscriptions, icon: FaCreditCard, color: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-600' },
    { title: 'Admin Level', value: userData?.role || 'Super', icon: FaChartLine, color: 'red', bg: 'bg-red-100', text: 'text-red-600' },
  ];

  const quickActions = [
    { title: 'Add Store', path: '/admin/stores', icon: FaStore, color: 'green' },
    { title: 'Add Quiz', path: '/admin/quizzes', icon: FaQuestionCircle, color: 'purple' },
    { title: 'Add Story', path: '/admin/stories', icon: FaBook, color: 'orange' },
    { title: 'Manage Users', path: '/admin/users', icon: FaUsers, color: 'blue' },
    { title: 'Subscriptions', path: '/admin/subscriptions', icon: FaCreditCard, color: 'yellow' },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back, {user?.displayName || 'Admin'}! 👋
        </p>
        {userData && (
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Role: {userData.role || 'super_admin'}
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mt-1"></div>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  )}
                </div>
                <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.text}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white">
          <h2 className="text-xl font-bold mb-2">🚀 Admin Dashboard</h2>
          <p className="text-blue-100">
            You have full access to manage users, stores, quizzes, stories, and subscriptions.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Super Admin</span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Full Access</span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">All Permissions</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.path}
                  href={action.path}
                  className="p-3 rounded-lg text-center hover:bg-gray-50 transition-colors border border-gray-100"
                >
                  <Icon className={`w-5 h-5 text-${action.color}-600 mx-auto mb-1`} />
                  <span className="text-xs text-gray-600">{action.title}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Admin Info */}
      <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <p className="text-sm text-blue-800">
          ✅ You are logged in as <strong>{user?.email}</strong> with <strong>super_admin</strong> privileges.
          <br />
          You can manage all content and users from this dashboard.
        </p>
      </div>
    </AdminLayout>
  );
}
