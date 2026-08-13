'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useFirebase } from '@/contexts/FirebaseContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/layout/AdminLayout';

export default function AdminStoresPage() {
  const { user, isAdmin } = useFirebase();
  const { t, dir } = useLanguage();
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: 0,
    imageUrl: '',
    isActive: true
  });

  useEffect(() => {
    if (user && isAdmin) {
      fetchStores();
    }
  }, [user, isAdmin]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'stores'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const storesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStores(storesData);
    } catch (error: any) {
      console.error('Error fetching stores:', error);
      toast.error('Failed to fetch stores');
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
        updatedAt: serverTimestamp()
      };

      if (editingStore) {
        await updateDoc(doc(db, 'stores', editingStore.id), data);
        toast.success('Store updated successfully!');
      } else {
        await addDoc(collection(db, 'stores'), {
          ...data,
          createdAt: serverTimestamp()
        });
        toast.success('Store created successfully!');
      }
      setIsModalOpen(false);
      resetForm();
      fetchStores();
    } catch (error: any) {
      console.error('Error saving store:', error);
      toast.error(error.message || 'Failed to save store');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this store?')) return;
    try {
      await deleteDoc(doc(db, 'stores', id));
      toast.success('Store deleted successfully');
      fetchStores();
    } catch (error) {
      console.error('Error deleting store:', error);
      toast.error('Failed to delete store');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      price: 0,
      imageUrl: '',
      isActive: true
    });
    setEditingStore(null);
  };

  const filteredStores = stores.filter(store => {
    const name = store.name || '';
    const category = store.category || '';
    const search = searchTerm || '';
    return name.toLowerCase().includes(search.toLowerCase()) ||
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.stores.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin.stores.subtitle')} ({stores.length})</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('admin.stores.search')}
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
            {t('admin.stores.add')}
          </button>
        </div>
      </div>

      {filteredStores.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <p className="text-gray-500 dark:text-gray-400 text-lg">{t('admin.stores.noStores')}</p>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPlus />
            {t('admin.stores.addFirst')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map((store) => (
            <div key={store.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
              {store.imageUrl && (
                <img src={store.imageUrl} alt={store.name} className="w-full h-48 object-cover" />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white" style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
                      {store.name || 'Unnamed Store'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400" style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
                      {store.category || 'Uncategorized'}
                    </p>
                  </div>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">${store.price || 0}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2" style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
                  {store.description || 'No description'}
                </p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    store.isActive !== false ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {store.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingStore(store);
                        setFormData({
                          name: store.name || '',
                          description: store.description || '',
                          category: store.category || '',
                          price: store.price || 0,
                          imageUrl: store.imageUrl || '',
                          isActive: store.isActive !== false
                        });
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(store.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
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

      {/* Modal with RTL support for Arabic */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4" style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
              {editingStore ? t('admin.stores.edit') : t('admin.stores.add')}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
                  {t('admin.stores.form.name')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
                  {t('admin.stores.form.description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
                    {t('admin.stores.form.category')}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
                    {t('admin.stores.form.price')}
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
                  {t('admin.stores.form.imageUrl')}
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300" style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
                  {t('admin.stores.form.active')}
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingStore ? t('admin.stores.form.update') : t('admin.stores.form.create')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {t('admin.stores.form.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
