import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardLayout from '../layouts/DashboardLayout';
import Table from '../components/Table';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Loading from '../components/Loading';
import { fetchCustomers, createCustomer, updateCustomer, deleteCustomer } from '../services/customers';
import { useDebounce } from '../hooks/useDebounce';

const emptyForm = { fullName: '', phone: '', address: '', notes: '' };

const Customers = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const debounced = useDebounce(search, 400);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchCustomers({ search: debounced });
      setItems(data.items || []);
    } catch (err) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [debounced]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (customer) => {
    setEditing(customer);
    setForm({
      fullName: customer.fullName,
      phone: customer.phone,
      address: customer.address || '',
      notes: customer.notes || ''
    });
    setOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateCustomer(editing._id, form);
        toast.success('Customer updated');
      } else {
        await createCustomer(form);
        toast.success('Customer created');
      }
      setOpen(false);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCustomer(confirm._id, confirm.force);
      toast.success('Customer deleted');
      setConfirm(null);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-xl sm:text-2xl">Customers</h3>
          <p className="text-sm text-slate">Manage customer profiles and contact details.</p>
        </div>
        <button onClick={openCreate} className="w-full rounded-full bg-ink px-4 py-2 text-sand sm:w-auto">
          Add Customer
        </button>
      </div>

      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone..."
          className="w-full rounded-xl border border-ink/10 px-4 py-2"
        />
      </div>

      {loading ? (
        <Loading label="Loading customers..." />
      ) : (
        <Table headers={['Name', 'Phone', 'Address', 'Actions']}>
          {items.map((customer) => (
            <tr key={customer._id} className="border-t border-ink/10">
              <td className="px-4 py-3 font-medium">
                <Link to={`/customers/${customer._id}`} className="text-ember">
                  {customer.fullName}
                </Link>
              </td>
              <td className="px-4 py-3">{customer.phone}</td>
              <td className="px-4 py-3">{customer.address || '-'}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => openEdit(customer)}
                  className="text-sm px-3 py-1 rounded-full border border-ink/10"
                >
                  Edit
                </button>
                <button
                  onClick={() => setConfirm({ ...customer, force: false })}
                  className="text-sm px-3 py-1 rounded-full border border-ember text-ember"
                >
                  Delete
                </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}

      <Modal open={open} title={editing ? 'Edit Customer' : 'Add Customer'} onClose={() => setOpen(false)}>
        <form onSubmit={handleSave} className="grid gap-4">
          <input
            className="rounded-xl border border-ink/10 px-4 py-2"
            placeholder="Full name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            required
          />
          <input
            className="rounded-xl border border-ink/10 px-4 py-2"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
          <input
            className="rounded-xl border border-ink/10 px-4 py-2"
            placeholder="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <textarea
            className="rounded-xl border border-ink/10 px-4 py-2"
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <button className="w-full rounded-full bg-ink px-4 py-2 text-sand sm:w-auto" type="submit">
            Save
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        title="Delete customer?"
        message="This will soft-delete the customer. If there are active orders, admin must confirm with force=true."
        onCancel={() => setConfirm(null)}
        onConfirm={handleDelete}
      />
    </DashboardLayout>
  );
};

export default Customers;
