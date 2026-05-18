import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setCredentials } from '../slices/authSlice';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { search } = useLocation();

  const { userInfo } = useSelector((state) => state.auth);

  const sp = new URLSearchParams(search);
  const redirect = sp.get('redirect') || '/';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, userInfo, redirect]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
    } else {
      setMessage(null);
      try {
        const { data } = await axios.post('/api/users', { name, email, password });
        dispatch(setCredentials({ ...data }));
        navigate(redirect);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      }
    }
  };

  const socialLoginHandler = (provider) => {
    alert(`${provider} Sign up integration requires a Firebase/OAuth Client ID. This is a UI placeholder.`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create Account</h1>
        <p style={styles.subtitle}>Join Vivo Fashion today</p>

        {message && <div style={styles.error}>{message}</div>}
        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={submitHandler}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="Create password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button type="submit" style={styles.signUpButton}>
            Register
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerText}>Or sign up with</span>
        </div>

        <div style={styles.socialGroup}>
          <button onClick={() => socialLoginHandler('Google')} style={styles.socialButton}>
            <span style={{ marginRight: '10px' }}>G</span> Google
          </button>
          <button onClick={() => socialLoginHandler('Apple')} style={styles.socialButton}>
            <span style={{ marginRight: '10px' }}></span> Apple
          </button>
        </div>

        <div style={styles.footer}>
          Already have an account? <Link to={redirect ? `/login?redirect=${redirect}` : '/login'} style={styles.link}>Sign In</Link>
        </div>
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
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '450px',
  },
  title: {
    textAlign: 'center',
    marginBottom: '10px',
    fontSize: '2rem',
    color: '#333',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: '30px',
    color: '#666',
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '5px',
    border: '1px solid #ddd',
    fontSize: '1rem',
  },
  signUpButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'black',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '1.1rem',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  divider: {
    margin: '25px 0',
    textAlign: 'center',
    position: 'relative',
  },
  dividerText: {
    backgroundColor: 'white',
    padding: '0 10px',
    color: '#888',
    position: 'relative',
    zIndex: 1,
  },
  socialGroup: {
    display: 'flex',
    gap: '15px',
    marginBottom: '20px',
  },
  socialButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    color: '#333',
  },
  footer: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '0.95rem',
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
    fontWeight: 'bold',
  }
};

export default RegisterScreen;