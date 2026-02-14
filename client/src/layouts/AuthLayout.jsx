import React from 'react';

const AuthLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-sand bg-grid p-4 sm:p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-soft sm:p-8">
        <h1 className="font-display text-2xl text-ink sm:text-3xl">Dukaanka Harqaan</h1>
        <p className="text-sm text-slate mt-2">Tailoring shop management system</p>
        <div className="mt-6">{children}</div>
        <div className="mt-8 text-xs text-slate">Developed by Mohamed Hassan Mohamed.</div>
      </div>
    </div>
  );
};

export default AuthLayout;
