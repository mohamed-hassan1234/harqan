import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardLayout from '../layouts/DashboardLayout';
import Loading from '../components/Loading';
import Table from '../components/Table';
import { getCustomer } from '../services/customers';
import { fetchMeasurementsByCustomer } from '../services/measurements';
import { fetchOrders } from '../services/orders';
import { fetchPaymentsByOrder } from '../services/payments';

const tabs = ['Measurements', 'Orders', 'Payments'];

const CustomerDetail = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [tab, setTab] = useState(tabs[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const customerData = await getCustomer(id);
        const measurementsData = await fetchMeasurementsByCustomer(id);
        const orderData = await fetchOrders({ customerId: id, limit: 100 });
        const paymentLists = await Promise.all(
          (orderData.items || []).map((order) => fetchPaymentsByOrder(order._id))
        );
        setCustomer(customerData);
        setMeasurements(measurementsData);
        setOrders(orderData.items || []);
        setPayments(paymentLists.flat());
      } catch (err) {
        toast.error('Failed to load customer profile');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  return (
    <DashboardLayout>
      {loading ? (
        <Loading label="Loading profile..." />
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="font-display text-2xl">{customer?.fullName}</h3>
            <p className="text-sm text-slate">{customer?.phone}</p>
          </div>

          <div className="flex gap-3">
            {tabs.map((item) => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={`px-4 py-2 rounded-full text-sm ${
                  tab === item ? 'bg-ink text-sand' : 'border border-ink/10'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {tab === 'Measurements' && (
            <Table headers={['Garment', 'Shoulder', 'Sleeve', 'Length', 'Default']}>
              {measurements.map((m) => (
                <tr key={m._id} className="border-t border-ink/10">
                  <td className="px-4 py-3 font-medium">{m.garmentType}</td>
                  <td className="px-4 py-3">{m.shoulder || '-'}</td>
                  <td className="px-4 py-3">{m.sleeve || '-'}</td>
                  <td className="px-4 py-3">{m.length || '-'}</td>
                  <td className="px-4 py-3">{m.isDefault ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </Table>
          )}

          {tab === 'Orders' && (
            <Table headers={['Order', 'Status', 'Delivery', 'Total']}>
              {orders.map((order) => (
                <tr key={order._id} className="border-t border-ink/10">
                  <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                  <td className="px-4 py-3">{order.status}</td>
                  <td className="px-4 py-3">{new Date(order.deliveryDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{order.finalTotal}</td>
                </tr>
              ))}
            </Table>
          )}

          {tab === 'Payments' && (
            <Table headers={['Receipt', 'Amount', 'Method', 'Date']}>
              {payments.map((payment) => (
                <tr key={payment._id} className="border-t border-ink/10">
                  <td className="px-4 py-3 font-medium">{payment.receiptNumber}</td>
                  <td className="px-4 py-3">{payment.amountPaid}</td>
                  <td className="px-4 py-3">{payment.method}</td>
                  <td className="px-4 py-3">{new Date(payment.paidAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </Table>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default CustomerDetail;
