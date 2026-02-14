import api from './api';

export const loginRequest = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

export const registerRequest = async (userData) => {
  const { data } = await api.post('/auth/register', userData);
  return data;
};

export const meRequest = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};
