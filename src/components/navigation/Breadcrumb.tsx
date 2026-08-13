'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FaHome } from 'react-icons/fa';

export default function Breadcrumb() {
  const pathname = usePathname();
  const paths = pathname?.split('/').filter(Boolean) || [];

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600 mb-4">
      <Link href="/" className="hover:text-blue-600">
        <FaHome className="w-4 h-4" />
      </Link>
      {paths.map((path, index) => {
        const href = '/' + paths.slice(0, index + 1).join('/');
        const isLast = index === paths.length - 1;
        const label = path.charAt(0).toUpperCase() + path.slice(1);
        
        return (
          <span key={path} className="flex items-center gap-2">
            <span className="text-gray-300">/</span>
            {isLast ? (
              <span className="font-medium text-gray-900">{label}</span>
            ) : (
              <Link href={href} className="hover:text-blue-600">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
