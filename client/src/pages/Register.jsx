import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from '../layouts/AuthLayout';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'Cashier' // Default role
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-ink">Create Account</h2>
        <p className="text-sm text-slate">Join Dukaanka Harqaan today</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate">Full Name</label>
          <input
            name="fullName"
            type="text"
            value={form.fullName}
            onChange={handleChange}
            placeholder="John Doe"
            className="mt-1 w-full rounded-xl border border-ink/10 px-4 py-2 focus:ring-2 focus:ring-ink focus:border-transparent outline-none transition-all"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="mt-1 w-full rounded-xl border border-ink/10 px-4 py-2 focus:ring-2 focus:ring-ink focus:border-transparent outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate">Phone</label>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="061xxxxxxx"
              className="mt-1 w-full rounded-xl border border-ink/10 px-4 py-2 focus:ring-2 focus:ring-ink focus:border-transparent outline-none transition-all"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate">Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="mt-1 w-full rounded-xl border border-ink/10 px-4 py-2 focus:ring-2 focus:ring-ink focus:border-transparent outline-none transition-all"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate">Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl border border-ink/10 px-4 py-2 focus:ring-2 focus:ring-ink focus:border-transparent outline-none transition-all bg-white"
            required
          >
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Tailor">Tailor</option>
            <option value="Cashier">Cashier</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-ink text-sand py-3 font-semibold hover:bg-ink/90 transition-colors shadow-lg shadow-ink/20 flex items-center justify-center space-x-2 disabled:opacity-70"
        >
          {loading ? (
            <div className="h-5 w-5 border-2 border-sand/30 border-t-sand rounded-full animate-spin" />
          ) : (
            'Register'
          )}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-ink/5 text-center">
        <p className="text-sm text-slate">
          Already have an account?{' '}
          <Link to="/login" className="text-ink font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Register;
