import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../layouts/DashboardLayout';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import { fetchCustomers } from '../services/customers';
import { createMeasurement, fetchMeasurementsByCustomer, updateMeasurement } from '../services/measurements';

const emptyForm = {
  customerId: '',
  garmentType: '',
  shoulder: '',
  sleeve: '',
  length: '',
  chest: '',
  waist: '',
  hip: '',
  leg: '',
  isDefault: false
};

const Measurements = () => {
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected] = useState('');
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const data = await fetchCustomers({ limit: 100 });
        setCustomers(data.items || []);
      } catch (err) {
        toast.error('Failed to load customers');
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

  useEffect(() => {
    const loadMeasurements = async () => {
      if (!selected) return;
      try {
        const data = await fetchMeasurementsByCustomer(selected);
        setItems(data || []);
      } catch (err) {
        toast.error('Failed to load measurements');
      }
    };

    loadMeasurements();
  }, [selected]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, customerId: selected });
    setOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      customerId: item.customerId,
      garmentType: item.garmentType,
      shoulder: item.shoulder || '',
      sleeve: item.sleeve || '',
      length: item.length || '',
      chest: item.chest || '',
      waist: item.waist || '',
      hip: item.hip || '',
      leg: item.leg || '',
      isDefault: item.isDefault
    });
    setOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateMeasurement(editing._id, form);
        toast.success('Measurement version created');
      } else {
        await createMeasurement(form);
        toast.success('Measurement created');
      }
      setOpen(false);
      const data = await fetchMeasurementsByCustomer(selected);
      setItems(data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed');
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-2xl">Measurements</h3>
          <p className="text-sm text-slate">Store measurement history per customer.</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-full bg-ink text-sand px-4 py-2"
          disabled={!selected}
        >
          Add Measurement
        </button>
      </div>

      {loading ? (
        <Loading label="Loading customers..." />
      ) : (
        <div className="mb-4">
          <label className="text-sm text-slate">Select customer</label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="mt-2 w-full rounded-xl border border-ink/10 px-4 py-2"
          >
            <option value="">Choose customer</option>
            {customers.map((customer) => (
              <option key={customer._id} value={customer._id}>
                {customer.fullName} - {customer.phone}
              </option>
            ))}
          </select>
        </div>
      )}

      {selected && (
        <Table headers={['Garment', 'Shoulder', 'Sleeve', 'Length', 'Default', 'Actions']}>
          {items.map((item) => (
            <tr key={item._id} className="border-t border-ink/10">
              <td className="px-4 py-3 font-medium">{item.garmentType}</td>
              <td className="px-4 py-3">{item.shoulder || '-'}</td>
              <td className="px-4 py-3">{item.sleeve || '-'}</td>
              <td className="px-4 py-3">{item.length || '-'}</td>
              <td className="px-4 py-3">{item.isDefault ? 'Yes' : 'No'}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => openEdit(item)}
                  className="text-sm px-3 py-1 rounded-full border border-ink/10"
                >
                  New Version
                </button>
              </td>
            </tr>
          ))}
        </Table>
      )}

      <Modal open={open} title={editing ? 'New Measurement Version' : 'Add Measurement'} onClose={() => setOpen(false)}>
        <form onSubmit={handleSave} className="grid gap-4">
          <input
            className="rounded-xl border border-ink/10 px-4 py-2"
            placeholder="Garment type"
            value={form.garmentType}
            onChange={(e) => setForm({ ...form, garmentType: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <input className="rounded-xl border border-ink/10 px-4 py-2" placeholder="Shoulder" value={form.shoulder} onChange={(e) => setForm({ ...form, shoulder: e.target.value })} />
            <input className="rounded-xl border border-ink/10 px-4 py-2" placeholder="Sleeve" value={form.sleeve} onChange={(e) => setForm({ ...form, sleeve: e.target.value })} />
            <input className="rounded-xl border border-ink/10 px-4 py-2" placeholder="Length" value={form.length} onChange={(e) => setForm({ ...form, length: e.target.value })} />
            <input className="rounded-xl border border-ink/10 px-4 py-2" placeholder="Chest" value={form.chest} onChange={(e) => setForm({ ...form, chest: e.target.value })} />
            <input className="rounded-xl border border-ink/10 px-4 py-2" placeholder="Waist" value={form.waist} onChange={(e) => setForm({ ...form, waist: e.target.value })} />
            <input className="rounded-xl border border-ink/10 px-4 py-2" placeholder="Hip" value={form.hip} onChange={(e) => setForm({ ...form, hip: e.target.value })} />
            <input className="rounded-xl border border-ink/10 px-4 py-2" placeholder="Leg" value={form.leg} onChange={(e) => setForm({ ...form, leg: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
            Set as default for this garment type
          </label>
          <button className="rounded-full bg-ink text-sand px-4 py-2" type="submit">
            Save
          </button>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default Measurements;
