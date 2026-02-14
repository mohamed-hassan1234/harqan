import React from 'react';

const Topbar = ({ user, onLogout, onOpenSidebar }) => {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-2">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate lg:hidden"
        >
          Menu
        </button>
        <h2 className="font-display text-2xl text-ink sm:text-3xl">Welcome back</h2>
        <p className="text-sm text-slate">Manage tailoring operations with confidence.</p>
      </div>
      <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
        <div className="min-w-0 text-right">
          <div className="truncate text-sm font-semibold">{user?.fullName}</div>
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
