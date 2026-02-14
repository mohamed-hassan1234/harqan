import React from 'react';

const Loading = ({ label = 'Loading...' }) => {
  return (
    <div className="flex items-center justify-center py-10 text-slate">
      <div className="animate-pulse">{label}</div>
    </div>
  );
};

export default Loading;
