import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { savePaymentMethod } from '../slices/cartSlice';

const PaymentScreen = () => {
  const [paymentMethod, setPaymentMethod] = useState('M-Pesa');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  useEffect(() => {
    // If no shipping address, go back to shipping screen
    if (!shippingAddress.address) {
      navigate('/shipping');
    }
  }, [shippingAddress, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(savePaymentMethod(paymentMethod));
    navigate('/placeorder'); // We will build this screen next
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      <h1>Payment Method</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>Select how you want to pay</p>
      
      <form onSubmit={submitHandler}>
        
        {/* M-Pesa Option */}
        <div style={{ marginBottom: '15px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
          <input
            type="radio"
            id="M-Pesa"
            label="M-Pesa"
            name="paymentMethod"
            value="M-Pesa"
            checked={paymentMethod === 'M-Pesa'}
            onChange={(e) => setPaymentMethod(e.target.value)}
            style={{ marginRight: '10px' }}
          />
          <label htmlFor="M-Pesa" style={{ fontWeight: 'bold', color: '#25D366' }}>M-Pesa (Lipa Na M-Pesa)</label>
          <div style={{ fontSize: '0.9rem', color: '#555', marginTop: '5px', marginLeft: '25px' }}>
             Fast and secure mobile payment via STK Push.
          </div>
        </div>

        {/* PayPal / Card Option */}
        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
          <input
            type="radio"
            id="PayPal"
            label="PayPal or Credit Card"
            name="paymentMethod"
            value="PayPal"
            checked={paymentMethod === 'PayPal'}
            onChange={(e) => setPaymentMethod(e.target.value)}
            style={{ marginRight: '10px' }}
          />
          <label htmlFor="PayPal" style={{ fontWeight: 'bold', color: '#003087' }}>PayPal / Credit Card</label>
        </div>

        <button 
            type="submit" 
            className="btn-black"
            style={{ padding: '15px', width: '100%', background: 'black', color: 'white', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}
        >
          Continue
        </button>
      </form>
    </div>
  );
};

export default PaymentScreen;