import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DiscountBanner = () => {
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const { data } = await axios.get('/api/banner');
        setBanner(data);
      } catch (error) {
        console.error('Failed to fetch banner', error);
      }
    };
    fetchBanner();
  }, []);

  if (!banner || !banner.isActive) return null;

  return (
    <div style={{
      backgroundColor: banner.backgroundColor || '#000',
      color: banner.textColor || '#fff',
      padding: '10px 0',
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: '0.9rem',
      letterSpacing: '1px',
      width: '100%'
    }}>
      {banner.message}
    </div>
  );
};

export default DiscountBanner;