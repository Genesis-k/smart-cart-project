import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { saveShippingAddress } from '../slices/cartSlice';

const ShippingScreen = () => {
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  const [address, setAddress] = useState(shippingAddress?.address || '');
  const [city, setCity] = useState(shippingAddress?.city || '');
  const [postalCode, setPostalCode] = useState(shippingAddress?.postalCode || '');
  const [country, setCountry] = useState(shippingAddress?.country || '');
  const [phone, setPhone] = useState(shippingAddress?.phone || '');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(saveShippingAddress({ address, city, postalCode, country, phone }));
    navigate('/payment');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Progress Step Indicator (Optional visual cue) */}
        <div style={styles.stepsContainer}>
          <span style={styles.activeStep}>1. Shipping</span>
          <span style={styles.stepDivider}>›</span>
          <span style={styles.inactiveStep}>2. Payment</span>
          <span style={styles.stepDivider}>›</span>
          <span style={styles.inactiveStep}>3. Review</span>
        </div>

        <h1 style={styles.title}>Shipping Details</h1>
        <p style={styles.subtitle}>Where should we send your order?</p>

        <form onSubmit={submitHandler}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Address / Location</label>
            <input
              type="text"
              required
              placeholder="e.g. Westlands, Mpaka Road"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.row}>
            <div style={{...styles.inputGroup, flex: 1}}>
              <label style={styles.label}>City</label>
              <input
                type="text"
                required
                placeholder="e.g. Nairobi"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={{...styles.inputGroup, flex: 1}}>
              <label style={styles.label}>Postal Code</label>
              <input
                type="text"
                required
                placeholder="e.g. 00100"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>County</label>
            <input
              type="text"
              required
              placeholder="e.g. Nairobi County"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>M-Pesa Phone Number</label>
            <input
              type="text"
              required
              placeholder="e.g. 0712345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ ...styles.input, border: '1px solid #28a745' }} // Green border hint for M-Pesa
            />
            <small style={{ color: '#666', marginTop: '5px', display: 'block', fontSize: '0.85rem' }}>
              Required for payment requests and tracking updates.
            </small>
          </div>

          <button type="submit" style={styles.button}>
            Continue to Payment
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    width: '100%',
    maxWidth: '550px',
  },
  stepsContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '25px',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#888',
  },
  activeStep: {
    color: 'black',
    borderBottom: '2px solid black',
    paddingBottom: '2px',
  },
  inactiveStep: {
    color: '#ccc',
  },
  stepDivider: {
    margin: '0 10px',
    color: '#ccc',
  },
  title: {
    textAlign: 'center',
    marginBottom: '10px',
    fontSize: '1.8rem',
    color: '#333',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: '30px',
    color: '#666',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  row: {
    display: 'flex',
    gap: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#333',
    fontSize: '0.95rem',
  },
  input: {
    width: '100%',
    padding: '12px 15px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    transition: 'border-color 0.2s',
    outline: 'none',
  },
  button: {
    width: '100%',
    padding: '14px',
    backgroundColor: 'black',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginTop: '10px',
    transition: 'opacity 0.2s',
  },
};

export default ShippingScreen;