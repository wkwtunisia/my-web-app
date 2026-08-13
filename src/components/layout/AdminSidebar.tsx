'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FaHome, 
  FaUsers, 
  FaStore, 
  FaQuestionCircle, 
  FaBook, 
  FaCreditCard,
  FaCog
} from 'react-icons/fa';

const menuItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: FaHome },
  { name: 'Users', path: '/admin/users', icon: FaUsers },
  { name: 'Stores', path: '/admin/stores', icon: FaStore },
  { name: 'Quizzes', path: '/admin/quizzes', icon: FaQuestionCircle },
  { name: 'Stories', path: '/admin/stories', icon: FaBook },
  { name: 'Subscriptions', path: '/admin/subscriptions', icon: FaCreditCard },
  { name: 'Settings', path: '/admin/settings', icon: FaCog },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 min-h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
        <p className="text-sm text-gray-400 mt-1">Manage your content</p>
      </div>
      
      <nav className="p-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 mb-1
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
              {isActive && (
                <span className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>
      
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
        >
          <FaHome className="w-5 h-5" />
          <span>Back to Site</span>
        </Link>
      </div>
    </aside>
  );
}
