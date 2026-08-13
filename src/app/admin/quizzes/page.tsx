'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useFirebase } from '@/contexts/FirebaseContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/layout/AdminLayout';

export default function AdminQuizzesPage() {
  const { user, isAdmin } = useFirebase();
  const { t, dir } = useLanguage();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'medium',
    timeLimit: 10,
    passingScore: 70,
    questions: [{ id: '1', question: '', options: ['', '', '', ''], correctAnswer: 0, points: 10 }],
    isActive: true
  });

  useEffect(() => {
    if (user && isAdmin) {
      fetchQuizzes();
    }
  }, [user, isAdmin]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'quizzes'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const quizzesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuizzes(quizzesData);
    } catch (error: any) {
      console.error('Error fetching quizzes:', error);
      toast.error('Failed to fetch quizzes');
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

      if (editingQuiz) {
        await updateDoc(doc(db, 'quizzes', editingQuiz.id), data);
        toast.success('Quiz updated successfully!');
      } else {
        await addDoc(collection(db, 'quizzes'), {
          ...data,
          createdAt: serverTimestamp()
        });
        toast.success('Quiz created successfully!');
      }
      setIsModalOpen(false);
      resetForm();
      fetchQuizzes();
    } catch (error: any) {
      console.error('Error saving quiz:', error);
      toast.error(error.message || 'Failed to save quiz');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    try {
      await deleteDoc(doc(db, 'quizzes', id));
      toast.success('Quiz deleted successfully');
      fetchQuizzes();
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast.error('Failed to delete quiz');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      difficulty: 'medium',
      timeLimit: 10,
      passingScore: 70,
      questions: [{ id: '1', question: '', options: ['', '', '', ''], correctAnswer: 0, points: 10 }],
      isActive: true
    });
    setEditingQuiz(null);
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        { id: String(formData.questions.length + 1), question: '', options: ['', '', '', ''], correctAnswer: 0, points: 10 }
      ]
    });
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setFormData({ ...formData, questions: newQuestions });
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...formData.questions];
    newQuestions[qIndex].options[oIndex] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const removeQuestion = (index: number) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: newQuestions });
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const title = quiz.title || '';
    const category = quiz.category || '';
    const search = searchTerm || '';
    return title.toLowerCase().includes(search.toLowerCase()) ||
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.quizzes.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin.quizzes.subtitle')} ({quizzes.length})</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('admin.quizzes.search')}
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
            {t('admin.quizzes.add')}
          </button>
        </div>
      </div>

      {filteredQuizzes.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <p className="text-gray-500 dark:text-gray-400 text-lg">{t('admin.quizzes.noQuizzes')}</p>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPlus />
            {t('admin.quizzes.addFirst')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white" style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
                    {quiz.title || 'Untitled Quiz'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400" style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
                    {quiz.category || 'Uncategorized'}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  quiz.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                  quiz.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {quiz.difficulty || 'medium'}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2" style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
                {quiz.description || 'No description'}
              </p>
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
                <span>{quiz.questions?.length || 0} {t('admin.quizzes.form.questions')}</span>
                <span>{quiz.timeLimit || 10} {t('admin.quizzes.form.timeLimit')}</span>
                <span>{t('admin.quizzes.form.passingScore')}: {quiz.passingScore || 70}%</span>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  quiz.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {quiz.isActive !== false ? 'Active' : 'Inactive'}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingQuiz(quiz);
                      setFormData({
                        title: quiz.title || '',
                        description: quiz.description || '',
                        category: quiz.category || '',
                        difficulty: quiz.difficulty || 'medium',
                        timeLimit: quiz.timeLimit || 10,
                        passingScore: quiz.passingScore || 70,
                        questions: quiz.questions || [{ id: '1', question: '', options: ['', '', '', ''], correctAnswer: 0, points: 10 }],
                        isActive: quiz.isActive !== false
                      });
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(quiz.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal with RTL support */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4" style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
              {editingQuiz ? t('admin.quizzes.edit') : t('admin.quizzes.add')}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
                    {t('admin.quizzes.form.title')}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
                    {t('admin.quizzes.form.category')}
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
                  {t('admin.quizzes.form.description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={2}
                  style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.quizzes.form.difficulty')}</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="easy">{t('admin.quizzes.form.easy')}</option>
                    <option value="medium">{t('admin.quizzes.form.medium')}</option>
                    <option value="hard">{t('admin.quizzes.form.hard')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.quizzes.form.timeLimit')}</label>
                  <input
                    type="number"
                    value={formData.timeLimit}
                    onChange={(e) => setFormData({...formData, timeLimit: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.quizzes.form.passingScore')}</label>
                  <input
                    type="number"
                    value={formData.passingScore}
                    onChange={(e) => setFormData({...formData, passingScore: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
                    {t('admin.quizzes.form.questions')}
                  </label>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {t('admin.quizzes.form.addQuestion')}
                  </button>
                </div>
                {formData.questions.map((q: any, qIndex: number) => (
                  <div key={qIndex} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-gray-700 dark:text-gray-300" style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
                        {t('admin.quizzes.form.question')} {qIndex + 1}
                      </h4>
                      {formData.questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(qIndex)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          {t('admin.quizzes.form.remove')}
                        </button>
                      )}
                    </div>
                    <div className="space-y-2 mt-2">
                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                        placeholder={t('admin.quizzes.form.question')}
                        className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        {q.options.map((option: string, oIndex: number) => (
                          <div key={oIndex} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                              placeholder={`${t('admin.quizzes.form.option')} ${oIndex + 1}`}
                              className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                              style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}
                            />
                            <label className="text-xs text-gray-500 dark:text-gray-400">{t('admin.quizzes.form.correct')}</label>
                            <input
                              type="radio"
                              checked={q.correctAnswer === oIndex}
                              onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                              className="w-4 h-4 text-blue-600"
                            />
                          </div>
                        ))}
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 dark:text-gray-400">{t('admin.quizzes.form.points')}: </label>
                        <input
                          type="number"
                          value={q.points}
                          onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value))}
                          className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                          min="1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300" style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
                  {t('admin.quizzes.form.active')}
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingQuiz ? t('admin.quizzes.form.update') : t('admin.quizzes.form.create')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {t('admin.quizzes.form.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
