import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const AdminOrderListScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { userInfo } = useSelector((state) => state.auth);

  // Filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | pending-delivery | delivered | not-delivered
  const [paidFilter, setPaidFilter] = useState('all'); // all | paid | unpaid

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

  // Apply all filters
  const filteredOrders = orders.filter((order) => {
    // Date range filter
    if (order.createdAt) {
      const orderDate = order.createdAt.substring(0, 10); // YYYY-MM-DD
      if (dateFrom && orderDate < dateFrom) return false;
      if (dateTo && orderDate > dateTo) return false;
    }

    // Status filter
    if (statusFilter === 'pending-delivery') {
      // Paid but not yet delivered — needs action
      if (!(order.isPaid && !order.isDelivered)) return false;
    } else if (statusFilter === 'delivered') {
      if (!order.isDelivered) return false;
    } else if (statusFilter === 'not-delivered') {
      if (order.isDelivered) return false;
    }
    // 'all' passes everything

    // Paid/Unpaid toggle
    if (paidFilter === 'paid') {
      if (!order.isPaid) return false;
    } else if (paidFilter === 'unpaid') {
      if (order.isPaid) return false;
    }
    // 'all' passes everything

    return true;
  });

  // Sort: pending-delivery first, then newest
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const aPending = a.isPaid && !a.isDelivered;
    const bPending = b.isPaid && !b.isDelivered;
    if (aPending === bPending) return new Date(b.createdAt) - new Date(a.createdAt);
    return aPending ? -1 : 1;
  });

  const hasActiveFilters = dateFrom || dateTo || statusFilter !== 'all' || paidFilter !== 'all';

  const clearAllFilters = () => {
    setDateFrom('');
    setDateTo('');
    setStatusFilter('all');
    setPaidFilter('all');
  };

  if (loading) return <h2>Loading orders...</h2>;
  if (error) return <h2 style={{ color: 'red' }}>{error}</h2>;

  return (
    <div>
      <h1 style={{ marginBottom: '25px' }}>All Orders</h1>

      {/* Filter Row */}
      <div style={styles.filterRow}>
        <div>
          <label style={styles.filterLabel}>From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            style={styles.dateInput}
          />
        </div>
        <div>
          <label style={styles.filterLabel}>To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            style={styles.dateInput}
          />
        </div>
        <div>
          <label style={styles.filterLabel}>Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.selectInput}
          >
            <option value="all">All Statuses</option>
            <option value="pending-delivery">Paid &amp; Awaiting Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="not-delivered">Not Delivered</option>
          </select>
        </div>
        <div>
          <label style={styles.filterLabel}>Payment</label>
          <select
            value={paidFilter}
            onChange={(e) => setPaidFilter(e.target.value)}
            style={styles.selectInput}
          >
            <option value="all">All Payments</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>
        {hasActiveFilters && (
          <button onClick={clearAllFilters} style={styles.clearFilterBtn}>
            Clear All Filters
          </button>
        )}
        <span style={styles.filterCount}>
          Showing {sortedOrders.length} of {orders.length} orders
        </span>
      </div>

      {/* Orders Table */}
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

      {sortedOrders.length === 0 && (
        <p style={{ color: '#666', marginTop: '20px' }}>
          {hasActiveFilters ? 'No orders match your filters.' : 'No orders yet.'}
        </p>
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
  filterRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '20px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  filterLabel: {
    display: 'block',
    fontSize: '0.85rem',
    color: '#666',
    marginBottom: '4px',
    fontWeight: 'bold',
  },
  dateInput: {
    padding: '8px 10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '0.9rem',
  },
  selectInput: {
    padding: '8px 10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '0.9rem',
    backgroundColor: '#fff',
    cursor: 'pointer',
  },
  clearFilterBtn: {
    padding: '9px 16px',
    background: '#f8f9fa',
    border: '1px solid #ddd',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    color: '#555',
  },
  filterCount: {
    marginLeft: 'auto',
    fontSize: '0.85rem',
    color: '#888',
  },
};

export default AdminOrderListScreen;