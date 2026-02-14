import React, { useState } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../layouts/DashboardLayout';
import { fetchDailyReport, fetchMonthlyReport, fetchEmployeeReport } from '../services/reports';

const Reports = () => {
  const [dailyDate, setDailyDate] = useState('');
  const [dailyData, setDailyData] = useState(null);
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [monthlyData, setMonthlyData] = useState(null);
  const [employeeRange, setEmployeeRange] = useState({ from: '', to: '' });
  const [employeeData, setEmployeeData] = useState([]);

  const loadDaily = async () => {
    try {
      const data = await fetchDailyReport({ date: dailyDate });
      setDailyData(data);
    } catch (err) {
      toast.error('Failed to load daily report');
    }
  };

  const loadMonthly = async () => {
    try {
      const data = await fetchMonthlyReport({ month, year });
      setMonthlyData(data);
    } catch (err) {
      toast.error('Failed to load monthly report');
    }
  };

  const loadEmployees = async () => {
    try {
      const data = await fetchEmployeeReport(employeeRange);
      setEmployeeData(data.results || []);
    } catch (err) {
      toast.error('Failed to load employee report');
    }
  };

  const exportCSV = () => {
    const headers = ['Employee', 'Role', 'Completed Orders', 'Average Completion (ms)'];
    const rows = employeeData.map((row) => [
      row.fullName,
      row.role,
      row.completedOrders,
      row.averageCompletionMs
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'employee-report.csv';
    link.click();
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="bg-white rounded-2xl p-6 shadow-soft">
          <h3 className="font-display text-2xl">Daily Report</h3>
          <div className="mt-4 flex flex-col md:flex-row gap-4">
            <input
              type="date"
              value={dailyDate}
              onChange={(e) => setDailyDate(e.target.value)}
              className="rounded-xl border border-ink/10 px-4 py-2"
            />
            <button onClick={loadDaily} className="rounded-full bg-ink text-sand px-4 py-2">Load</button>
          </div>
          {dailyData && (
            <div className="mt-4 grid md:grid-cols-4 gap-4">
              <div>Total Orders: {dailyData.totalOrders}</div>
              <div>Total Final: {dailyData.totalFinal}</div>
              <div>Total Paid: {dailyData.totalPaid}</div>
              <div>Remaining: {dailyData.remaining}</div>
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-soft">
          <h3 className="font-display text-2xl">Monthly Report</h3>
          <div className="mt-4 grid md:grid-cols-3 gap-4">
            <input
              type="number"
              placeholder="Month (1-12)"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="rounded-xl border border-ink/10 px-4 py-2"
            />
            <input
              type="number"
              placeholder="Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="rounded-xl border border-ink/10 px-4 py-2"
            />
            <button onClick={loadMonthly} className="rounded-full bg-ink text-sand px-4 py-2">Load</button>
          </div>
          {monthlyData && (
            <div className="mt-4 grid md:grid-cols-4 gap-4">
              <div>Total Orders: {monthlyData.totalOrders}</div>
              <div>Total Final: {monthlyData.totalFinal}</div>
              <div>Total Paid: {monthlyData.totalPaid}</div>
              <div>Remaining: {monthlyData.remaining}</div>
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-soft">
          <h3 className="font-display text-2xl">Employee Performance</h3>
          <div className="mt-4 grid md:grid-cols-3 gap-4">
            <input
              type="date"
              value={employeeRange.from}
              onChange={(e) => setEmployeeRange({ ...employeeRange, from: e.target.value })}
              className="rounded-xl border border-ink/10 px-4 py-2"
            />
            <input
              type="date"
              value={employeeRange.to}
              onChange={(e) => setEmployeeRange({ ...employeeRange, to: e.target.value })}
              className="rounded-xl border border-ink/10 px-4 py-2"
            />
            <button onClick={loadEmployees} className="rounded-full bg-ink text-sand px-4 py-2">Load</button>
          </div>
          {employeeData.length > 0 && (
            <div className="mt-4">
              <button onClick={exportCSV} className="rounded-full border border-ink/10 px-4 py-2">Export CSV</button>
              <div className="mt-4 space-y-2 text-sm">
                {employeeData.map((row) => (
                  <div key={row.userId} className="flex justify-between">
                    <span>{row.fullName} ({row.role})</span>
                    <span>{row.completedOrders} orders, avg {row.averageCompletionMs} ms</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
