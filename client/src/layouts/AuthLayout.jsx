import React from 'react';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-sand bg-grid flex items-center justify-center p-6">
      <div className="bg-white shadow-soft rounded-3xl p-8 max-w-md w-full">
        <h1 className="font-display text-3xl text-ink">Dukaanka Harqaan</h1>
        <p className="text-sm text-slate mt-2">Tailoring shop management system</p>
        <div className="mt-6">{children}</div>
        <div className="mt-8 text-xs text-slate">Developed by Mohamed Hassan Mohamed.</div>
      </div>
    </div>
  );
};

export default AuthLayout;
