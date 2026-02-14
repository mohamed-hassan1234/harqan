import api from './api';

export const addPayment = async (payload) => {
  const { data } = await api.post('/payments', payload);
  return data;
};

export const fetchPaymentsByOrder = async (orderId) => {
  const { data } = await api.get(`/payments/order/${orderId}`);
  return data;
};

export const deletePayment = async (id) => {
  const { data } = await api.delete(`/payments/${id}`);
  return data;
};
