import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const AdminLowStockBanner = () => {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [dismissed, setDismissed] = useState(false);

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchLowStock = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get('/api/products/low-stock', config);
        setLowStockProducts(data);
      } catch (err) {
        console.error('Could not check low-stock products:', err);
      }
    };

    if (userInfo?.isAdmin) {
      fetchLowStock();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo?.isAdmin]);

  if (!userInfo?.isAdmin || dismissed || lowStockProducts.length === 0) {
    return null;
  }

  const outOfStock = lowStockProducts.filter((p) => p.countInStock === 0);
  const runningLow = lowStockProducts.filter((p) => p.countInStock > 0);

  const firstProduct = lowStockProducts[0];
  const extraCount = lowStockProducts.length - 1;

  return (
    <div style={styles.banner}>
      <span>
        ⚠️ <strong>{firstProduct.name}</strong>
        {' '}
        {firstProduct.countInStock === 0 ? 'is out of stock' : `has only ${firstProduct.countInStock} left`}
        {extraCount > 0 && ` (+${extraCount} more product${extraCount !== 1 ? 's' : ''} need restocking)`}
        {outOfStock.length > 0 && lowStockProducts.length > 1 && (
          <span style={{ marginLeft: '8px', color: '#a94442' }}>
            &middot; {outOfStock.length} completely out of stock
          </span>
        )}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <Link to={`/admin/product/${firstProduct._id}/edit`} style={styles.link}>
          Restock Now
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
    backgroundColor: '#fde8e8',
    color: '#8a2e2e',
    padding: '12px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #f6c9c9',
    fontSize: '0.95rem',
    flexWrap: 'wrap',
    gap: '10px',
  },
  link: {
    color: '#8a2e2e',
    fontWeight: 'bold',
    textDecoration: 'underline',
  },
  dismissBtn: {
    background: 'none',
    border: 'none',
    color: '#8a2e2e',
    cursor: 'pointer',
    fontSize: '1.1rem',
    padding: '0 5px',
    fontWeight: 'bold',
  },
};

export default AdminLowStockBanner;