import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../layouts/DashboardLayout';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { fetchEmployees, createEmployee, updateEmployee } from '../services/employees';

const emptyForm = { fullName: '', email: '', phone: '', password: '', role: 'Tailor' };

const Employees = () => {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    try {
      const data = await fetchEmployees();
      setItems(data || []);
    } catch (err) {
      toast.error('Failed to load employees');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setForm({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || '',
      password: '',
      role: user.role,
      active: user.active
    });
    setOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateEmployee(editing._id, { ...form, password: undefined });
        toast.success('Employee updated');
      } else {
        await createEmployee(form);
        toast.success('Employee created');
      }
      setOpen(false);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed');
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-2xl">Employees</h3>
          <p className="text-sm text-slate">Manage staff accounts and roles.</p>
        </div>
        <button onClick={openCreate} className="rounded-full bg-ink text-sand px-4 py-2">Add Employee</button>
      </div>

      <Table headers={['Name', 'Email', 'Role', 'Active', 'Actions']}>
        {items.map((user) => (
          <tr key={user._id} className="border-t border-ink/10">
            <td className="px-4 py-3 font-medium">{user.fullName}</td>
            <td className="px-4 py-3">{user.email}</td>
            <td className="px-4 py-3">{user.role}</td>
            <td className="px-4 py-3">{user.active ? 'Yes' : 'No'}</td>
            <td className="px-4 py-3">
              <button
                onClick={() => openEdit(user)}
                className="text-sm px-3 py-1 rounded-full border border-ink/10"
              >
                Edit
              </button>
            </td>
          </tr>
        ))}
      </Table>

      <Modal open={open} title={editing ? 'Edit Employee' : 'Add Employee'} onClose={() => setOpen(false)}>
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
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          {!editing && (
            <input
              className="rounded-xl border border-ink/10 px-4 py-2"
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          )}
          <input
            className="rounded-xl border border-ink/10 px-4 py-2"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="rounded-xl border border-ink/10 px-4 py-2"
          >
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Tailor">Tailor</option>
            <option value="Cashier">Cashier</option>
          </select>
          {editing && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              Active
            </label>
          )}
          <button className="rounded-full bg-ink text-sand px-4 py-2" type="submit">
            Save
          </button>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default Employees;
