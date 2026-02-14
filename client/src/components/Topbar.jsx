import React from 'react';

const Topbar = ({ user, onLogout }) => {
  return (
    <header className="flex items-center justify-between mb-6">
      <div>
        <h2 className="font-display text-3xl text-ink">Welcome back</h2>
        <p className="text-sm text-slate">Manage tailoring operations with confidence.</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-sm font-semibold">{user?.fullName}</div>
          <div className="text-xs text-slate">{user?.role}</div>
        </div>
        <button
          onClick={onLogout}
          className="rounded-full border border-ink/10 px-4 py-2 text-sm hover:bg-ink hover:text-sand transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;
