import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer" style={{ marginTop: 'auto', borderTop: '1px solid #e0e0e0', padding: '20px 0', backgroundColor: '#2c3e50', color: '#fff' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        
        {/* Footer Links */}
        <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <Link to="/policy/returns" style={{ color: '#ddd', textDecoration: 'none', fontSize: '0.9rem' }}>Return & Refund Policy</Link>
          <span style={{ color: '#555' }}>|</span>
          {/* Updated Links below */}
          <Link to="/policy/privacy" style={{ color: '#ddd', textDecoration: 'none', fontSize: '0.9rem' }}>Privacy Policy</Link>
          <span style={{ color: '#555' }}>|</span>
          <Link to="/policy/terms" style={{ color: '#ddd', textDecoration: 'none', fontSize: '0.9rem' }}>Terms of Service</Link>
        </div>

        {/* Copyright */}
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#aaa' }}>
          Copyright &copy; {new Date().getFullYear()} Vivo Fashion Group. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;