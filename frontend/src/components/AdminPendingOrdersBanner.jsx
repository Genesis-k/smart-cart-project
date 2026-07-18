 import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const AdminPendingOrdersBanner = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get('/api/orders', config);
        const count = data.filter((o) => o.isPaid && !o.isDelivered).length;
        setPendingCount(count);
      } catch (err) {
        // Fail quietly - a missing notification is not worth alarming the admin over
        console.error('Could not check pending deliveries:', err);
      }
    };

    if (userInfo?.isAdmin) {
      fetchPendingCount();
    }
    // Runs once when the admin's session starts (Header/App mounts once per login),
    // which matches "notify them when they log in".
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo?.isAdmin]);

  if (!userInfo?.isAdmin || dismissed || pendingCount === 0) {
    return null;
  }

  return (
    <div style={styles.banner}>
      <span>
        📦 You have <strong>{pendingCount}</strong> paid order{pendingCount !== 1 ? 's' : ''} waiting to be delivered.
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <Link to="/admin/orderlist" style={styles.link}>
          View Orders
        </Link>
        <button onClick={() => setDismissed(true)} style={styles.dismissBtn} aria-label="Dismiss">
          ✕
        </button>
      </div>
    </div>
  );
};

const styles = {
  banner: {
    backgroundColor: '#fff3cd',
    color: '#856404',
    padding: '12px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #ffeeba',
    fontSize: '0.95rem',
    flexWrap: 'wrap',
    gap: '10px',
  },
  link: {
    color: '#856404',
    fontWeight: 'bold',
    textDecoration: 'underline',
  },
  dismissBtn: {
    background: 'none',
    border: 'none',
    color: '#856404',
    cursor: 'pointer',
    fontSize: '1.1rem',
    padding: '0 5px',
    fontWeight: 'bold',
  },
};

export default AdminPendingOrdersBanner;