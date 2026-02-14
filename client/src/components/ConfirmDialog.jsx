import React from 'react';

const ConfirmDialog = ({ open, title, message, onCancel, onConfirm }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div className="bg-white rounded-2xl shadow-soft w-full max-w-md p-6">
        <h3 className="font-display text-xl">{title}</h3>
        <p className="text-sm text-slate mt-2">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded-full border border-ink/10">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-full bg-ember text-white">Confirm</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
