import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import BackButton from '../components/BackButton';
import axios from 'axios';

const PlaceOrderScreen = () => {
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  // If there is no shipping address or payment method, redirect them back
  useEffect(() => {
    if (!cart.shippingAddress?.address) {
      navigate('/shipping');
    } else if (!cart.paymentMethod) {
      navigate('/payment');
    }
  }, [cart.paymentMethod, cart.shippingAddress, navigate]);

const placeOrderHandler = async () => {
  try {
    // 1. Set up the secure headers with the user's token
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    // 2. Send the cart data to your backend to create the Order in MongoDB
    const { data } = await axios.post(
      '/api/orders',
      {
        orderItems: cart.cartItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice: cart.itemsPrice || cart.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0).toFixed(2),
        shippingPrice: cart.shippingPrice || 250,
        totalPrice: cart.totalPrice || ((cart.itemsPrice || cart.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)) + 250).toFixed(2),
      },
      config
    );

    // 3. Success! Redirect the user to the actual Payment Screen (OrderScreen) using the new Order ID
    navigate(`/order/${data._id}`);

  } catch (error) {
    // If something goes wrong, show an alert
    alert('Error placing order: ' + (error.response?.data?.message || error.message));
  }
};

  return (
    <>
    <BackButton /> {/* 2. Add it here */}
      <h1 style={{ marginBottom: '30px' }}>Review Order</h1>

      {/* 2-COLUMN LAYOUT WITH ALLOWANCE (GAP) */}
      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        
        {/* ========================================== */}
        {/* LEFT SIDE: Shipping, Payment, & Items      */}
        {/* ========================================== */}
        <div style={{ flex: '2 1 60%', minWidth: '300px' }}>
          
          {/* Shipping Section */}
          <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Shipping</h2>
              <Link to="/shipping" style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}>✎ Edit</Link>
            </div>
            <p style={{ margin: '5px 0', fontSize: '1.1rem' }}>
              <strong>Address:</strong> {cart.shippingAddress.address}, {cart.shippingAddress.city}, {cart.shippingAddress.postalCode}, {cart.shippingAddress.country}
            </p>
            {/* Assuming you captured phone number in shippingAddress */}
            {cart.shippingAddress.phone && (
                <p style={{ margin: '5px 0', fontSize: '1.1rem' }}>
                <strong>Phone:</strong> {cart.shippingAddress.phone}
                </p>
            )}
          </div>

          {/* Payment Method Section */}
          <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Payment Method</h2>
              <Link to="/payment" style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}>✎ Edit</Link>
            </div>
            <p style={{ margin: '5px 0', fontSize: '1.1rem' }}>
              <strong>Method:</strong> {cart.paymentMethod}
            </p>
          </div>

          {/* Order Items Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Order Items</h2>
              <Link to="/cart" style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}>✎ Edit Items</Link>
            </div>
            
            {cart.cartItems.length === 0 ? (
              <div style={{ padding: '20px', background: '#e9ecef', borderRadius: '5px' }}>
                Your cart is empty
              </div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {cart.cartItems.map((item, index) => (
                  <li 
                    key={index}
                    style={{ 
                      borderBottom: '1px solid #ddd', 
                      padding: '15px 0', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '15px'
                    }}
                  >
                    {/* Thumbnail Image */}
                    <div style={{ width: '60px', flexShrink: 0 }}>
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        style={{ width: '100%', borderRadius: '5px', objectFit: 'cover' }} 
                      />
                    </div>

                    {/* Product Name */}
                    <div style={{ flex: '2', minWidth: '150px' }}>
                      <Link to={`/product/${item._id}`} style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>
                        {item.name}
                      </Link>
                    </div>

                    {/* Calculation */}
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#555' }}>
                      {item.qty} x KSh {item.price} = <span style={{ color: '#111' }}>KSh {item.qty * item.price}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ========================================== */}
        {/* RIGHT SIDE: Order Summary Card             */}
        {/* ========================================== */}
        <div style={{ flex: '1 1 30%', minWidth: '280px' }}>
          <div 
            className="card" 
            style={{ 
              padding: '30px', 
              border: '1px solid #e4e5e9', 
              borderRadius: '10px', 
              backgroundColor: '#fafafa',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              position: 'sticky', 
              top: '20px' 
            }}
          >
            <h2 style={{ fontSize: '1.8rem', marginBottom: '25px', color: '#111', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
              Order Summary
            </h2>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '1.1rem' }}>
              <span>Items</span>
              <span>KSh {cart.itemsPrice || cart.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0).toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '1.1rem', borderBottom: '1px solid #ddd', paddingBottom: '20px' }}>
              <span>Delivery Fee</span>
              <span>KSh {cart.shippingPrice || '250.00'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', fontSize: '1.4rem', fontWeight: '900' }}>
              <span>Total</span>
              <span>KSh {cart.totalPrice || ((cart.itemsPrice || cart.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)) + (Number(cart.shippingPrice) || 250)).toFixed(2)}</span>
            </div>

            <button 
              type="button" 
              className="btn-black" 
              disabled={cart.cartItems.length === 0} 
              onClick={placeOrderHandler}
              style={{
                width: '100%',
                padding: '15px',
                backgroundColor: cart.cartItems.length === 0 ? '#ccc' : 'black',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: cart.cartItems.length === 0 ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              Place Order
            </button>
          </div>
        </div>

      </div>
    </>
  );
};

export default PlaceOrderScreen;