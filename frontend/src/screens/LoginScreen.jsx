// frontend/src/screens/LoginScreen.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setCredentials } from '../slices/authSlice';
import { signInWithPopup } from 'firebase/auth'; 
import { auth, googleProvider } from '../firebaseConfig'; 

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  // Standard Email/Password Login
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/users/login', { email, password });
      dispatch(setCredentials({ ...data }));
      navigate(redirect);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  // NEW: Google Login Handler
  const googleLoginHandler = async () => {
    try {
      // 1. Open the Google popup
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // 2. Send the Google user data to your backend
      const { data } = await axios.post('/api/users/google', {
        name: user.displayName,
        email: user.email,
      });

      // 3. Log them in to Redux
      dispatch(setCredentials({ ...data }));
      navigate(redirect);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message);
    }
  };

  const appleLoginHandler = () => {
    alert("Apple Login requires an Apple Developer Account. This remains a placeholder.");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome Back</h1>
        <p style={styles.subtitle}>Sign in to continue to Vivo Fashion</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={submitHandler}>
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button type="submit" style={styles.signInButton}>
            Sign In
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerText}>Or continue with</span>
        </div>

        <div style={styles.socialGroup}>
          {/* Updated Google Button triggers googleLoginHandler */}
          <button onClick={googleLoginHandler} type="button" style={styles.socialButton}>
            <span style={{ marginRight: '10px', fontWeight: 'bold', color: '#DB4437' }}>G</span> Google
          </button>
          <button onClick={appleLoginHandler} type="button" style={styles.socialButton}>
            <span style={{ marginRight: '10px', fontWeight: 'bold' }}></span> Apple
          </button>
        </div>

        <div style={styles.footer}>
          New to Vivo Fashion? <Link to={redirect ? `/register?redirect=${redirect}` : '/register'} style={styles.link}>Create an account</Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', backgroundColor: '#f8f9fa' },
  card: { backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', width: '100%', maxWidth: '450px' },
  title: { textAlign: 'center', marginBottom: '10px', fontSize: '2rem', color: '#000' },
  subtitle: { textAlign: 'center', marginBottom: '30px', color: '#666' },
  error: { backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '5px', marginBottom: '20px', textAlign: 'center' },
  inputGroup: { marginBottom: '20px' },
  label: { display: 'block', marginBottom: '5px', fontWeight: '500', color: '#333' },
  input: { width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '1rem', fontFamily: 'inherit' },
  signInButton: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s ease' },
  divider: { margin: '25px 0', textAlign: 'center', position: 'relative' },
  dividerText: { backgroundColor: 'white', padding: '0 10px', color: '#888', position: 'relative', zIndex: 1, fontSize: '0.9rem' },
  socialGroup: { display: 'flex', gap: '15px', marginBottom: '20px' },
  socialButton: { flex: 1, padding: '10px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '50px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', color: '#333', transition: 'all 0.2s ease' },
  footer: { textAlign: 'center', marginTop: '20px', fontSize: '0.95rem' },
  link: { color: '#000', textDecoration: 'underline', fontWeight: '600' }
};

export default LoginScreen;