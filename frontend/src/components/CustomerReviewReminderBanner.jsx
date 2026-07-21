import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const CustomerReviewReminderBanner = () => {
  const [reviewableItems, setReviewableItems] = useState([]);
  const [showAll, setShowAll] = useState(false);
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

    if (userInfo && !userInfo.isAdmin) {
      fetchReviewableItems();
    }
  }, [userInfo?._id, userInfo?.isAdmin]);

  if (!userInfo || userInfo.isAdmin || dismissed || reviewableItems.length === 0) {
    return null;
  }

  const firstItem = reviewableItems[0];

  return (
    <div style={styles.banner}>
      <div style={styles.content}>
        <span style={styles.message}>
          🌟 You have <strong>{reviewableItems.length}</strong> item{reviewableItems.length !== 1 ? 's' : ''} waiting for your review
        </span>

        <div style={styles.actions}>
          <Link to={`/product/${firstItem.productId}?review=1`} style={styles.reviewBtn}>
            Review "{firstItem.name}"
          </Link>

          {reviewableItems.length > 1 && (
            <button onClick={() => setShowAll(!showAll)} style={styles.toggleBtn}>
              {showAll ? 'Hide list ▲' : `See all ${reviewableItems.length} items ▼`}
            </button>
          )}
        </div>

        <button onClick={() => setDismissed(true)} style={styles.dismissBtn} aria-label="Dismiss">
          ✕
        </button>
      </div>

      {/* Expandable full list */}
      {showAll && reviewableItems.length > 1 && (
        <div style={styles.listContainer}>
          {reviewableItems.map((item) => (
            <Link
              key={item.productId}
              to={`/product/${item.productId}?review=1`}
              style={styles.listItem}
            >
              <img
                src={item.image}
                alt={item.name}
                style={styles.listItemImage}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <span style={styles.listItemName}>{item.name}</span>
              <span style={styles.listItemArrow}>→</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  banner: {
    backgroundColor: '#f3e8fd',
    color: '#5b2c8c',
    borderBottom: '1px solid #e2cffa',
    fontSize: '0.95rem',
  },
  content: {
    padding: '12px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px',
  },
  message: {
    fontWeight: '500',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  reviewBtn: {
    color: '#fff',
    backgroundColor: '#5b2c8c',
    padding: '6px 16px',
    borderRadius: '20px',
    fontWeight: 'bold',
    textDecoration: 'none',
    fontSize: '0.85rem',
    transition: 'background-color 0.2s',
  },
  toggleBtn: {
    background: 'none',
    border: '1px solid #5b2c8c',
    color: '#5b2c8c',
    padding: '5px 12px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 'bold',
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
  listContainer: {
    padding: '0 30px 12px 30px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    maxHeight: '200px',
    overflowY: 'auto',
    borderTop: '1px solid #e2cffa',
    paddingTop: '10px',
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 12px',
    textDecoration: 'none',
    color: '#5b2c8c',
    borderRadius: '8px',
    transition: 'background-color 0.15s',
    backgroundColor: '#faf5ff',
  },
  listItemImage: {
    width: '36px',
    height: '36px',
    borderRadius: '6px',
    objectFit: 'cover',
    flexShrink: 0,
  },
  listItemName: {
    flex: 1,
    fontWeight: '500',
    fontSize: '0.9rem',
  },
  listItemArrow: {
    color: '#a98cc4',
    fontSize: '0.9rem',
  },
};

export default CustomerReviewReminderBanner;