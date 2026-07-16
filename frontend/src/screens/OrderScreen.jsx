import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import axios from 'axios';
import BackButton from '../components/BackButton';

const OrderScreen = () => {
  const { id: orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { userInfo } = useSelector((state) => state.auth);
  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();

  // Fetch the Order from the database
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
  }, [orderId]);

  // Load PayPal Script dynamically
  useEffect(() => {
    const loadPayPalScript = async () => {
      try {
        const { data: { clientId } } = await axios.get('/api/config/paypal');
        paypalDispatch({
          type: 'resetOptions',
          value: {
            'client-id': clientId,
            currency: 'USD',
          },
        });
        paypalDispatch({ type: 'setLoadingStatus', value: 'pending' });
      } catch (err) {
        console.error("Failed to load PayPal Client ID");
      }
    };

    if (order && !order.isPaid) {
      if (!window.paypal) {
        loadPayPalScript();
      }
    }
  }, [order, paypalDispatch]);


  // Handle successful PayPal payment
  const onApprovePayment = async (data, actions) => {
    return actions.order.capture().then(async (details) => {
      try {
        const config = { 
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userInfo.token}` 
          } 
        };
        // Tell your backend the order is paid
        await axios.put(`/api/orders/${orderId}/pay`, details, config);
        alert('Payment Successful!');
        fetchOrder(); // Reload order to show "Paid" status
      } catch (err) {
        alert('Error updating payment status on server.');
      }
    });
  };

  if (loading) return <h2>Loading Order...</h2>;
  if (error) return <h2 style={{ color: 'red' }}>{error}</h2>;

  // Handle M-Pesa Payment Initiation
  const payWithMpesaHandler = async () => {
    const formattedPhone = order.user.phone || order.shippingAddress.phone || '';
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    alert(`Initiating M-Pesa payment for KSh ${order.totalPrice} to your phone...`);

    try {
      const { data } = await axios.post(
        '/api/mpesa/stkpush',
        {
          amount: order.totalPrice,
          phone: formattedPhone,
          orderId: order._id,
        },
        config
      );
      console.log(data);
    } catch (err) {
      console.error(err);
      alert('M-Pesa payment failed.');
    }
  };

  return (
    <>
      <BackButton />
      <h1 style={{ marginBottom: '30px' }}>Order {order._id}</h1>

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        
        {/* LEFT SIDE: Order Details */}
        <div style={{ flex: '2 1 60%', minWidth: '300px' }}>
          
          <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Shipping</h2>
            <p><strong>Name:</strong> {order.user.name}</p>
            <p><strong>Email:</strong> <a href={`mailto:${order.user.email}`}>{order.user.email}</a></p>
            <p>
              <strong>Address:</strong> {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}
            </p>
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
          </div>

          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Order Items</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {order.orderItems.map((item, index) => (
                <li key={index} style={{ borderBottom: '1px solid #ddd', padding: '15px 0', display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ width: '60px', flexShrink: 0 }}>
                    <img src={item.image} alt={item.name} style={{ width: '100%', borderRadius: '5px' }} />
                  </div>
                  <div style={{ flex: '2', minWidth: '150px' }}>
                    <Link to={`/product/${item.product}`} style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>{item.name}</Link>
                  </div>
                  <div style={{ fontWeight: 'bold' }}>
                    {item.qty} x KSh {item.price} = KSh {item.qty * item.price}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT SIDE: Payment Summary & PayPal Buttons */}
        <div style={{ flex: '1 1 30%', minWidth: '280px' }}>
          <div className="card" style={{ padding: '30px', border: '1px solid #e4e5e9', borderRadius: '10px', backgroundColor: '#fafafa' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '25px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Order Summary</h2>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span>Items</span>
              <span>KSh {order.itemsPrice}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span>Shipping</span>
              <span>KSh {order.shippingPrice}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', fontSize: '1.4rem', fontWeight: '900' }}>
              <span>Total</span>
              <span>KSh {order.totalPrice}</span>
            </div>

            {/* PAYPAL COMPONENT RENDERING */}
{/* CONDITIONAL PAYMENT BUTTONS */}
            {!order.isPaid && (
              <div style={{ marginTop: '20px' }}>
                
                {/* 1. Show this ONLY if PayPal was selected */}
                {order.paymentMethod === 'PayPal' && (
                  isPending ? (
                    <h4>Loading PayPal...</h4>
                  ) : (
                    <PayPalButtons
                      createOrder={(data, actions) => {
                        return actions.order.create({
                          purchase_units: [
                            {
                              amount: { value: order.totalPrice }, 
                            },
                          ],
                        });
                      }}
                      onApprove={onApprovePayment}
                    />
                  )
                )}

                {/* 2. Show this ONLY if M-Pesa was selected */}
                {order.paymentMethod === 'M-Pesa' && (
                  <button 
                    onClick={payWithMpesaHandler}
                    style={{
                      width: '100%',
                      padding: '15px',
                      backgroundColor: '#25D366', /* M-Pesa Green */
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1ebc5a'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#25D366'}
                  >
                    Pay with M-Pesa
                  </button>
                )}

              </div>
            )}

            {/* Admin "Mark as Delivered" Button (Optional) */}
            {userInfo && userInfo.isAdmin && order.isPaid && !order.isDelivered && (
              <button 
                className="btn-black" 
                style={{ width: '100%', padding: '15px', background: 'black', color: 'white', border: 'none', borderRadius: '5px', marginTop: '20px', cursor: 'pointer' }}
              >
                Mark As Delivered
              </button>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default OrderScreen;