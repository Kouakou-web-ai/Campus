import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuthStore } from '../store/authStore';
import { useRealtimeDataStore } from '../store/realtimeDataStore';

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuthStore();
  const { subscribeToUniversity, subscribeToSuperAdmin } = useRealtimeDataStore();

  useEffect(() => {
    if (!user) return;
    if (user.role === 'SUPER_ADMIN') {
      const unsub = subscribeToSuperAdmin();
      return () => unsub();
    } else if (user.universityId) {
      const unsub = subscribeToUniversity(user.universityId);
      return () => unsub();
    }
  }, [user, subscribeToUniversity, subscribeToSuperAdmin]);

  return (
    <div className="flex h-screen overflow-hidden bg-app transition-colors duration-200">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — desktop */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar collapsed={collapsed} />
      </div>

      {/* Sidebar — mobile drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-40 lg:hidden transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          onToggleSidebar={() => {
            if (window.innerWidth >= 1024) {
              setCollapsed(c => !c);
            } else {
              setMobileOpen(o => !o);
            }
          }}
          sidebarCollapsed={collapsed}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-screen-2xl mx-auto p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
