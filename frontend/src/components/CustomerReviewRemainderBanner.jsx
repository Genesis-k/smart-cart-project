import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const CustomerReviewReminderBanner = () => {
  const [reviewableItems, setReviewableItems] = useState([]);
  const [dismissed, setDismissed] = useState(false);

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchReviewableItems = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get('/api/orders/reviewable-items', config);
        setReviewableItems(data);
      } catch (err) {
        console.error('Could not check reviewable items:', err);
      }
    };

    // Only for logged-in, non-admin customers
    if (userInfo && !userInfo.isAdmin) {
      fetchReviewableItems();
    }
    // Runs once when the customer's session starts (on login/app load).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo?._id, userInfo?.isAdmin]);

  if (!userInfo || userInfo.isAdmin || dismissed || reviewableItems.length === 0) {
    return null;
  }

  const firstItem = reviewableItems[0];
  const extraCount = reviewableItems.length - 1;

  return (
    <div style={styles.banner}>
      <span>
        🌟 How was your <strong>{firstItem.name}</strong>?
        {extraCount > 0 && ` (+${extraCount} more item${extraCount !== 1 ? 's' : ''} to review)`}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <Link to={`/product/${firstItem.productId}?review=1`} style={styles.link}>
          Write a Review
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
    backgroundColor: '#f3e8fd',
    color: '#5b2c8c',
    padding: '12px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e2cffa',
    fontSize: '0.95rem',
    flexWrap: 'wrap',
    gap: '10px',
  },
  link: {
    color: '#5b2c8c',
    fontWeight: 'bold',
    textDecoration: 'underline',
  },
  dismissBtn: {
    background: 'none',
    border: 'none',
    color: '#5b2c8c',
    cursor: 'pointer',
    fontSize: '1.1rem',
    padding: '0 5px',
    fontWeight: 'bold',
  },
};

export default CustomerReviewReminderBanner;