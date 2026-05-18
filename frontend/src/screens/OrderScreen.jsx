import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const OrderScreen = () => {
  const { id: orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingPay, setLoadingPay] = useState(false);
  const [loadingDeliver, setLoadingDeliver] = useState(false);

  const { userInfo } = useSelector((state) => state.auth);

  const fetchOrder = async () => {
    try {
      const { data } = await axios.get(`/api/orders/${orderId}`);
      setOrder(data);
      setLoading(false);
    } catch (err) {
      setError(err.response && err.response.data.message ? err.response.data.message : err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!order || order._id !== orderId) {
      fetchOrder();
    }
  }, [order, orderId]);

  const successPaymentHandler = async () => {
    try {
      setLoadingPay(true);
      const { data } = await axios.post('/api/mpesa/stkpush', {
        phoneNumber: order.shippingAddress.phone,
        amount: order.totalPrice,
        orderId: order._id
      });
      setLoadingPay(false);
      
      if (data.ResponseCode === "0") {
         alert(`STK Push Sent to ${order.shippingAddress.phone}. Please enter your PIN.`);
      } else {
         alert("Failed to send M-Pesa prompt.");
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
      setLoadingPay(false);
    }
  };

  const deliverHandler = async () => {
    try {
      setLoadingDeliver(true);
      await axios.put(`/api/orders/${order._id}/deliver`);
      setLoadingDeliver(false);
      fetchOrder(); 
    } catch (err) {
      alert(err.response?.data?.message || err.message);
      setLoadingDeliver(false);
    }
  };

  const undeliverHandler = async () => {
    try {
      setLoadingDeliver(true);
      await axios.put(`/api/orders/${order._id}/undeliver`);
      setLoadingDeliver(false);
      fetchOrder(); 
    } catch (err) {
      alert(err.response?.data?.message || err.message);
      setLoadingDeliver(false);
    }
  };

  if (loading) return <h2>Loading...</h2>;
  if (error) return <h2 style={{ color: 'red' }}>{error}</h2>;

  const step1 = true;
  const step2 = order.isPaid;
  const step3 = order.isDelivered;

  return (
    <div>
      {/* 4. BACK BUTTON & TITLE */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '20px' }}>
        {/* Changed from /profile to / for "Continue Shopping" behavior */}
        <Link to="/" className='btn-light' style={{ textDecoration: 'none', color: '#333', border: '1px solid #ccc', padding: '5px 15px', borderRadius: '5px' }}>
          ← Continue Shopping
        </Link>
        {/* 1. ORDER NUMBER AT TOP */}
        <h1 style={{ margin: 0 }}>Order {order._id}</h1>
      </div>

      {/* 2. TRACKING STATUS (Full Width Below Title) */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', background: '#fff' }}>
          <h3 style={{ marginBottom: '20px' }}>Tracking Status</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', margin: '0 20px' }}>
              <div style={{ position: 'absolute', top: '15px', left: 0, width: '100%', height: '4px', background: '#eee', zIndex: 0 }}></div>
              <div style={{ 
                  position: 'absolute', top: '15px', left: 0, width: step3 ? '100%' : step2 ? '50%' : '0%', height: '4px', background: '#28a745', zIndex: 0, transition: 'width 0.5s ease-in-out'
              }}></div>

              <div style={{ zIndex: 1, textAlign: 'center', background: '#fff', padding: '0 5px' }}>
                  <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: '#28a745', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontWeight: 'bold' }}>✓</div>
                  <div style={{ marginTop: '5px', fontSize: '0.9rem' }}>Placed</div>
              </div>

              <div style={{ zIndex: 1, textAlign: 'center', background: '#fff', padding: '0 5px' }}>
                  <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: step2 ? '#28a745' : '#eee', color: step2 ? '#fff' : '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontWeight: 'bold' }}>{step2 ? '✓' : '2'}</div>
                  <div style={{ marginTop: '5px', fontSize: '0.9rem' }}>Processing</div>
              </div>

              <div style={{ zIndex: 1, textAlign: 'center', background: '#fff', padding: '0 5px' }}>
                  <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: step3 ? '#28a745' : '#eee', color: step3 ? '#fff' : '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontWeight: 'bold' }}>{step3 ? '✓' : '3'}</div>
                  <div style={{ marginTop: '5px', fontSize: '0.9rem' }}>Delivered</div>
              </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '20px', fontWeight: 'bold', fontSize: '1.1rem' }}>
              Current Status: <span style={{ color: '#28a745' }}>{order.isDelivered ? "Package Delivered" : order.isPaid ? "Payment Received" : "Waiting for Payment"}</span>
          </div>
      </div>

      {/* 3. COLUMNS: DETAILS LEFT, SUMMARY RIGHT */}
      <div className="row">
        {/* LEFT SIDE: Info & Items */}
        <div className="col" style={{ flex: '2', paddingRight: '20px' }}>
          
          <div style={{ marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
            <h3>Shipping Details</h3>
            <p><strong>Name: </strong> {order.user?.name}</p>
            <p><strong>Email: </strong> <a href={`mailto:${order.user?.email}`}>{order.user?.email}</a></p>
            <p><strong>Address: </strong> {order.shippingAddress.address}, {order.shippingAddress.city}</p>
            <p><strong>Phone: </strong> {order.shippingAddress.phone}</p>
          </div>

          <div style={{ marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
            <h3>Payment Method</h3>
            <p><strong>Method: </strong> {order.paymentMethod}</p>
            {order.isPaid ? (
               <div style={{ background: '#d4edda', color: '#155724', padding: '10px', borderRadius: '5px' }}>Paid on {order.paidAt.substring(0, 10)}</div>
            ) : (
               <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '5px' }}>Not Paid</div>
            )}
          </div>

          <div>
            <h3>Order Items</h3>
            {order.orderItems.length === 0 ? (
              <p>Order is empty</p>
            ) : (
              <div>
                {order.orderItems.map((item, index) => (
                  <div key={index} className="cart-item">
                    <img src={item.image} alt={item.name} className="cart-image" style={{ width: '50px', height: '50px' }} />
                    <div className="item-details">
                      <Link to={`/product/${item.product}`}>{item.name}</Link>
                    </div>
                    <div style={{ fontSize: '0.9rem' }}>
                      {item.qty} x KSh {item.price} = <strong>KSh {item.qty * item.price}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: Summary */}
        <div className="col" style={{ flex: '1' }}>
          <div className="card" style={{ padding: '20px', border: '1px solid #ddd' }}>
            <h2>Order Summary</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Items</span><span>KSh {order.itemsPrice}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Shipping</span><span>KSh {order.shippingPrice}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Tax</span><span>KSh {order.taxPrice}</span>
            </div>
            <hr />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '1.2rem', fontWeight: 'bold' }}>
              <span>Total</span><span>KSh {order.totalPrice}</span>
            </div>
              
            {/* USER PAYMENT BUTTON */}
            {!order.isPaid && !userInfo.isAdmin && (
                <button
                  className="btn-black"
                  style={{ width: '100%', padding: '15px', marginBottom: '10px', background: loadingPay ? '#ccc' : '#25D366', color: 'white', border: 'none', cursor: loadingPay ? 'not-allowed' : 'pointer', fontSize: '1.1rem', fontWeight: 'bold' }}
                  onClick={successPaymentHandler}
                  disabled={loadingPay}
                >
                  {loadingPay ? "Processing..." : "Pay with M-Pesa"}
                </button>
            )}

            {/* ADMIN MESSAGES & BUTTONS */}
            {!order.isPaid && userInfo.isAdmin && (
                <div style={{ width: '100%', padding: '15px', marginBottom: '10px', background: '#f8d7da', color: '#721c24', textAlign: 'center', borderRadius: '5px', border: '1px solid #f5c6cb' }}>
                  Order Not Paid Yet
                </div>
            )}

            {userInfo && userInfo.isAdmin && order.isPaid && !order.isDelivered && (
               <button type="button" className="btn btn-block" style={{ width: '100%', padding: '15px', background: '#000', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }} onClick={deliverHandler} disabled={loadingDeliver}>
                 {loadingDeliver ? 'Loading...' : 'Mark As Delivered'}
               </button>
            )}

            {userInfo && userInfo.isAdmin && order.isPaid && order.isDelivered && (
               <button type="button" className="btn btn-block" style={{ width: '100%', padding: '15px', background: '#dc3545', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '1.1rem', marginTop: '10px' }} onClick={undeliverHandler} disabled={loadingDeliver}>
                 {loadingDeliver ? 'Loading...' : 'Mark As Not Delivered'}
               </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderScreen;