import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button 
      onClick={() => navigate(-1)} 
      style={{ 
        marginBottom: '20px',
        padding: '8px 15px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        backgroundColor: '#f8f9fa',
        color: '#333',
        cursor: 'pointer',
        fontWeight: 'bold',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'background-color 0.2s'
      }}
      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e2e6ea'}
      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
    >
      ← Go Back
    </button>
  );
};

export default BackButton;