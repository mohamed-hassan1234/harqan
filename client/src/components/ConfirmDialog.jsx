import React from 'react';

const ConfirmDialog = ({ open, title, message, onCancel, onConfirm }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-3 sm:items-center sm:p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-soft sm:p-6">
        <h3 className="font-display text-xl">{title}</h3>
        <p className="text-sm text-slate mt-2">{message}</p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button onClick={onCancel} className="rounded-full border border-ink/10 px-4 py-2">Cancel</button>
          <button onClick={onConfirm} className="rounded-full bg-ember px-4 py-2 text-white">Confirm</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
