'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { FaArrowLeft, FaBookOpen, FaClock, FaUser, FaCrown } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Header from '@/components/Header';

interface Story {
  id: string;
  title: string;
  content: string;
  author: string;
  category: string;
  imageUrl?: string;
  readTime: number;
  isPremium: boolean;
  isActive: boolean;
}

export default function StoriesPage() {
  const { t, dir } = useLanguage();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const storiesQuery = query(
        collection(db, 'stories'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(storiesQuery);
      const storiesData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Story))
        .filter(story => story.isActive !== false);
      setStories(storiesData);
      console.log('✅ Stories loaded:', storiesData.length);
    } catch (error) {
      console.error('Error fetching stories:', error);
      setError('Failed to load stories');
      toast.error('Failed to load stories');
    } finally {
      setLoading(false);
    }
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (!text) return 'No description available';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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
            {t('stories.title')}
          </h1>
          <span className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm">
            {stories.length} {t('stories.stories') || 'stories'}
          </span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {stories.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <p className="text-gray-500 dark:text-gray-400 text-lg" style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
              {t('stories.noStories')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <div key={story.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden border border-gray-100 dark:border-gray-700">
                {story.imageUrl && (
                  <img src={story.imageUrl} alt={story.title} className="w-full h-48 object-cover" />
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white" style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
                      {story.title}
                    </h3>
                    {story.isPremium && (
                      <span className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-1 rounded-full">
                        <FaCrown className="w-3 h-3" />
                        {t('stories.premium')}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm line-clamp-3" style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
                    {truncateText(story.content)}
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <FaUser className="w-4 h-4" />
                      {story.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaClock className="w-4 h-4" />
                      {story.readTime} {t('stories.readTime')}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full">
                      {story.category}
                    </span>
                    <Link
                      href={`/story/${story.id}`}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <FaBookOpen className="w-4 h-4" />
                      {t('stories.read')}
                    </Link>
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
