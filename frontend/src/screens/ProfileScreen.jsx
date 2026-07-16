import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { setCredentials } from '../slices/authSlice';

const ProfileScreen = () => {
  // Account State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Shipping Address State
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');

  // UI State
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
        setName(userInfo.name || '');
        setEmail(userInfo.email || '');
        setPhone(userInfo.phone || '');
        
        if (userInfo.shippingAddress) {
            setAddress(userInfo.shippingAddress.address || '');
            setCity(userInfo.shippingAddress.city || '');
            setPostalCode(userInfo.shippingAddress.postalCode || '');
            setCountry(userInfo.shippingAddress.country || '');
        }

        const fetchOrders = async () => {
            try {
                const { data } = await axios.get('/api/orders/myorders');
                setOrders(data);
                setLoadingOrders(false);
            } catch (err) {
                console.error(err);
                setLoadingOrders(false);
            }
        };
        fetchOrders();
    }
  }, [navigate, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
    } else {
      try {
        const { data } = await axios.put('/api/users/profile', {
            name,
            email,
            phone,
            password,
            shippingAddress: { address, city, postalCode, country }
        });
        
        dispatch(setCredentials({ ...data }));
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        setMessage(null);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      }
    }
  };

  return (
    <div style={styles.pageContainer}>
      
      {/* LEFT PANEL: Update Info Card */}
      <div style={styles.leftPanel}>
        <h2 style={styles.headerText}>User Profile</h2>
        {message && <div style={styles.errorAlert}>{message}</div>}
        {error && <div style={styles.errorAlert}>{error}</div>}
        {success && <div style={styles.successAlert}>Profile Updated Successfully!</div>}
        
        <form onSubmit={submitHandler}>
          <h4 style={styles.sectionTitle}>Account Details</h4>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Name</label>
            <input type="text" placeholder="Enter name" value={name} onChange={(e) => setName(e.target.value)} style={styles.input} />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Phone Number (M-Pesa Default)</label>
            <input type="text" placeholder="e.g. 0712345678" value={phone} onChange={(e) => setPhone(e.target.value)} style={styles.input} />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>New Password</label>
            <input type="password" placeholder="Leave blank to keep current" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={styles.input} />
          </div>

          <h4 style={styles.sectionTitle}>Default Shipping Address</h4>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Street Address</label>
            <input type="text" placeholder="e.g. Mpaka Road" value={address} onChange={(e) => setAddress(e.target.value)} style={styles.input} />
          </div>
          
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ ...styles.inputGroup, flex: 1 }}>
                <label style={styles.label}>City</label>
                <input type="text" placeholder="e.g. Nairobi" value={city} onChange={(e) => setCity(e.target.value)} style={styles.input} />
            </div>
            <div style={{ ...styles.inputGroup, flex: 1 }}>
                <label style={styles.label}>Postal Code</label>
                <input type="text" placeholder="e.g. 00100" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} style={styles.input} />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>County</label>
            <input type="text" placeholder="e.g. Nairobi County" value={country} onChange={(e) => setCountry(e.target.value)} style={styles.input} />
          </div>

          <button type="submit" style={styles.updateBtn}>
            Update Profile
          </button>
        </form>
      </div>

      {/* RIGHT PANEL: Order History Card */}
      <div style={styles.rightPanel}>
        <h2 style={styles.headerText}>My Orders</h2>
        
        {loadingOrders ? (
          <h3 style={{ color: '#666' }}>Loading Orders...</h3>
        ) : orders.length === 0 ? (
            <div style={styles.emptyState}>
                You have no orders yet. Time to start shopping!
            </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeadRow}>
                  <th style={styles.th}>ORDER ID</th>
                  <th style={styles.th}>DATE</th>
                  <th style={styles.th}>TOTAL</th>
                  <th style={styles.th}>PAID</th>
                  <th style={styles.th}>DELIVERED</th>
                  <th style={styles.th}></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} style={styles.tableRow}>
                    <td style={styles.td}>{order._id.substring(0, 10)}...</td>
                    <td style={styles.td}>{order.createdAt.substring(0, 10)}</td>
                    <td style={styles.td}>KSh {order.totalPrice}</td>
                    <td style={{ ...styles.td, color: order.isPaid ? '#2ecc71' : '#e74c3c', fontWeight: 'bold' }}>
                      {order.isPaid ? order.paidAt.substring(0, 10) : 'Pending'}
                    </td>
                    <td style={{ ...styles.td, color: order.isDelivered ? '#2ecc71' : '#e74c3c', fontWeight: 'bold' }}>
                      {order.isDelivered ? order.deliveredAt.substring(0, 10) : 'Pending'}
                    </td>
                    <td style={styles.td}>
                      <Link to={`/order/${order._id}`}>
                          <button style={styles.detailsBtn}>View Details</button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    display: 'flex',
    gap: '30px',
    maxWidth: '1400px', // Maximizes width on large screens
    margin: '0 auto',
    padding: '30px 20px',
    alignItems: 'flex-start', // Prevents panels from stretching to identical heights if one is short
    flexWrap: 'wrap', // Ensures it stacks cleanly on mobile
  },
  leftPanel: {
    flex: '1 1 400px', // Will take up space but not stretch overly wide
    backgroundColor: '#ffffff',
    padding: '35px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
  },
  rightPanel: {
    flex: '2 1 600px', // Gives the table 2x the space of the form
    backgroundColor: '#ffffff',
    padding: '35px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
  },
  headerText: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '25px',
    borderBottom: '2px solid #f4f4f4',
    paddingBottom: '10px',
  },
  sectionTitle: {
    marginTop: '25px',
    marginBottom: '15px',
    fontSize: '1.1rem',
    color: '#34495e',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: '18px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#555',
  },
  input: {
    width: '100%',
    padding: '12px 15px',
    border: '1px solid #dce1e6',
    borderRadius: '6px',
    fontSize: '1rem',
    color: '#333',
    backgroundColor: '#fbfcfd',
    outline: 'none',
    boxSizing: 'border-box',
  },
  updateBtn: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1.05rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '20px',
    transition: 'background 0.2s',
  },
  errorAlert: {
    padding: '12px',
    backgroundColor: '#fdecea',
    color: '#e74c3c',
    borderRadius: '6px',
    marginBottom: '20px',
    fontWeight: '500',
  },
  successAlert: {
    padding: '12px',
    backgroundColor: '#e8f8f5',
    color: '#2ecc71',
    borderRadius: '6px',
    marginBottom: '20px',
    fontWeight: '500',
  },
  emptyState: {
    padding: '30px',
    backgroundColor: '#f8f9fa',
    color: '#6c757d',
    borderRadius: '8px',
    textAlign: 'center',
    fontSize: '1.1rem',
  },
  tableContainer: {
    overflowX: 'auto', // Adds scroll on mobile for the table
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeadRow: {
    backgroundColor: '#f8f9fa',
    color: '#495057',
  },
  th: {
    padding: '15px 12px',
    textAlign: 'left',
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '2px solid #dee2e6',
  },
  tableRow: {
    borderBottom: '1px solid #edf2f7',
    transition: 'background 0.2s',
  },
  td: {
    padding: '16px 12px',
    fontSize: '0.95rem',
    color: '#333',
  },
  detailsBtn: {
    padding: '8px 16px',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer',
    transition: 'all 0.2s',
  }
};

export default ProfileScreen;