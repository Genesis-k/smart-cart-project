import React from 'react';
import { Link } from 'react-router-dom';

const QuickViewModal = ({ product, onClose, onAddToCart }) => {
  if (!product) return null;

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <button onClick={onClose} style={modalStyles.closeBtn}>×</button>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {/* Image */}
          <div style={{ flex: '1', minWidth: '200px' }}>
            <img 
              src={product.image} 
              alt={product.name} 
              style={{ width: '100%', borderRadius: '5px' }}
            />
          </div>
          {/* Details */}
          <div style={{ flex: '1', minWidth: '200px', display: 'flex', flexDirection: 'column' }}>
            <h2>{product.name}</h2>
            <p style={{ color: '#555', fontSize: '0.9rem' }}>{product.category} - {product.brand}</p>
            <h3 style={{ margin: '10px 0' }}>KSh {product.price}</h3>
            <p style={{ flex: '1' }}>{product.description}</p>
            
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => onAddToCart(product)}
                className='btn-black'
                disabled={product.countInStock === 0}
                style={{ ...modalStyles.actionBtn, background: 'black', color: 'white' }}
              >
                {product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <Link to={`/product/${product._id}`} onClick={onClose}>
                <button style={modalStyles.actionBtn}>View Full Details</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const modalStyles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  modal: {
    backgroundColor: '#fff', padding: '20px', borderRadius: '8px',
    width: '90%', maxWidth: '800px', position: 'relative'
  },
  closeBtn: {
    position: 'absolute', top: '10px', right: '15px',
    background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer'
  },
  actionBtn: {
    padding: '10px 20px', border: '1px solid #000', 
    cursor: 'pointer', borderRadius: '5px', fontWeight: 'bold'
  }
};

export default QuickViewModal;