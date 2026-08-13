'use client';

import { ReactNode } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { FirebaseProvider } from '@/contexts/FirebaseContext';

export default function AdminRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <FirebaseProvider>
          <AdminLayout>{children}</AdminLayout>
        </FirebaseProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
