import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import axios from 'axios';
import BackButton from '../components/BackButton';
import { clearCartItems } from '../slices/cartSlice';

// Flip this back to true once PayPal has been tested end-to-end.
const PAYPAL_ENABLED = false;

const OrderScreen = () => {
  const { id: orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [mpesaInitiated, setMpesaInitiated] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);

  const { userInfo } = useSelector((state) => state.auth);
  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();
  const dispatch = useDispatch();

  const [delivering, setDelivering] = useState(false);
  const deliverHandler = async () => {
    setDelivering(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(`/api/orders/${orderId}/deliver`, {}, config);
      fetchOrder();
    } catch (err) {
      alert('Failed to mark as delivered.');
    } finally {
      setDelivering(false);
    }
  };

  const fetchOrder = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`/api/orders/${orderId}`, config);
      setOrder(data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // AUTOMATIC POLLING LOOP FOR M-PESA
  useEffect(() => {
    let interval;
    if (isCheckingPayment && order && !order.isPaid) {
      interval = setInterval(async () => {
        try {
          const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
          const { data } = await axios.get(`/api/orders/${orderId}`, config);
          if (data.isPaid) {
            setOrder(data);
            setIsCheckingPayment(false);
            dispatch(clearCartItems()); // payment confirmed - clear the cart
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isCheckingPayment, order, orderId, userInfo, dispatch]);

  useEffect(() => {
    if (!PAYPAL_ENABLED) return;
    const loadPayPalScript = async () => {
      try {
        const { data: { clientId } } = await axios.get('/api/config/paypal');
        paypalDispatch({ type: 'resetOptions', value: { 'client-id': clientId, currency: 'USD' } });
        paypalDispatch({ type: 'setLoadingStatus', value: 'pending' });
      } catch (err) {
        console.error("Failed to load PayPal Client ID");
      }
    };
    if (order && !order.isPaid) {
      if (!window.paypal) loadPayPalScript();
    }
  }, [order, paypalDispatch]);

  const onApprovePayment = async (data, actions) => {
    return actions.order.capture().then(async (details) => {
      try {
        const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` } };
        await axios.put(`/api/orders/${orderId}/pay`, details, config);
        alert('Payment Successful!');
        dispatch(clearCartItems()); // payment confirmed - clear the cart
        fetchOrder();
      } catch (err) {
        alert('Error updating payment status on server.');
      }
    });
  };

  const payWithMpesaHandler = async () => {
    const formattedPhone = order.user.phone || order.shippingAddress.phone || '';
    const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` } };
    try {
      await axios.post('/api/payments/stkpush', { amount: order.totalPrice, phone: formattedPhone, orderId: order._id }, config);
      setMpesaInitiated(true);
      setIsCheckingPayment(true);
    } catch (err) {
      console.error(err);
      alert('M-Pesa STK push failed. Please try again.');
    }
  };

  const verifyPaymentHandler = async () => {
    setVerifying(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`/api/orders/${orderId}`, config);
      setOrder(data);
      if (data.isPaid) {
        alert('Payment Verified Successfully! The screen will now update.');
        setIsCheckingPayment(false);
        dispatch(clearCartItems()); // payment confirmed - clear the cart
      } else {
        alert('Payment not received yet. If you just entered your PIN, please wait 10 seconds and click verify again.');
      }
    } catch (err) {
      alert('Error checking payment status.');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return <h2>Loading Order...</h2>;
  if (error) return <h2 style={{ color: 'red' }}>{error}</h2>;

  return (
    <>
      <BackButton />
      <h1 style={{ marginBottom: '30px' }}>Order {order._id}</h1>

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ flex: '2 1 60%', minWidth: '300px' }}>
          <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Shipping</h2>
            <p><strong>Name:</strong> {order.user.name}</p>
            <p><strong>Email:</strong> <a href={`mailto:${order.user.email}`}>{order.user.email}</a></p>
            <p><strong>Address:</strong> {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}</p>
            {order.isDelivered ? (
              <div style={{ padding: '15px', background: '#d4edda', color: '#155724', borderRadius: '5px' }}>Delivered on {order.deliveredAt.substring(0, 10)}</div>
            ) : (
              <div style={{ padding: '15px', background: '#f8d7da', color: '#721c24', borderRadius: '5px' }}>Not Delivered</div>
            )}
          </div>

          <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Payment Method</h2>
            <p><strong>Method:</strong> {order.paymentMethod}</p>
            {order.isPaid ? (
              <div style={{ padding: '15px', background: '#d4edda', color: '#155724', borderRadius: '5px' }}>Paid on {order.paidAt.substring(0, 10)}</div>
            ) : (
              <div style={{ padding: '15px', background: '#f8d7da', color: '#721c24', borderRadius: '5px' }}>Not Paid</div>
            )}

            {/* Delivery expectation message - customer view only, shown once paid until marked delivered */}
            {order.isPaid && !order.isDelivered && !userInfo?.isAdmin && (
              <div style={{ marginTop: '15px', padding: '15px', background: '#e8f4fd', color: '#0c5480', borderRadius: '5px', fontSize: '0.95rem', lineHeight: '1.6' }}>
                <strong>What happens next?</strong><br />
                Your payment has been received and your order is being prepared for dispatch. Please allow <strong>2-3 business days</strong> for delivery.
                <br /><br />
                Haven't received your order after this time? Contact our customer care team at <strong>0715377950</strong> or <strong>admin@example.com</strong> and we'll sort it out right away.
              </div>
            )}
          </div>

          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Order Items</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {order.orderItems.map((item, index) => (
                <li key={index} style={{ borderBottom: '1px solid #ddd', padding: '15px 0', display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                  <div style={{ width: '60px', flexShrink: 0 }}>
                    <img src={item.image} alt={item.name} style={{ width: '100%', borderRadius: '5px' }} />
                  </div>
                  <div style={{ flex: '2', minWidth: '150px' }}>
                    <Link to={`/product/${item.product}`} style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>{item.name}</Link>
                  </div>
                  <div style={{ fontWeight: 'bold' }}>
                    {item.qty} x KSh {item.price} = KSh {item.qty * item.price}
                  </div>
                  {/* Only the customer who placed the order can review - never the admin */}
                  {order.isDelivered && !userInfo?.isAdmin && (
                    <Link
                      to={`/product/${item.product}?review=1`}
                      style={{
                        marginLeft: 'auto', padding: '8px 16px', backgroundColor: '#fff', color: '#000',
                        border: '1px solid #000', borderRadius: '20px', textDecoration: 'none',
                        fontSize: '0.85rem', fontWeight: 'bold', whiteSpace: 'nowrap',
                        transition: 'background-color 0.2s, color 0.2s',
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#000'; e.currentTarget.style.color = '#fff'; }}
                      onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = '#000'; }}
                    >
                      ★ Write a Review
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ flex: '1 1 30%', minWidth: '280px' }}>
          {/* Thank-you message once payment is confirmed - customer view only, not shown to admin */}
          {order.isPaid && !userInfo?.isAdmin && (
            <div style={{ padding: '20px', backgroundColor: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '10px', textAlign: 'center', marginBottom: '20px' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '1.15rem', fontWeight: 'bold', color: '#155724' }}>
                🎉 Thank you for shopping with Vivo Fashion!
              </p>
              <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: '#155724' }}>
                Your order is confirmed and being prepared.
              </p>
              <Link
                to="/"
                style={{
                  display: 'inline-block', padding: '10px 22px', backgroundColor: '#000', color: '#fff',
                  borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.95rem',
                }}
              >
                Continue Shopping
              </Link>
            </div>
          )}

          <div className="card" style={{ padding: '30px', border: '1px solid #e4e5e9', borderRadius: '10px', backgroundColor: '#fafafa' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '25px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Order Summary</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span>Items</span><span>KSh {order.itemsPrice}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span>Shipping</span><span>KSh {order.shippingPrice}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', fontSize: '1.4rem', fontWeight: '900' }}>
              <span>Total</span><span>KSh {order.totalPrice}</span>
            </div>

            {!order.isPaid && (
              <div style={{ marginTop: '20px' }}>
                {PAYPAL_ENABLED && order.paymentMethod === 'PayPal' && (
                  isPending ? (
                    <h4>Loading PayPal...</h4>
                  ) : (
                    <PayPalButtons
                      createOrder={(data, actions) => actions.order.create({ purchase_units: [{ amount: { value: order.totalPrice } }] })}
                      onApprove={onApprovePayment}
                    />
                  )
                )}

                {!PAYPAL_ENABLED && order.paymentMethod === 'PayPal' && (
                  <div style={{ padding: '15px', background: '#fff3cd', color: '#856404', borderRadius: '5px', fontSize: '0.9rem' }}>
                    PayPal payments are temporarily unavailable. Please contact support to complete this order.
                  </div>
                )}

                {order.paymentMethod === 'M-Pesa' && (
                  mpesaInitiated ? (
                    <div style={{ padding: '20px', backgroundColor: '#e8f5e9', border: '1px solid #c8e6c9', borderRadius: '8px', textAlign: 'center' }}>
                      <p style={{ color: '#2e7d32', fontWeight: 'bold', fontSize: '1.1rem', margin: '0 0 10px 0' }}>Prompt sent to your phone!</p>
                      <p style={{ color: '#333', fontSize: '0.9rem', marginBottom: '20px' }}>Please enter your M-Pesa PIN. We are automatically checking for confirmation... ⏳</p>
                      <button
                        onClick={verifyPaymentHandler}
                        disabled={verifying}
                        style={{ width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: verifying ? 'not-allowed' : 'pointer' }}
                      >
                        {verifying ? 'Checking manually...' : 'Verify Manually'}
                      </button>
                      <button
                        onClick={() => { setMpesaInitiated(false); setIsCheckingPayment(false); }}
                        style={{ background: 'none', border: 'none', color: '#666', marginTop: '15px', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Did not get the prompt? Retry
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={payWithMpesaHandler}
                      style={{ width: '100%', padding: '15px', backgroundColor: '#25D366', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s' }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1ebc5a'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#25D366'}
                    >
                      Pay with M-Pesa
                    </button>
                  )
                )}
              </div>
            )}

            {userInfo && userInfo.isAdmin && order.isPaid && !order.isDelivered && (
              <button
                className="btn-black"
                onClick={deliverHandler}
                disabled={delivering}
                style={{ width: '100%', padding: '15px', background: 'black', color: 'white', marginTop: '20px', border: 'none', borderRadius: '8px', cursor: delivering ? 'not-allowed' : 'pointer' }}
              >
                {delivering ? 'Updating...' : 'Mark As Delivered'}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderScreen;