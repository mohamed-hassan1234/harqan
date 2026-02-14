import api from './api';

export const fetchEmployees = async () => {
  const { data } = await api.get('/employees');
  return data;
};

export const createEmployee = async (payload) => {
  const { data } = await api.post('/employees', payload);
  return data;
};

export const updateEmployee = async (id, payload) => {
  const { data } = await api.put(`/employees/${id}`, payload);
  return data;
};
