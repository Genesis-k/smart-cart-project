import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BannerEditScreen = () => {
  const [message, setMessage] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [textColor, setTextColor] = useState('#ffffff');
  const [loading, setLoading] = useState(true);

  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo || !userInfo.isAdmin) {
      navigate('/login');
      return;
    }

    const fetchBanner = async () => {
      try {
        const { data } = await axios.get('/api/banner');
        setMessage(data.message);
        setIsActive(data.isActive);
        setBackgroundColor(data.backgroundColor || '#000000');
        setTextColor(data.textColor || '#ffffff');
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchBanner();
  }, [userInfo, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/banner', {
        message,
        isActive,
        backgroundColor,
        textColor
      });
      alert('Banner Updated Successfully!');
    } catch (error) {
      alert('Failed to update banner');
    }
  };

  if (loading) return <h2>Loading...</h2>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>Edit Announcement Banner</h1>
      <form onSubmit={submitHandler}>
        <div style={{ marginBottom: '15px' }}>
          <label>Banner Message</label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ width: '100%', padding: '10px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              style={{ marginRight: '10px', width: '20px', height: '20px' }}
            />
            Show Banner on Website
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Background Color</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              style={{ height: '40px', width: '60px', border: 'none' }}
            />
            <span>{backgroundColor}</span>
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Text Color</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              style={{ height: '40px', width: '60px', border: 'none' }}
            />
            <span>{textColor}</span>
          </div>
        </div>

        <button 
          type="submit" 
          className="btn-black"
          style={{ padding: '10px 20px', background: 'black', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          Update Banner
        </button>
      </form>

      {/* Preview */}
      <div style={{ marginTop: '40px', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
        <h3>Live Preview:</h3>
        <div style={{
          backgroundColor: backgroundColor,
          color: textColor,
          padding: '15px 0',
          textAlign: 'center',
          fontWeight: 'bold',
          marginTop: '10px',
          borderRadius: '5px'
        }}>
          {message}
        </div>
      </div>
    </div>
  );
};

export default BannerEditScreen;