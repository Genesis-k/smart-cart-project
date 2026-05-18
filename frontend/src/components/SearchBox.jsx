import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchBox = () => {
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search/${keyword}`);
    } else {
      navigate('/');
    }
  };

  return (
    <form onSubmit={submitHandler} style={styles.form}>
      <input
        type='text'
        name='q'
        onChange={(e) => setKeyword(e.target.value)}
        placeholder='Search products...'
        style={styles.input}
      />
      <button type='submit' style={styles.button}>
        Search
      </button>
    </form>
  );
};

const styles = {
  form: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: '50px',
    padding: '5px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    border: '1px solid #e0e0e0',
    maxWidth: '500px',
    width: '100%',
  },
  input: {
    border: 'none',
    outline: 'none',
    padding: '10px 20px',
    borderRadius: '50px 0 0 50px',
    flexGrow: 1,
    fontSize: '1rem',
    backgroundColor: 'transparent',
  },
  button: {
    backgroundColor: '#000',
    color: '#fff',
    border: 'none',
    padding: '10px 25px',
    borderRadius: '50px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'background-color 0.2s',
    marginRight: '2px', // tiny offset for visual balance
  }
};

export default SearchBox;