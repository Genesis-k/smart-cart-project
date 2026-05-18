import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const ReviewListScreen = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Reply State
  const [replyText, setReplyText] = useState('');
  const [activeReplyId, setActiveReplyId] = useState(null); // Which review is being replied to?

  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Fetch all reviews
  const fetchReviews = async () => {
    try {
      const { data } = await axios.get('/api/products/reviews/all');
      setReviews(data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      fetchReviews();
    } else {
      navigate('/login');
    }
  }, [userInfo, navigate]);

  // Handler: Approve Review
  const approveHandler = async (productId, reviewId) => {
    try {
      await axios.put(`/api/products/${productId}/reviews/${reviewId}`, {
        isApproved: true,
      });
      alert('Review Approved!');
      fetchReviews(); // Refresh list
    } catch (err) {
      alert('Error approving review');
    }
  };

  // Handler: Delete Review
  const deleteHandler = async (productId, reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await axios.delete(`/api/products/${productId}/reviews/${reviewId}`);
        alert('Review Deleted!');
        fetchReviews();
      } catch (err) {
        alert('Error deleting review');
      }
    }
  };

  // Handler: Submit Reply
  const submitReplyHandler = async (productId, reviewId) => {
    try {
      await axios.put(`/api/products/${productId}/reviews/${reviewId}`, {
        reply: replyText,
      });
      alert('Reply Sent!');
      setActiveReplyId(null);
      setReplyText('');
      fetchReviews();
    } catch (err) {
      alert('Error sending reply');
    }
  };

  if (loading) return <h2>Loading Reviews...</h2>;
  if (error) return <h2 style={{ color: 'red' }}>{error}</h2>;

  return (
    <div>
      <h1>Review Management</h1>
      
      {reviews.length === 0 ? (
        <p>No reviews found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ background: '#f4f4f4', textAlign: 'left' }}>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>PRODUCT</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>USER</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>RATING</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>COMMENT</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>STATUS</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((item) => (
              <tr key={item.review._id} style={{ background: item.review.isApproved ? 'white' : '#fff3cd' }}>
                {/* Product Name (Clickable) */}
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  <Link to={`/product/${item._id}`} target="_blank" style={{ fontWeight: 'bold', color: '#333' }}>
                    {item.name}
                  </Link>
                </td>
                
                {/* User Name + Date */}
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {item.review.name}
                  <br />
                  <small style={{ color: '#666' }}>{item.review.createdAt.substring(0, 10)}</small>
                </td>

                {/* Star Rating */}
                <td style={{ padding: '10px', border: '1px solid #ddd', color: '#ffc107' }}>
                  {'★'.repeat(item.review.rating)}{'☆'.repeat(5 - item.review.rating)}
                </td>

                {/* Comment & Admin Reply */}
                <td style={{ padding: '10px', border: '1px solid #ddd', maxWidth: '300px' }}>
                  <p style={{ margin: 0 }}>{item.review.comment}</p>
                  {item.review.reply && (
                    <div style={{ marginTop: '5px', padding: '5px', background: '#f8f9fa', borderLeft: '3px solid #000', fontSize: '0.9rem' }}>
                      <strong>Admin:</strong> {item.review.reply}
                    </div>
                  )}
                  
                  {/* Inline Reply Form */}
                  {activeReplyId === item.review._id && (
                    <div style={{ marginTop: '10px', display: 'flex', gap: '5px' }}>
                        <input 
                            type="text" 
                            value={replyText} 
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Type reply..."
                            style={{ padding: '5px', width: '100%' }}
                        />
                        <button onClick={() => submitReplyHandler(item._id, item.review._id)} className='btn-black' style={{ padding: '5px 10px', fontSize: '0.8rem' }}>Send</button>
                        <button onClick={() => setActiveReplyId(null)} style={{ border: 'none', background: '#eee', cursor: 'pointer' }}>X</button>
                    </div>
                  )}
                </td>

                {/* Status Badge */}
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                  {item.review.isApproved ? (
                    <span style={{ color: 'green', fontWeight: 'bold' }}>Live</span>
                  ) : (
                    <span style={{ color: '#856404', fontWeight: 'bold' }}>Pending</span>
                  )}
                </td>

                {/* Actions */}
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {!item.review.isApproved && (
                      <button 
                        onClick={() => approveHandler(item._id, item.review._id)}
                        style={{ padding: '5px', background: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                      >
                        Approve
                      </button>
                    )}
                    
                    <button 
                      onClick={() => setActiveReplyId(item.review._id)}
                      style={{ padding: '5px', background: '#007bff', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                    >
                      Reply
                    </button>

                    <button 
                      onClick={() => deleteHandler(item._id, item.review._id)}
                      style={{ padding: '5px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ReviewListScreen;