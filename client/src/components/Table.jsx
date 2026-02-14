import React from 'react';

const Table = ({ headers, children }) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white shadow-soft">
      <table className="min-w-full text-sm">
        <thead className="bg-sand text-ink">
          <tr>
            {headers.map((header) => (
              <th key={header} className="text-left px-4 py-3 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
};

export default Table;
