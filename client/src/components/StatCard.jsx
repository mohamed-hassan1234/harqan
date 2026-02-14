import React from 'react';

const StatCard = ({ label, value, accent }) => {
  return (
    <div className="bg-white rounded-2xl shadow-soft p-5 border border-ink/5">
      <div className="text-xs uppercase tracking-[0.2em] text-slate">{label}</div>
      <div className={`mt-3 text-3xl font-display ${accent || 'text-ink'}`}>{value}</div>
    </div>
  );
};

export default StatCard;
