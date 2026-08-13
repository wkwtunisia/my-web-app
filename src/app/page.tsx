'use client';

import { useFirebase } from '@/contexts/FirebaseContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import Link from 'next/link';
import Header from '@/components/Header';
import { FaRocket, FaShieldAlt, FaUsers, FaBook, FaQuestionCircle, FaStore } from 'react-icons/fa';

export default function Home() {
  const { user } = useFirebase();
  const { t, dir } = useLanguage();
  const { color } = useTheme();

  const features = [
    {
      icon: <FaStore className="w-8 h-8" />,
      title: t('stores.title'),
      description: "Découvrez notre sélection de produits et services de qualité",
      link: "/stores",
      color: "text-blue-600 dark:text-blue-400"
    },
    {
      icon: <FaQuestionCircle className="w-8 h-8" />,
      title: t('quizzes.title'),
      description: "Testez vos connaissances avec nos quiz interactifs",
      link: "/quizzes",
      color: "text-purple-600 dark:text-purple-400"
    },
    {
      icon: <FaBook className="w-8 h-8" />,
      title: t('stories.title'),
      description: "Lisez des histoires captivantes et inspirantes",
      link: "/stories",
      color: "text-orange-600 dark:text-orange-400"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <div className="inline-block p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
              <FaRocket className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6" style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
              {t('app.title')}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto" style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
              {user ? `👋 ${t('auth.welcome')}, ${user.displayName || user.email}` : 'Bienvenue sur notre plateforme interactive !'}
            </p>
            
            {!user && (
              <div className="flex flex-wrap gap-4 justify-center">
                <a
                  href="/"
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {t('nav.signIn')}
                </a>
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12" style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
            {dir === 'rtl' ? 'ما نقدمه' : 'Ce que nous proposons'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all p-8 text-center border border-gray-100 dark:border-gray-700">
                <div className={`${feature.color} mb-4 flex justify-center`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3" style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6" style={{ direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
                  {feature.description}
                </p>
                <Link
                  href={feature.link}
                  className="inline-block px-6 py-2 border-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white dark:hover:bg-blue-400 dark:hover:text-gray-900 transition-colors font-medium"
                >
                  {t('common.viewAll')} →
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center border border-gray-100 dark:border-gray-700">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400" style={{ color: color }}>+100</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('stores.title')}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center border border-gray-100 dark:border-gray-700">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400" style={{ color: color }}>+50</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('quizzes.title')}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center border border-gray-100 dark:border-gray-700">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400" style={{ color: color }}>+30</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('stories.title')}</div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">
              {dir === 'rtl' ? 'انضم إلينا اليوم' : 'Rejoignez-nous aujourd\'hui'}
            </h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              {dir === 'rtl' 
                ? 'استكشف المتاجر والاختبارات والقصص المميزة' 
                : 'Explorez nos magasins, quiz et histoires exceptionnels'}
            </p>
            <Link
              href={user ? "/dashboard" : "/"}
              className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg hover:shadow-xl transition-all font-medium"
            >
              {user ? t('nav.dashboard') : t('nav.signIn')}
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-8 mt-12">
          <p>Built with ❤️ using Next.js, Firebase, and Cloudflare</p>
          <p className="mt-1">© 2024 MyApp. Tous droits réservés.</p>
        </footer>
      </div>
    </div>
  );
}
