import React from 'react';

const Table = ({ headers, children }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-[640px] w-full text-sm">
          <thead className="bg-sand text-ink">
            <tr>
              {headers.map((header) => (
                <th key={header} className="whitespace-nowrap px-4 py-3 text-left font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
