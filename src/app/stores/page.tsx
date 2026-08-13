'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import Link from 'next/link';
import { FaArrowLeft, FaShoppingCart } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Header from '@/components/Header';

interface Store {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  isActive: boolean;
}

export default function StoresPage() {
  const { t, dir } = useLanguage();
  const { color } = useTheme();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const storesQuery = query(
        collection(db, 'stores'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(storesQuery);
      const storesData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Store))
        .filter(store => store.isActive !== false);
      setStores(storesData);
      console.log('✅ Stores loaded:', storesData.length);
    } catch (error) {
      console.error('Error fetching stores:', error);
      setError('Failed to load stores');
      toast.error('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <FaArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white" style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
            {t('stores.title')}
          </h1>
          <span className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm">
            {stores.length} {t('common.items') || 'items'}
          </span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {stores.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <p className="text-gray-500 dark:text-gray-400 text-lg" style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
              {t('stores.noStores')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <div key={store.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden border border-gray-100 dark:border-gray-700">
                {store.imageUrl && (
                  <img src={store.imageUrl} alt={store.name} className="w-full h-48 object-cover" />
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white" style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
                      {store.name}
                    </h3>
                    <span className="text-xl font-bold" style={{ color: color }}>
                      ${store.price}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mt-2" style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
                    {store.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full">
                      {store.category}
                    </span>
                    <button className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors" style={{ backgroundColor: color }}>
                      <FaShoppingCart className="w-4 h-4" />
                      {t('stores.buyNow')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
