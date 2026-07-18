import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const AdminOrderListScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { userInfo } = useSelector((state) => state.auth);

  const fetchOrders = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get('/api/orders', config);
      setOrders(data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <h2>Loading orders...</h2>;
  if (error) return <h2 style={{ color: 'red' }}>{error}</h2>;

  // Show orders needing action first: paid but not yet delivered
  const sortedOrders = [...orders].sort((a, b) => {
    const aPending = a.isPaid && !a.isDelivered;
    const bPending = b.isPaid && !b.isDelivered;
    if (aPending === bPending) return new Date(b.createdAt) - new Date(a.createdAt);
    return aPending ? -1 : 1;
  });

  return (
    <div>
      <h1 style={{ marginBottom: '25px' }}>All Orders</h1>

      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Order ID</th>
              <th style={styles.th}>Customer</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Total</th>
              <th style={styles.th}>Delivery Location</th>
              <th style={styles.th}>Paid</th>
              <th style={styles.th}>Delivered</th>
              <th style={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.map((order) => {
              const needsAction = order.isPaid && !order.isDelivered;
              return (
                <tr
                  key={order._id}
                  style={needsAction ? styles.needsActionRow : styles.row}
                >
                  <td style={styles.td}>{order._id}</td>
                  <td style={styles.td}>{order.user?.name || 'Unknown'}</td>
                  <td style={styles.td}>{order.createdAt?.substring(0, 10)}</td>
                  <td style={styles.td}>KSh {order.totalPrice}</td>
                  <td style={styles.td}>
                    {order.shippingAddress
                      ? `${order.shippingAddress.address}, ${order.shippingAddress.city}`
                      : 'N/A'}
                  </td>
                  <td style={styles.td}>
                    {order.isPaid ? (
                      <span style={styles.badgeSuccess}>Paid</span>
                    ) : (
                      <span style={styles.badgeDanger}>Not Paid</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    {order.isDelivered ? (
                      <span style={styles.badgeSuccess}>Delivered</span>
                    ) : (
                      <span style={styles.badgeDanger}>Not Delivered</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    <Link to={`/order/${order._id}`} style={styles.viewBtn}>
                      {needsAction ? 'Deliver' : 'View'}
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {orders.length === 0 && (
        <p style={{ color: '#666', marginTop: '20px' }}>No orders yet.</p>
      )}
    </div>
  );
};

const styles = {
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '700px' },
  th: {
    textAlign: 'left',
    padding: '12px',
    borderBottom: '2px solid #eee',
    fontSize: '0.9rem',
    color: '#666',
  },
  td: { padding: '12px', borderBottom: '1px solid #f0f0f0', fontSize: '0.95rem' },
  row: {},
  needsActionRow: { backgroundColor: '#fff9e6' },
  badgeSuccess: {
    padding: '4px 10px',
    background: '#d4edda',
    color: '#155724',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
  },
  badgeDanger: {
    padding: '4px 10px',
    background: '#f8d7da',
    color: '#721c24',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
  },
  viewBtn: {
    padding: '6px 14px',
    background: '#000',
    color: '#fff',
    borderRadius: '5px',
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: 'bold',
  },
};

export default AdminOrderListScreen;