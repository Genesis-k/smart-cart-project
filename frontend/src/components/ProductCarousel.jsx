import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ProductCarousel = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const { data } = await axios.get('/api/products/top');
        setProducts(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTopProducts();
  }, []);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (products.length === 0) return;
    
    const interval = setInterval(() => {
        setActiveIndex((current) => (current === products.length - 1 ? 0 : current + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [products]);

  if (loading) return null;
  if (error) return null;
  if (products.length === 0) return null;

  return (
    <div style={{ 
        position: 'relative', 
        background: '#f8f9fa', // Lighter background fallback
        marginBottom: '20px', 
        borderRadius: '8px', 
        overflow: 'hidden',
        height: '400px', // Slightly taller for a better showcase look
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
    }}>
      {products.map((product, index) => (
        <div
          key={product._id}
          style={{
            display: index === activeIndex ? 'flex' : 'none', // Only show active slide
            height: '100%',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            // Softened the dark overlay to rgba(0,0,0,0.3) so images are brighter
            backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url(${product.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            flexDirection: 'column',
            textAlign: 'center',
            padding: '20px'
          }}
        >
          <Link to={`/product/${product._id}`} style={{ textDecoration: 'none' }}>
            {/* Brightened text and enhanced the shadow so it never looks dark */}
            <h2 style={{ 
                color: '#FFFFFF', 
                fontSize: '3rem', 
                fontWeight: 'bold',
                marginBottom: '15px', 
                textShadow: '2px 4px 8px rgba(0,0,0,0.8)', // Stronger shadow for contrast
                letterSpacing: '1px'
            }}>
                {product.name}
            </h2>
            <h3 style={{
                color: '#f39c12', // Nice bright orange/gold for the price
                fontSize: '2rem',
                fontWeight: '600',
                marginBottom: '25px',
                textShadow: '1px 2px 6px rgba(0,0,0,0.8)'
            }}>
                KSh {product.price.toLocaleString()}
            </h3>
            
            <button style={{ 
                padding: '12px 30px', 
                fontSize: '1.1rem', 
                cursor: 'pointer', 
                backgroundColor: '#ffffff', // Solid bright button
                border: 'none', 
                color: '#000000', 
                borderRadius: '50px',
                fontWeight: 'bold',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                transition: 'transform 0.2s'
            }}>
                View Details
            </button>
          </Link>
        </div>
      ))}
      
      {/* Dots Indicator */}
      <div style={{ position: 'absolute', bottom: '20px', width: '100%', textAlign: 'center', zIndex: 10 }}>
          {products.map((_, idx) => (
              <span 
                key={idx} 
                onClick={() => setActiveIndex(idx)}
                style={{
                    height: '12px',
                    width: '12px',
                    backgroundColor: idx === activeIndex ? '#f39c12' : 'rgba(255,255,255,0.5)', // Active dot is now orange
                    borderRadius: '50%',
                    display: 'inline-block',
                    margin: '0 6px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
                }}
              ></span>
          ))}
      </div>
    </div>
  );
};

export default ProductCarousel;