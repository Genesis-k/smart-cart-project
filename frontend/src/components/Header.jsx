import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../slices/authSlice';
import { clearCartItems } from '../slices/cartSlice';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showFootwearMenu, setShowFootwearMenu] = useState(false);
  // NEW: State for Admin Dropdown
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutHandler = () => {
    dispatch(clearCartItems()); 
    dispatch(logout());
    setIsMenuOpen(false); 
    navigate('/');
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setShowFootwearMenu(false);
    setShowAdminMenu(false); // Close admin menu on click
  };

  // Inline SVG Icons
  const CartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
  );

  const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
  );

  const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
  );

  return (
    <header className="header" style={{ paddingBottom: '0', backgroundColor: '#2c3e50', borderBottom: 'none' }}>
      <div style={{ width: '100%', padding: '0 30px', margin: '0 auto' }}>
        <nav className="navbar" style={{ flexDirection: 'column' }}>
          
          {/* ROW 1: Re-structured into 3 equal flex columns for perfect centering */}
          <div style={{ display: 'flex', width: '100%', alignItems: 'center', padding: '15px 0' }}>
            
            {/* LEFT: Logo */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
              <Link to="/" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#fff' }}>
                <img src="/vivo-logo.svg" alt="VF" style={{ height: '40px', width: '40px' }} />
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '1px' }}>Vivo Fashion</span>

              </Link>
            </div>

            {/* CENTER: Hello User */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
               {userInfo && (
                  <Link to="/profile" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#fff', fontWeight: 'bold' }}>
                    <UserIcon />
                    <span>Hello, {userInfo.name.split(' ')[0]}</span>
                  </Link>
               )}
            </div>

            {/* RIGHT: Admin Dropdown, Logout, Cart (Furthest right) */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '25px' }}>
                {/* NEW: Admin Dashboard Dropdown */}
                {userInfo && userInfo.isAdmin && (
                  <div style={{ position: 'relative' }} onMouseEnter={() => setShowAdminMenu(true)} onMouseLeave={() => setShowAdminMenu(false)}>
                    <span style={{ color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }} onClick={() => setShowAdminMenu(!showAdminMenu)}>
                      Dashboard <small>▼</small>
                    </span>
                    {showAdminMenu && (
                      <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#fff', padding: '10px 0', borderRadius: '5px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', minWidth: '150px', zIndex: 1000 }}>
                        <Link to="/admin/orderlist" onClick={closeMenu} style={dropdownLinkStyle}>Orders</Link>
                        <Link to="/admin/productlist" onClick={closeMenu} style={dropdownLinkStyle}>Products</Link>
                        <Link to="/admin/reviews" onClick={closeMenu} style={dropdownLinkStyle}>Reviews</Link>
                        <Link to="/admin/analysis" onClick={closeMenu} style={dropdownLinkStyle}>Analysis</Link>
                        <Link to="/admin/banner" onClick={closeMenu} style={dropdownLinkStyle}>Banner</Link>
                      </div>
                    )}
                  </div>
                )}

                {/* Cart - Pushed to the furthest end */}
                <Link to="/cart" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', color: '#fff', fontWeight: 'bold' }}>
                  <CartIcon />
                  <span>Cart</span>
                  {cartItems.length > 0 && (
                      <span style={{ background: '#e74c3c', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '0.8rem', marginLeft: '5px' }}>
                      {cartItems.reduce((a, c) => a + c.qty, 0)}
                      </span>
                  )}
                </Link>

                {/* Logout / Login */}
                {userInfo ? (
                  <button onClick={logoutHandler} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#fff', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: 0 }}>
                    <LogoutIcon />
                    <span>Logout</span>
                  </button>
                ) : (
                  <Link to="/login" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', color: '#fff' }}>
                    <UserIcon />
                    <span>Sign In</span>
                  </Link>
                )}
            </div>

          </div>

          {/* ROW 2: Categories */}
          {userInfo && (
            <div style={{ 
              display: 'flex', gap: '40px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', padding: '15px 0', width: '100%', justifyContent: 'center', letterSpacing: '1px', flexWrap: 'wrap' 
            }}>
              <Link to="/section/Female" onClick={closeMenu} style={linkStyle}>Women</Link>
              <Link to="/section/Male" onClick={closeMenu} style={linkStyle}>Men</Link>
              <Link to="/section/Kids" onClick={closeMenu} style={linkStyle}>Kids</Link>
              
              <div style={{ position: 'relative' }} onMouseEnter={() => setShowFootwearMenu(true)} onMouseLeave={() => setShowFootwearMenu(false)}>
                <span style={{...linkStyle, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'}} onClick={() => setShowFootwearMenu(!showFootwearMenu)}>
                  Footwear <small>▼</small>
                </span>
                
                {showFootwearMenu && (
                  <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#fff', padding: '10px 0', borderRadius: '5px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', minWidth: '160px', zIndex: 1000 }}>
                    <Link to="/section/Male-Footwear" onClick={closeMenu} style={dropdownLinkStyle}>Men's Footwear</Link>
                    <Link to="/section/Female-Footwear" onClick={closeMenu} style={dropdownLinkStyle}>Women's Footwear</Link>
                    <Link to="/section/Kids-Footwear" onClick={closeMenu} style={dropdownLinkStyle}>Kids' Footwear</Link>
                  </div>
                )}
              </div>

              <Link to="/section/Beauty" onClick={closeMenu} style={linkStyle}>Beauty</Link>
              <Link to="/section/Accessories" onClick={closeMenu} style={linkStyle}>Accessories</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

const linkStyle = { color: '#fff', fontWeight: '500', textTransform: 'uppercase', textDecoration: 'none', fontSize: '0.95rem' };
const dropdownLinkStyle = { color: '#333', padding: '10px 20px', textDecoration: 'none', fontSize: '0.9rem', display: 'block', whiteSpace: 'nowrap', transition: 'background 0.2s' };

export default Header;