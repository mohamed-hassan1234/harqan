import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardLayout from '../layouts/DashboardLayout';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import { fetchOrders, createOrder } from '../services/orders';
import { fetchCustomers } from '../services/customers';
import { fetchMeasurementsByCustomer } from '../services/measurements';
import { fetchEmployees } from '../services/employees';
import { STATUS_FLOW } from '../utils/constants';
import { useAuth } from '../hooks/useAuth';

const emptyForm = {
  customerId: '',
  garmentType: '',
  measurementId: '',
  measurementSnapshot: {
    shoulder: '',
    sleeve: '',
    length: '',
    chest: '',
    waist: '',
    hip: '',
    leg: ''
  },
  deliveryDate: '',
  priceTotal: '',
  discount: '',
  assignedTo: ''
};

const Orders = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState({ status: '', paymentStatus: '', dateFrom: '', dateTo: '' });
  const [form, setForm] = useState(emptyForm);
  const [customers, setCustomers] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [employees, setEmployees] = useState([]);
  const { user } = useAuth();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchOrders(filters);
      setItems(data.items || []);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [filters]);

  useEffect(() => {
    const loadFormData = async () => {
      if (!['Admin', 'Manager'].includes(user?.role)) return;
      try {
        const [customersData, employeesData] = await Promise.all([
          fetchCustomers({ limit: 200 }),
          fetchEmployees()
        ]);
        setCustomers(customersData.items || []);
        setEmployees(employeesData || []);
      } catch (err) {
        toast.error('Failed to load form data');
      }
    };

    loadFormData();
  }, [user?.role]);

  const handleCustomerChange = async (customerId) => {
    setForm({ ...form, customerId, measurementId: '', measurementSnapshot: emptyForm.measurementSnapshot });
    if (!customerId) return;
    try {
      const data = await fetchMeasurementsByCustomer(customerId);
      setMeasurements(data || []);
    } catch (err) {
      toast.error('Failed to load measurements');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const hasSnapshotValues = Object.values(form.measurementSnapshot).some((value) => value !== '');
      await createOrder({
        ...form,
        measurementSnapshot: form.measurementId || !hasSnapshotValues ? undefined : form.measurementSnapshot,
        priceTotal: Number(form.priceTotal || 0),
        discount: Number(form.discount || 0)
      });
      toast.success('Order created');
      setOpen(false);
      setForm(emptyForm);
      loadOrders();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Create failed');
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-2xl">Orders</h3>
          <p className="text-sm text-slate">Track orders, status, and assignments.</p>
        </div>
        {['Admin', 'Manager'].includes(user?.role) && (
          <button onClick={() => setOpen(true)} className="rounded-full bg-ink text-sand px-4 py-2">New Order</button>
        )}
      </div>

      <div className="grid md:grid-cols-4 gap-3 mb-4">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="rounded-xl border border-ink/10 px-3 py-2"
        >
          <option value="">All Status</option>
          {STATUS_FLOW.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <select
          value={filters.paymentStatus}
          onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
          className="rounded-xl border border-ink/10 px-3 py-2"
        >
          <option value="">All Payment</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Partial">Partial</option>
          <option value="Paid">Paid</option>
        </select>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
          className="rounded-xl border border-ink/10 px-3 py-2"
        />
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
          className="rounded-xl border border-ink/10 px-3 py-2"
        />
      </div>

      {loading ? (
        <Loading label="Loading orders..." />
      ) : (
        <Table headers={['Order', 'Customer', 'Status', 'Delivery', 'Assigned', 'Total']}>
          {items.map((order) => (
            <tr key={order._id} className="border-t border-ink/10">
              <td className="px-4 py-3 font-medium">
                <Link to={`/orders/${order._id}`} className="text-ember">
                  {order.orderNumber}
                </Link>
              </td>
              <td className="px-4 py-3">{order.customerId?.fullName}</td>
              <td className="px-4 py-3">{order.status}</td>
              <td className="px-4 py-3">{new Date(order.deliveryDate).toLocaleDateString()}</td>
              <td className="px-4 py-3">{order.assignedTo?.fullName || '-'}</td>
              <td className="px-4 py-3">{order.finalTotal}</td>
            </tr>
          ))}
        </Table>
      )}

      <Modal open={open} title="Create Order" onClose={() => setOpen(false)}>
        <form onSubmit={handleCreate} className="grid gap-4">
          <select
            value={form.customerId}
            onChange={(e) => handleCustomerChange(e.target.value)}
            className="rounded-xl border border-ink/10 px-4 py-2"
            required
          >
            <option value="">Select customer</option>
            {customers.map((c) => (
              <option key={c._id} value={c._id}>{c.fullName} - {c.phone}</option>
            ))}
          </select>
          <input
            className="rounded-xl border border-ink/10 px-4 py-2"
            placeholder="Garment type"
            value={form.garmentType}
            onChange={(e) => setForm({ ...form, garmentType: e.target.value })}
            required
          />
          <select
            value={form.measurementId}
            onChange={(e) => setForm({ ...form, measurementId: e.target.value })}
            className="rounded-xl border border-ink/10 px-4 py-2"
          >
            <option value="">Select measurement set</option>
            {measurements.map((m) => (
              <option key={m._id} value={m._id}>{m.garmentType} {m.isDefault ? '(Default)' : ''}</option>
            ))}
          </select>
          {!form.measurementId && (
            <div className="grid grid-cols-2 gap-3">
              <input
                className="rounded-xl border border-ink/10 px-4 py-2"
                placeholder="Shoulder"
                value={form.measurementSnapshot.shoulder}
                onChange={(e) => setForm({ ...form, measurementSnapshot: { ...form.measurementSnapshot, shoulder: e.target.value } })}
              />
              <input
                className="rounded-xl border border-ink/10 px-4 py-2"
                placeholder="Sleeve"
                value={form.measurementSnapshot.sleeve}
                onChange={(e) => setForm({ ...form, measurementSnapshot: { ...form.measurementSnapshot, sleeve: e.target.value } })}
              />
              <input
                className="rounded-xl border border-ink/10 px-4 py-2"
                placeholder="Length"
                value={form.measurementSnapshot.length}
                onChange={(e) => setForm({ ...form, measurementSnapshot: { ...form.measurementSnapshot, length: e.target.value } })}
              />
              <input
                className="rounded-xl border border-ink/10 px-4 py-2"
                placeholder="Chest"
                value={form.measurementSnapshot.chest}
                onChange={(e) => setForm({ ...form, measurementSnapshot: { ...form.measurementSnapshot, chest: e.target.value } })}
              />
              <input
                className="rounded-xl border border-ink/10 px-4 py-2"
                placeholder="Waist"
                value={form.measurementSnapshot.waist}
                onChange={(e) => setForm({ ...form, measurementSnapshot: { ...form.measurementSnapshot, waist: e.target.value } })}
              />
              <input
                className="rounded-xl border border-ink/10 px-4 py-2"
                placeholder="Hip"
                value={form.measurementSnapshot.hip}
                onChange={(e) => setForm({ ...form, measurementSnapshot: { ...form.measurementSnapshot, hip: e.target.value } })}
              />
              <input
                className="rounded-xl border border-ink/10 px-4 py-2"
                placeholder="Leg"
                value={form.measurementSnapshot.leg}
                onChange={(e) => setForm({ ...form, measurementSnapshot: { ...form.measurementSnapshot, leg: e.target.value } })}
              />
            </div>
          )}
          <input
            type="date"
            className="rounded-xl border border-ink/10 px-4 py-2"
            value={form.deliveryDate}
            onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              className="rounded-xl border border-ink/10 px-4 py-2"
              placeholder="Price total"
              value={form.priceTotal}
              onChange={(e) => setForm({ ...form, priceTotal: e.target.value })}
              required
            />
            <input
              className="rounded-xl border border-ink/10 px-4 py-2"
              placeholder="Discount"
              value={form.discount}
              onChange={(e) => setForm({ ...form, discount: e.target.value })}
            />
          </div>
          <select
            value={form.assignedTo}
            onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
            className="rounded-xl border border-ink/10 px-4 py-2"
          >
            <option value="">Assign tailor (optional)</option>
            {employees
              .filter((emp) => emp.role === 'Tailor')
              .map((emp) => (
                <option key={emp._id} value={emp._id}>{emp.fullName}</option>
              ))}
          </select>
          <button className="rounded-full bg-ink text-sand px-4 py-2" type="submit">
            Create Order
          </button>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default Orders;
