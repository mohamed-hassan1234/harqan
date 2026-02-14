import api from './api';

export const fetchDailyReport = async (params) => {
  const { data } = await api.get('/reports/daily', { params });
  return data;
};

export const fetchMonthlyReport = async (params) => {
  const { data } = await api.get('/reports/monthly', { params });
  return data;
};

export const fetchEmployeeReport = async (params) => {
  const { data } = await api.get('/reports/employees', { params });
  return data;
};
