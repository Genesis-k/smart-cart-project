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
  const [loading, setLoading] = useState(false);

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

  // --- Standard Email/Password Login ---
  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post('/api/users/login', { email, password });
      dispatch(setCredentials({ ...data }));
      navigate(redirect);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Google Login Handler ---
  const googleLoginHandler = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const { data } = await axios.post('/api/users/google', {
        name: user.displayName,
        email: user.email,
      });

      dispatch(setCredentials({ ...data }));
      navigate(redirect);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message);
    }
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

          <button type="submit" disabled={loading} style={styles.signInButton}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerText}>Or continue with</span>
        </div>
        
        <button onClick={googleLoginHandler} type="button" style={styles.googleButton}>
          <svg 
            version="1.1" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 48 48" 
            style={{ width: '20px', height: '20px', marginRight: '12px', display: 'block' }}
          >
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
            <path fill="none" d="M0 0h48v48H0z"></path>
          </svg>
          Sign in with Google
        </button>

        <div style={styles.footer}>
          New to Vivo Fashion? <Link to={redirect ? `/register?redirect=${redirect}` : '/register'} style={styles.link}>Create an account</Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', backgroundColor: '#f8f9fa' },
  card: { backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px' },
  title: { textAlign: 'center', marginBottom: '10px', fontSize: '2rem', color: '#000' },
  subtitle: { textAlign: 'center', marginBottom: '30px', color: '#666' },
  error: { backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '5px', marginBottom: '20px', textAlign: 'center' },
  inputGroup: { marginBottom: '20px' },
  label: { display: 'block', marginBottom: '5px', fontWeight: '500', color: '#333' },
  input: { width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '1rem', fontFamily: 'inherit', boxSizing: 'border-box' },
  signInButton: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s ease' },
  divider: { margin: '25px 0', textAlign: 'center', position: 'relative' },
  dividerText: { backgroundColor: 'white', padding: '0 10px', color: '#888', position: 'relative', zIndex: 1, fontSize: '0.9rem' },
  googleButton: { width: '100%', padding: '12px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '50px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', color: '#333', transition: 'all 0.2s ease', fontSize: '1rem' },
  footer: { textAlign: 'center', marginTop: '25px', fontSize: '0.95rem' },
  link: { color: '#000', textDecoration: 'underline', fontWeight: '600' }
};

export default LoginScreen;