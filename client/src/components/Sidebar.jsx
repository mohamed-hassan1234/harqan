import React from 'react';
import { NavLink } from 'react-router-dom';
import { ROLES } from '../utils/constants';

const navItems = [
  { to: '/', label: 'Dashboard', roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.TAILOR, ROLES.CASHIER] },
  { to: '/customers', label: 'Customers', roles: [ROLES.ADMIN, ROLES.MANAGER] },
  { to: '/measurements', label: 'Measurements', roles: [ROLES.ADMIN, ROLES.MANAGER] },
  { to: '/orders', label: 'Orders', roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.TAILOR, ROLES.CASHIER] },
  { to: '/employees', label: 'Employees', roles: [ROLES.ADMIN] },
  { to: '/reports', label: 'Reports', roles: [ROLES.ADMIN, ROLES.MANAGER] }
];

const Sidebar = ({ user, mobileOpen, onClose }) => {
  const filteredItems = navItems.filter((item) => item.roles.includes(user?.role));

  const navLinks = (
    <nav className="space-y-2">
      {filteredItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onClose}
          className={({ isActive }) =>
            `block rounded-xl px-4 py-2 text-sm transition ${
              isActive ? 'bg-sand text-ink' : 'text-sand/80 hover:bg-sand/10'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <>
      <aside className="hidden w-64 bg-ink px-6 py-8 text-sand lg:flex lg:min-h-screen lg:flex-col">
        <div className="mb-10">
          <h1 className="font-display text-2xl">Dukaanka Harqaan</h1>
          <p className="text-sm text-sand/70">Tailoring Shop System</p>
        </div>
        {navLinks}
        <div className="mt-10 text-xs text-sand/60">Developed by Mohamed Hassan Mohamed.</div>
      </aside>

      <div
        className={`fixed inset-0 z-40 bg-ink/50 transition lg:hidden ${
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-ink px-5 py-6 text-sand shadow-soft transition-transform duration-200 lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-8 flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl">Dukaanka Harqaan</h1>
            <p className="text-sm text-sand/70">Tailoring Shop System</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-sand/20 px-3 py-1 text-xs hover:bg-sand/10"
          >
            Close
          </button>
        </div>
        {navLinks}
        <div className="mt-8 text-xs text-sand/60">Developed by Mohamed Hassan Mohamed.</div>
      </aside>
    </>
  );
};

export default Sidebar;
