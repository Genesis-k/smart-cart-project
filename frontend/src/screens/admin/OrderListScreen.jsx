import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const OrderListScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    // Security check: If not admin, kick them out
    if (userInfo && userInfo.isAdmin) {
      const fetchOrders = async () => {
        try {
          const { data } = await axios.get(`/api/orders`);
          setOrders(data);
          setLoading(false);
        } catch (err) {
          setError(err.response?.data?.message || err.message);
          setLoading(false);
        }
      };
      fetchOrders();
    } else {
      navigate('/login');
    }
  }, [userInfo, navigate]);

  return (
    <div>
      <h1>Orders (Admin)</h1>
      {loading ? (
        <h2>Loading...</h2>
      ) : error ? (
        <h2 style={{ color: 'red' }}>{error}</h2>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ background: '#f4f4f4', textAlign: 'left' }}>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>ID</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>USER</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>DATE</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>TOTAL</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>PAID</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>DELIVERED</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>DETAILS</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{order._id}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{order.user && order.user.name}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{order.createdAt.substring(0, 10)}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>KSh {order.totalPrice}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd', color: order.isPaid ? 'green' : 'red' }}>
                  {order.isPaid ? order.paidAt.substring(0, 10) : 'X'}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd', color: order.isDelivered ? 'green' : 'red' }}>
                  {order.isDelivered ? order.deliveredAt.substring(0, 10) : 'X'}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  <Link to={`/order/${order._id}`}>
                    <button className='btn-black' style={{ padding: '5px 10px', background: 'black', color: 'white', border: 'none', cursor: 'pointer' }}>
                        Details
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrderListScreen;