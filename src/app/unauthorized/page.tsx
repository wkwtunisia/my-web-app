'use client';

import Link from 'next/link';
import { useFirebase } from '@/contexts/FirebaseContext';

export default function Unauthorized() {
  const { user } = useFirebase();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. 
          {user ? ' Your account does not have admin privileges.' : ' Please sign in with an admin account.'}
        </p>
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Homepage
          </Link>
          <Link
            href="/admin/login"
            className="block w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Try Another Account
          </Link>
        </div>
      </div>
    </div>
  );
}
