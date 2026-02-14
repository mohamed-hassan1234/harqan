export const formatCurrency = (value) => {
  const number = Number(value) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  }).format(number);
};

export const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
};
