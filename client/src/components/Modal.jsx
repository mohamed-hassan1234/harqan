import React from 'react';

const Modal = ({ open, title, onClose, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div className="bg-white rounded-2xl shadow-soft w-full max-w-2xl">
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
          <h3 className="font-display text-xl">{title}</h3>
          <button onClick={onClose} className="text-slate hover:text-ink">Close</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
