import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import DashboardLayout from '../layouts/DashboardLayout';
import StatCard from '../components/StatCard';
import Loading from '../components/Loading';
import { fetchOrders } from '../services/orders';
import { fetchDailyReport } from '../services/reports';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const today = dayjs().format('YYYY-MM-DD');
        const canViewReports = ['Admin', 'Manager'].includes(user?.role);
        const [ordersData, daily] = await Promise.all([
          fetchOrders({ dateFrom: today, dateTo: today, limit: 200 }),
          canViewReports ? fetchDailyReport({ date: today }) : Promise.resolve({ totalPaid: 0, remaining: 0 })
        ]);

        const counts = ordersData.items.reduce(
          (acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
          },
          {}
        );

        setStats({
          totalOrders: ordersData.items.length,
          pending: counts.Pending || 0,
          inProgress: counts.InProgress || 0,
          ready: counts.Ready || 0,
          delivered: counts.Delivered || 0,
          totalPaid: daily.totalPaid,
          remaining: daily.remaining
        });
      } catch (err) {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.role]);

  return (
    <DashboardLayout>
      {loading && <Loading label="Loading dashboard..." />}
      {!loading && stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:gap-6 xl:grid-cols-4">
          <StatCard label="Total Orders Today" value={stats.totalOrders} />
          <StatCard label="Pending" value={stats.pending} accent="text-ember" />
          <StatCard label="In Progress" value={stats.inProgress} accent="text-moss" />
          <StatCard label="Ready" value={stats.ready} accent="text-slate" />
          <StatCard label="Delivered" value={stats.delivered} accent="text-ink" />
          <StatCard label="Total Income Today" value={`$${stats.totalPaid}`} />
          <StatCard label="Outstanding Balance" value={`$${stats.remaining}`} />
        </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
