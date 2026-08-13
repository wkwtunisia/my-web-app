'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useFirebase } from '@/contexts/FirebaseContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/layout/AdminLayout';

export default function AdminStoriesPage() {
  const { user, isAdmin } = useFirebase();
  const { t, dir } = useLanguage();
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    category: '',
    imageUrl: '',
    readTime: 5,
    isPremium: false,
    isActive: true
  });

  useEffect(() => {
    if (user && isAdmin) {
      fetchStories();
    }
  }, [user, isAdmin]);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'stories'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const storiesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStories(storiesData);
    } catch (error: any) {
      console.error('Error fetching stories:', error);
      toast.error('Failed to fetch stories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isAdmin) {
      toast.error('You need admin privileges');
      return;
    }

    try {
      const data = {
        ...formData,
        views: 0,
        likes: 0,
        updatedAt: serverTimestamp()
      };

      if (editingStory) {
        await updateDoc(doc(db, 'stories', editingStory.id), data);
        toast.success('Story updated successfully!');
      } else {
        await addDoc(collection(db, 'stories'), {
          ...data,
          createdAt: serverTimestamp()
        });
        toast.success('Story created successfully!');
      }
      setIsModalOpen(false);
      resetForm();
      fetchStories();
    } catch (error: any) {
      console.error('Error saving story:', error);
      toast.error(error.message || 'Failed to save story');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return;
    try {
      await deleteDoc(doc(db, 'stories', id));
      toast.success('Story deleted successfully');
      fetchStories();
    } catch (error) {
      console.error('Error deleting story:', error);
      toast.error('Failed to delete story');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      author: '',
      category: '',
      imageUrl: '',
      readTime: 5,
      isPremium: false,
      isActive: true
    });
    setEditingStory(null);
  };

  const filteredStories = stories.filter(story => {
    const title = story.title || '';
    const author = story.author || '';
    const category = story.category || '';
    const search = searchTerm || '';
    return title.toLowerCase().includes(search.toLowerCase()) ||
           author.toLowerCase().includes(search.toLowerCase()) ||
           category.toLowerCase().includes(search.toLowerCase());
  });

  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 text-lg font-bold">Access Denied</p>
            <p className="text-gray-500">You need admin privileges to access this page.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.stories.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin.stories.subtitle')} ({stories.length})</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('admin.stories.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPlus />
            {t('admin.stories.add')}
          </button>
        </div>
      </div>

      {filteredStories.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <p className="text-gray-500 dark:text-gray-400 text-lg">{t('admin.stories.noStories')}</p>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPlus />
            {t('admin.stories.addFirst')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map((story) => (
            <div key={story.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
              {story.imageUrl && (
                <img src={story.imageUrl} alt={story.title} className="w-full h-48 object-cover" />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white" style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
                      {story.title || 'Untitled Story'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400" style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
                      {t('admin.stories.form.author')}: {story.author || 'Unknown'}
                    </p>
                  </div>
                  {story.isPremium && (
                    <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">{t('admin.stories.form.premium')}</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2" style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
                  {story.content || 'No content'}
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                  <span>{story.category || 'Uncategorized'}</span>
                  <span>{story.readTime || 5} {t('admin.stories.form.readTime')}</span>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    story.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {story.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingStory(story);
                        setFormData({
                          title: story.title || '',
                          content: story.content || '',
                          author: story.author || '',
                          category: story.category || '',
                          imageUrl: story.imageUrl || '',
                          readTime: story.readTime || 5,
                          isPremium: story.isPremium || false,
                          isActive: story.isActive !== false
                        });
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(story.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal with RTL support */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4" style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
              {editingStory ? t('admin.stories.edit') : t('admin.stories.add')}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
                  {t('admin.stories.form.title')}
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
                    {t('admin.stories.form.author')}
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({...formData, author: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
                    {t('admin.stories.form.category')}
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
                  {t('admin.stories.form.content')}
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={5}
                  style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
                    {t('admin.stories.form.imageUrl')}
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
                    {t('admin.stories.form.readTime')}
                  </label>
                  <input
                    type="number"
                    value={formData.readTime}
                    onChange={(e) => setFormData({...formData, readTime: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="1"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isPremium}
                    onChange={(e) => setFormData({...formData, isPremium: e.target.checked})}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300" style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
                    {t('admin.stories.form.premium')}
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300" style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
                    {t('admin.stories.form.active')}
                  </span>
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingStory ? t('admin.stories.form.update') : t('admin.stories.form.create')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {t('admin.stories.form.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
