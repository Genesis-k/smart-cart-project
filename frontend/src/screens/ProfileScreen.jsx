import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { setCredentials } from '../slices/authSlice';

const ProfileScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null); // Passwords match error
  const [error, setError] = useState(null);     // Update/Fetch error
  const [success, setSuccess] = useState(false); // Update success message
  
  const [orders, setOrders] = useState([]); // Order history
  const [loadingOrders, setLoadingOrders] = useState(true);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
        // 1. Fill the form with current user info
        setName(userInfo.name);
        setEmail(userInfo.email);

        // 2. Fetch Order History
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
        // 3. Update Profile via Backend
        const { data } = await axios.put('/api/users/profile', {
            name,
            email,
            password
        });
        
        dispatch(setCredentials({ ...data })); // Update Redux
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000); // Hide success msg after 3s
        setMessage(null);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      }
    }
  };

  return (
    <div className="row">
      {/* LEFT COLUMN: Update Info */}
      <div className="col" style={{ flex: '1', paddingRight: '20px' }}>
        <h2>User Profile</h2>
        {message && <h4 style={{ color: 'red' }}>{message}</h4>}
        {error && <h4 style={{ color: 'red' }}>{error}</h4>}
        {success && <h4 style={{ color: 'green' }}>Profile Updated!</h4>}
        
        <form onSubmit={submitHandler}>
          <div style={{ marginBottom: '15px' }}>
            <label>Name</label>
            <input
              type="text"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '10px', marginTop: '5px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '10px', marginTop: '5px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '10px', marginTop: '5px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ width: '100%', padding: '10px', marginTop: '5px' }}
            />
          </div>

          <button 
              type="submit" 
              className="btn-black"
              style={{ padding: '10px 20px', background: 'black', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            Update
          </button>
        </form>
      </div>

      {/* RIGHT COLUMN: Order History */}
      <div className="col" style={{ flex: '2' }}>
        <h2>My Orders</h2>
        {loadingOrders ? (
          <h3>Loading Orders...</h3>
        ) : orders.length === 0 ? (
            <div style={{ padding: '20px', background: '#f8d7da', color: '#721c24' }}>
                You have no orders yet.
            </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ background: '#eee', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>ID</th>
                <th style={{ padding: '10px' }}>DATE</th>
                <th style={{ padding: '10px' }}>TOTAL</th>
                <th style={{ padding: '10px' }}>PAID</th>
                <th style={{ padding: '10px' }}>DELIVERED</th>
                <th style={{ padding: '10px' }}></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '10px' }}>{order._id.substring(0, 10)}...</td>
                  <td style={{ padding: '10px' }}>{order.createdAt.substring(0, 10)}</td>
                  <td style={{ padding: '10px' }}>KSh {order.totalPrice}</td>
                  <td style={{ padding: '10px', color: order.isPaid ? 'green' : 'red' }}>
                    {order.isPaid ? order.paidAt.substring(0, 10) : 'X'}
                  </td>
                  <td style={{ padding: '10px', color: order.isDelivered ? 'green' : 'red' }}>
                    {order.isDelivered ? order.deliveredAt.substring(0, 10) : 'X'}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <Link to={`/order/${order._id}`}>
                        <button style={{ cursor: 'pointer' }}>Details</button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProfileScreen;