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

const Sidebar = ({ user }) => {
  return (
    <aside className="bg-ink text-sand w-64 min-h-screen px-6 py-8 hidden lg:block">
      <div className="mb-10">
        <h1 className="font-display text-2xl">Dukaanka Harqaan</h1>
        <p className="text-sm text-sand/70">Tailoring Shop System</p>
      </div>
      <nav className="space-y-2">
        {navItems
          .filter((item) => item.roles.includes(user?.role))
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
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
      <div className="mt-10 text-xs text-sand/60">
        Developed by Mohamed Hassan Mohamed.
      </div>
    </aside>
  );
};

export default Sidebar;
