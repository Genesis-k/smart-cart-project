import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Product from '../components/Product'; // Reuse Product card or make a simple list

const WishlistScreen = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const fetchWishlist = async () => {
    try {
      const { data } = await axios.get('/api/users/wishlist');
      setWishlist(data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      fetchWishlist();
    }
  }, [userInfo, navigate]);

  const removeFromWishlistHandler = async (productId) => {
    try {
        await axios.post('/api/users/wishlist', { productId });
        fetchWishlist(); // Refresh list
    } catch (err) {
        alert('Error removing item');
    }
  };

  if (loading) return <h2>Loading Wishlist...</h2>;
  if (error) return <h2 style={{ color: 'red' }}>{error}</h2>;

  return (
    <div>
      <h1>My Wishlist</h1>
      {wishlist.length === 0 ? (
        <div style={{ padding: '20px', background: '#e9ecef' }}>
          Your wishlist is empty. <Link to="/">Go Shopping</Link>
        </div>
      ) : (
        <div className="row">
          {wishlist.map((product) => (
            <div key={product._id} className="col" style={{ position: 'relative' }}>
               <button 
                 onClick={() => removeFromWishlistHandler(product._id)}
                 style={{ 
                    position: 'absolute', top: '10px', right: '10px', zIndex: 5,
                    background: 'red', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'
                 }}>
                 Remove
               </button>
               {/* We pass a dummy function for QuickView since we are in Wishlist */}
               <Product product={product} openQuickView={() => {}} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistScreen;