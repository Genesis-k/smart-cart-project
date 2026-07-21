import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const AdminNotificationBanner = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [showLowStockList, setShowLowStockList] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  const { userInfo } = useSelector((state) => state.auth);

  const fetchAllNotifications = useCallback(async () => {
    if (!userInfo?.isAdmin) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

      const [ordersRes, reviewsRes, lowStockRes] = await Promise.all([
        axios.get('/api/orders', config),
        axios.get('/api/products/reviews/all', config),
        axios.get('/api/products/low-stock', config),
      ]);

      // Pending orders: paid but not delivered
      const pending = ordersRes.data.filter((o) => o.isPaid && !o.isDelivered);
      setPendingOrders(pending);

      // Pending reviews: submitted but not approved
      const unapproved = reviewsRes.data.filter((r) => r.review && !r.review.isApproved);
      setPendingReviews(unapproved);

      // Low stock products
      setLowStockProducts(lowStockRes.data);

      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch admin notifications:', err);
      setLoading(false);
    }
  }, [userInfo]);

  useEffect(() => {
    if (userInfo?.isAdmin) {
      fetchAllNotifications();
      // Auto-refresh every 60 seconds so stock changes are reflected
      const interval = setInterval(fetchAllNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [userInfo, fetchAllNotifications]);

  if (!userInfo?.isAdmin || dismissed || loading) return null;

  const hasAnyNotifications =
    pendingOrders.length > 0 ||
    pendingReviews.length > 0 ||
    lowStockProducts.length > 0;

  if (!hasAnyNotifications) return null;

  const outOfStock = lowStockProducts.filter((p) => p.countInStock === 0).length;

  return (
    <div style={styles.wrapper}>
      <div style={styles.banner}>
        {/* Header */}
        <div style={styles.headerRow}>
          <span style={styles.headerIcon}>🔔</span>
          <span style={styles.headerText}>Admin Alerts</span>
          <button onClick={() => setDismissed(true)} style={styles.dismissBtn} aria-label="Dismiss">
            ✕
          </button>
        </div>

        {/* Notification Items */}
        <div style={styles.itemsRow}>
          {/* Pending Orders */}
          {pendingOrders.length > 0 && (
            <Link to="/admin/orderlist?filter=pending-delivery" style={styles.itemLink}>
              <div style={styles.item}>
                <span style={styles.itemIcon}>📦</span>
                <span style={styles.itemText}>
                  <strong>{pendingOrders.length}</strong> order{pendingOrders.length !== 1 ? 's' : ''} awaiting delivery
                </span>
              </div>
            </Link>
          )}

          {/* Pending Reviews */}
          {pendingReviews.length > 0 && (
            <Link to="/admin/reviews" style={styles.itemLink}>
              <div style={styles.item}>
                <span style={styles.itemIcon}>⭐</span>
                <span style={styles.itemText}>
                  <strong>{pendingReviews.length}</strong> review{pendingReviews.length !== 1 ? 's' : ''} pending approval
                </span>
              </div>
            </Link>
          )}

          {/* Low Stock */}
          {lowStockProducts.length > 0 && (
            <div style={styles.lowStockContainer}>
              <div
                style={{ ...styles.item, ...styles.lowStockToggle }}
                onClick={() => setShowLowStockList(!showLowStockList)}
              >
                <span style={styles.itemIcon}>⚠️</span>
                <span style={styles.itemText}>
                  <strong>{lowStockProducts.length}</strong> product{lowStockProducts.length !== 1 ? 's' : ''} low on stock
                  {outOfStock > 0 && (
                    <span style={styles.outOfStockBadge}>{outOfStock} out</span>
                  )}
                </span>
                <span style={styles.arrow}>{showLowStockList ? '▲' : '▼'}</span>
              </div>

              {/* Expandable List */}
              {showLowStockList && (
                <div style={styles.lowStockList}>
                  {lowStockProducts.map((product) => (
                    <Link
                      key={product._id}
                      to={`/admin/product/${product._id}/edit`}
                      style={styles.lowStockListItem}
                    >
                      <span style={styles.lowStockName}>{product.name}</span>
                      <span style={{
                        ...styles.lowStockCount,
                        color: product.countInStock === 0 ? '#c0392b' : '#e67e22',
                      }}>
                        {product.countInStock === 0 ? 'Out of stock' : `${product.countInStock} left`}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Refresh button */}
        <div style={styles.refreshRow}>
          <button onClick={fetchAllNotifications} style={styles.refreshBtn}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Inline CSS with keyframes for pulsing glow */}
      <style>{`
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 4px rgba(231, 76, 60, 0.3); }
          50% { box-shadow: 0 0 14px rgba(231, 76, 60, 0.6), 0 0 20px rgba(231, 76, 60, 0.2); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  wrapper: {
    animation: 'pulseGlow 2.5s ease-in-out infinite',
    borderBottom: '2px solid #e74c3c',
  },
  banner: {
    backgroundColor: '#fff5f5',
    padding: '12px 30px',
    borderBottom: '1px solid #fadbd8',
    fontFamily: 'inherit',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
    paddingBottom: '8px',
    borderBottom: '1px solid #fadbd8',
  },
  headerIcon: { fontSize: '1.1rem' },
  headerText: {
    fontWeight: 'bold',
    fontSize: '0.9rem',
    color: '#922b21',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    flex: 1,
  },
  dismissBtn: {
    background: 'none',
    border: 'none',
    color: '#922b21',
    cursor: 'pointer',
    fontSize: '1.2rem',
    padding: '0 5px',
    fontWeight: 'bold',
  },
  itemsRow: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  itemLink: {
    textDecoration: 'none',
    color: 'inherit',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #f0c4bf',
    fontSize: '0.9rem',
    transition: 'background-color 0.2s',
    cursor: 'pointer',
  },
  itemIcon: { fontSize: '1rem' },
  itemText: { color: '#555' },
  lowStockContainer: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: '220px',
  },
  lowStockToggle: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
  },
  arrow: {
    fontSize: '0.7rem',
    color: '#999',
    marginLeft: '8px',
  },
  outOfStockBadge: {
    marginLeft: '8px',
    padding: '1px 6px',
    backgroundColor: '#e74c3c',
    color: '#fff',
    borderRadius: '10px',
    fontSize: '0.7rem',
    fontWeight: 'bold',
  },
  lowStockList: {
    marginTop: '6px',
    backgroundColor: '#fff',
    border: '1px solid #f0c4bf',
    borderRadius: '8px',
    maxHeight: '250px',
    overflowY: 'auto',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    zIndex: 10,
  },
  lowStockListItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 14px',
    textDecoration: 'none',
    color: '#333',
    borderBottom: '1px solid #fef0ee',
    fontSize: '0.85rem',
    transition: 'background-color 0.15s',
  },
  lowStockName: { flex: 1 },
  lowStockCount: {
    fontWeight: 'bold',
    marginLeft: '12px',
    whiteSpace: 'nowrap',
  },
  refreshRow: {
    marginTop: '8px',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  refreshBtn: {
    background: 'none',
    border: '1px solid #f0c4bf',
    borderRadius: '5px',
    padding: '4px 12px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    color: '#922b21',
  },
};

export default AdminNotificationBanner;