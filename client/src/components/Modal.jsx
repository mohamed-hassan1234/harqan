import React from 'react';

const Modal = ({ open, title, onClose, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-2 sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-soft sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-ink/10 px-4 py-4 sm:px-6">
          <h3 className="font-display text-xl">{title}</h3>
          <button onClick={onClose} className="text-slate hover:text-ink">Close</button>
        </div>
        <div className="max-h-[calc(92vh-78px)] overflow-y-auto p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
