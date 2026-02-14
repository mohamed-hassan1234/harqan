import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardLayout from '../layouts/DashboardLayout';
import Loading from '../components/Loading';
import Table from '../components/Table';
import { getOrder, updateOrderStatus } from '../services/orders';
import { addPayment } from '../services/payments';
import { useAuth } from '../hooks/useAuth';
import { PAYMENT_METHODS, STATUS_FLOW } from '../utils/constants';

const OrderDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [paymentForm, setPaymentForm] = useState({ amountPaid: '', method: PAYMENT_METHODS[0] });

  const load = async () => {
    setLoading(true);
    try {
      const data = await getOrder(id);
      setOrder(data.order);
      setPayments(data.payments || []);
      setStatus(data.order.status);
    } catch (err) {
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleStatusUpdate = async () => {
    try {
      await updateOrderStatus(id, { status, note });
      toast.success('Status updated');
      setNote('');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed');
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      await addPayment({
        orderId: id,
        amountPaid: Number(paymentForm.amountPaid),
        method: paymentForm.method
      });
      toast.success('Payment added');
      setPaymentForm({ amountPaid: '', method: PAYMENT_METHODS[0] });
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Payment failed');
    }
  };

  const printReceipt = (payment) => {
    const receiptHtml = `
      <html>
        <head>
          <title>Receipt ${payment.receiptNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; }
            h1 { font-size: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            td { padding: 8px 0; }
          </style>
        </head>
        <body>
          <h1>Dukaanka Harqaan - Receipt</h1>
          <p>Receipt: ${payment.receiptNumber}</p>
          <p>Order: ${order?.orderNumber}</p>
          <p>Customer: ${order?.customerId?.fullName}</p>
          <table>
            <tr><td>Amount Paid</td><td>${payment.amountPaid}</td></tr>
            <tr><td>Method</td><td>${payment.method}</td></tr>
            <tr><td>Date</td><td>${new Date(payment.paidAt).toLocaleDateString()}</td></tr>
          </table>
          <p style="margin-top: 40px;">Developed by Mohamed Hassan Mohamed.</p>
        </body>
      </html>
    `;

    const win = window.open('', 'receipt');
    win.document.write(receiptHtml);
    win.document.close();
    win.print();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Loading label="Loading order..." />
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout>
        <div className="text-slate">Order not found.</div>
      </DashboardLayout>
    );
  }

  const paidSum = payments.reduce((sum, p) => sum + p.amountPaid, 0);
  const remaining = Math.max(order.finalTotal - paidSum, 0);
  const canTakePayment = ['Admin', 'Manager', 'Cashier'].includes(user?.role);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h3 className="font-display text-2xl">Order {order.orderNumber}</h3>
          <p className="text-sm text-slate">Customer: {order.customerId?.fullName}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-soft">
            <div className="text-xs text-slate uppercase tracking-[0.2em]">Status</div>
            <div className="mt-2 text-xl font-display">{order.status}</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-soft">
            <div className="text-xs text-slate uppercase tracking-[0.2em]">Total</div>
            <div className="mt-2 text-xl font-display">{order.finalTotal}</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-soft">
            <div className="text-xs text-slate uppercase tracking-[0.2em]">Remaining</div>
            <div className="mt-2 text-xl font-display">{remaining}</div>
          </div>
        </div>

        {['Admin', 'Manager', 'Tailor'].includes(user?.role) && (
          <div className="bg-white rounded-2xl p-6 shadow-soft">
            <h4 className="font-display text-xl">Update Status</h4>
            <div className="mt-4 grid md:grid-cols-3 gap-4">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-xl border border-ink/10 px-4 py-2"
              >
                {STATUS_FLOW.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Progress note (optional)"
                className="rounded-xl border border-ink/10 px-4 py-2"
              />
              <button onClick={handleStatusUpdate} className="rounded-full bg-ink text-sand px-4 py-2">
                Save Status
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <h4 className="font-display text-xl">Payments</h4>
          {canTakePayment && (
            <form onSubmit={handlePayment} className="mt-4 grid md:grid-cols-3 gap-4">
              <input
                value={paymentForm.amountPaid}
                onChange={(e) => setPaymentForm({ ...paymentForm, amountPaid: e.target.value })}
                placeholder="Amount paid"
                className="rounded-xl border border-ink/10 px-4 py-2"
                required
              />
              <select
                value={paymentForm.method}
                onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                className="rounded-xl border border-ink/10 px-4 py-2"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
              <button className="rounded-full bg-ink text-sand px-4 py-2" type="submit">
                Add Payment
              </button>
            </form>
          )}

          <div className="mt-6">
            <Table headers={['Receipt', 'Amount', 'Method', 'Date', 'Actions']}>
              {payments.map((payment) => (
                <tr key={payment._id} className="border-t border-ink/10">
                  <td className="px-4 py-3 font-medium">{payment.receiptNumber}</td>
                  <td className="px-4 py-3">{payment.amountPaid}</td>
                  <td className="px-4 py-3">{payment.method}</td>
                  <td className="px-4 py-3">{new Date(payment.paidAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => printReceipt(payment)}
                      className="text-sm px-3 py-1 rounded-full border border-ink/10"
                    >
                      Print Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <h4 className="font-display text-xl">Progress Notes</h4>
          <ul className="mt-4 space-y-2 text-sm text-slate">
            {order.progressNotes?.length ? (
              order.progressNotes.map((noteItem) => (
                <li key={noteItem._id || noteItem.createdAt}>
                  {noteItem.note} - {new Date(noteItem.createdAt).toLocaleString()}
                </li>
              ))
            ) : (
              <li>No notes yet.</li>
            )}
          </ul>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <h4 className="font-display text-xl">Status Timeline</h4>
          <ul className="mt-4 space-y-2 text-sm text-slate">
            {order.statusHistory?.length ? (
              order.statusHistory.map((item, index) => (
                <li key={`${item.status}-${index}`}>
                  {item.status} - {new Date(item.at).toLocaleString()}
                  {item.note ? ` (${item.note})` : ''}
                </li>
              ))
            ) : (
              <li>No status updates yet.</li>
            )}
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OrderDetail;
