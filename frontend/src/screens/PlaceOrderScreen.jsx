import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { clearCartItems } from '../slices/cartSlice';

const PlaceOrderScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);

  // Helper: Add decimals
  const addDecimals = (num) => {
    return (Math.round(num * 100) / 100).toFixed(2);
  };

  // 1. Calculate Prices
  const itemsPrice = addDecimals(
    cart.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
  );

  // Delivery Fee Logic: Free if order is over KSh 5000, otherwise KSh 250
  // Replaces the previous "Shipping" display logic
  const deliveryFee = addDecimals(itemsPrice > 5000 ? 0 : 250);
  
  // Tax is removed (set to 0) as requested
  const taxPrice = addDecimals(0);
  
  // Total Price = Items + Delivery Fee
  const totalPrice = (
    Number(itemsPrice) +
    Number(deliveryFee) + 
    Number(taxPrice)
  ).toFixed(2);

  useEffect(() => {
    if (!cart.paymentMethod) {
      navigate('/payment');
    }
  }, [cart, navigate]);

  const placeOrderHandler = async () => {
    try {
      // 2. Send order to backend
      // We map deliveryFee to 'shippingPrice' to match the backend model
      const { data } = await axios.post('/api/orders', {
        orderItems: cart.cartItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice: itemsPrice,
        shippingPrice: deliveryFee, 
        taxPrice: taxPrice,
        totalPrice: totalPrice,
      });

      // 3. Clear the cart
      dispatch(clearCartItems());

      // 4. Redirect to Order Details
      navigate(`/order/${data._id}`);
      
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Error placing order");
    }
  };

  return (
    <div className="row">
      {/* LEFT COLUMN: Order Details */}
      <div className="col" style={{ flex: '2', paddingRight: '20px' }}>
        <h1 style={{ marginBottom: '20px' }}>Review Order</h1>
        
        {/* SHIPPING INFO */}
        <div style={{ marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
          <h3>Shipping</h3>
          <p>
            <strong>Address: </strong>
            {cart.shippingAddress.address}, {cart.shippingAddress.city},{' '}
            {cart.shippingAddress.postalCode}, {cart.shippingAddress.country}
          </p>
          <p>
            <strong>Phone: </strong>
            {cart.shippingAddress.phone}
          </p>
        </div>

        {/* PAYMENT METHOD */}
        <div style={{ marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
          <h3>Payment Method</h3>
          <strong>Method: </strong>
          {cart.paymentMethod}
        </div>

        {/* ORDER ITEMS */}
        <div>
          <h3>Order Items</h3>
          {cart.cartItems.length === 0 ? (
            <p>Your cart is empty</p>
          ) : (
            <div>
              {cart.cartItems.map((item, index) => (
                <div key={index} className="cart-item">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="cart-image" 
                    style={{ width: '50px', height: '50px' }} 
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400?text=Image+Not+Found'; }}
                  />
                  <div className="item-details">
                    <Link to={`/product/${item._id}`}>
                      {item.name}
                    </Link>
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

      {/* RIGHT COLUMN: Order Summary Card */}
      <div className="col" style={{ flex: '1' }}>
        <div className="card" style={{ padding: '20px', border: '1px solid #ddd' }}>
          <h2>Order Summary</h2>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span>Items</span>
            <span>KSh {itemsPrice}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span>Delivery Fee</span>
            <span>KSh {deliveryFee}</span>
          </div>

          {/* Tax row removed from display since it is 0 */}

          <hr />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '1.2rem', fontWeight: 'bold' }}>
            <span>Total</span>
            <span>KSh {totalPrice}</span>
          </div>

          <button
            type="button"
            className="btn-black"
            style={{ 
                width: '100%', 
                padding: '15px', 
                background: 'black', 
                color: 'white', 
                border: 'none', 
                cursor: 'pointer',
                fontSize: '1.1rem'
            }}
            onClick={placeOrderHandler}
            disabled={cart.cartItems.length === 0}
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrderScreen;