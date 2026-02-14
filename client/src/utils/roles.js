export const canAccess = (user, roles = []) => {
  if (!user) return false;
  if (roles.length === 0) return true;
  return roles.includes(user.role);
};

export const isAdminOrManager = (user) => {
  return user?.role === 'Admin' || user?.role === 'Manager';
};
