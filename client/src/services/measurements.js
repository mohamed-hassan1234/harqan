import api from './api';

export const createMeasurement = async (payload) => {
  const { data } = await api.post('/measurements', payload);
  return data;
};

export const fetchMeasurementsByCustomer = async (customerId) => {
  const { data } = await api.get(`/measurements/customer/${customerId}`);
  return data;
};

export const updateMeasurement = async (id, payload) => {
  const { data } = await api.put(`/measurements/${id}`, payload);
  return data;
};
