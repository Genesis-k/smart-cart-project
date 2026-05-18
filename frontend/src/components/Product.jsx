import React from 'react';
import { Link } from 'react-router-dom';

const Product = ({ product }) => {
  return (
    <div className="card">
      <Link to={`/product/${product._id}`} style={{ overflow: 'hidden' }}>
        <img 
          src={product.image} 
          alt={product.name} 
          className="card-img-top" 
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400?text=Image+Not+Found'; }}
        />
      </Link>
      
      <div className="card-body">
        <Link to={`/product/${product._id}`}>
          <div className="card-title">
            {product.name}
          </div>
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
            <div className="card-text">
            KSh {product.price.toLocaleString()}
            </div>
            {/* Show section tag if available */}
            {product.section && (
                <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {product.section.split('-')[0]}
                </span>
            )}
        </div>
      </div>
    </div>
  );
};

export default Product;