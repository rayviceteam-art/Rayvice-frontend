'use client';

import { ReactNode, useState } from 'react';
import { AdminProtectedRoute } from '@/components/admin/AdminProtectedRoute';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <AdminProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-[#0A0F10] text-[#F1F5F4]">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block h-full shrink-0">
          <AdminSidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
              onClick={() => setIsMobileOpen(false)}
            />
            <div className="relative z-10 flex w-64 flex-col">
              <AdminSidebar onCloseMobile={() => setIsMobileOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminProtectedRoute>
  );
}
