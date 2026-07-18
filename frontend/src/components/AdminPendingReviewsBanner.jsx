import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const AdminPendingReviewsBanner = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchPendingReviews = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get('/api/products/reviews/all', config);
        // Each item looks like { _id, name, review: { isApproved, ... } }
        const count = data.filter((item) => !item.review.isApproved).length;
        setPendingCount(count);
      } catch (err) {
        // Fail quietly - a missing notification is not worth alarming the admin over
        console.error('Could not check pending reviews:', err);
      }
    };

    if (userInfo?.isAdmin) {
      fetchPendingReviews();
    }
    // Runs once when the admin's session starts, matching "notify them when they log in".
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo?.isAdmin]);

  if (!userInfo?.isAdmin || dismissed || pendingCount === 0) {
    return null;
  }

  return (
    <div style={styles.banner}>
      <span>
        ⭐ You have <strong>{pendingCount}</strong> customer review{pendingCount !== 1 ? 's' : ''} awaiting approval.
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <Link to="/admin/reviews" style={styles.link}>
          View Reviews
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
    backgroundColor: '#e8f4fd',
    color: '#0c5480',
    padding: '12px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #cfe8fb',
    fontSize: '0.95rem',
    flexWrap: 'wrap',
    gap: '10px',
  },
  link: {
    color: '#0c5480',
    fontWeight: 'bold',
    textDecoration: 'underline',
  },
  dismissBtn: {
    background: 'none',
    border: 'none',
    color: '#0c5480',
    cursor: 'pointer',
    fontSize: '1.1rem',
    padding: '0 5px',
    fontWeight: 'bold',
  },
};

export default AdminPendingReviewsBanner;