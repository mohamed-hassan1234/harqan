import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useAuth } from '../hooks/useAuth';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-sand bg-grid">
      <div className="flex min-h-screen">
        <Sidebar
          user={user}
          mobileOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10">
          <Topbar
            user={user}
            onLogout={logout}
            onOpenSidebar={() => setMobileSidebarOpen(true)}
          />
          {children}
          <footer className="mt-10 text-center text-xs text-slate sm:text-left">
            Developed by Mohamed Hassan Mohamed.
          </footer>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
