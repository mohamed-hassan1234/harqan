import React from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useAuth } from '../hooks/useAuth';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-sand bg-grid">
      <div className="flex">
        <Sidebar user={user} />
        <main className="flex-1 p-6 lg:p-10">
          <Topbar user={user} onLogout={logout} />
          {children}
          <footer className="mt-10 text-xs text-slate">
            Developed by Mohamed Hassan Mohamed.
          </footer>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
