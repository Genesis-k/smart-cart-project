import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const LoginPopup = () => {
  const [showModal, setShowModal] = useState(false);
  const { userInfo } = useSelector((state) => state.auth); // Check if user is logged in
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    
    // Only start the timer if the user is NOT logged in
    if (!userInfo) {
      timer = setTimeout(() => {
        setShowModal(true);
      }, 5000); // 5000 milliseconds = 5 seconds
    } else {
      // If they log in, make sure the modal is hidden
      setShowModal(false);
    }

    // Cleanup: Stop the timer if the user leaves the page or logs in before 5s
    return () => clearTimeout(timer);
  }, [userInfo]);

  const handleClose = () => setShowModal(false);
  
  const handleLogin = () => {
    setShowModal(false);
    navigate('/login');
  };

  if (!showModal) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>Join Vivo Fashion!</h2>
        <p style={{ margin: '15px 0', color: '#555' }}>
          Sign in now to add items to your cart, track orders, and get exclusive deals.
        </p>
        <div style={styles.buttonGroup}>
          <button onClick={handleLogin} style={styles.loginBtn}>
            Sign In Now
          </button>
          <button onClick={handleClose} style={styles.closeBtn}>
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
};

// Simple inline styles for the popup
const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)', // Dark transparent background
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000, // Ensure it sits on top of everything
  },
  modal: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '10px',
    textAlign: 'center',
    maxWidth: '400px',
    width: '90%',
    boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
  },
  buttonGroup: {
    marginTop: '20px',
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
  },
  loginBtn: {
    backgroundColor: 'black',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  closeBtn: {
    backgroundColor: '#eee',
    color: '#333',
    padding: '10px 20px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
  },
};

export default LoginPopup;