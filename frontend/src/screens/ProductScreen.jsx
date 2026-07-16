import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { addToCart } from '../slices/cartSlice';
import BackButton from '../components/BackButton';

const ProductScreen = () => {
  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review State
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [loadingReview, setLoadingReview] = useState(false);

  const { id: productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.auth);

  const fetchProduct = async () => {
    try {
      const { data } = await axios.get(`/api/products/${productId}`);
      setProduct(data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const addToCartHandler = () => {
    dispatch(addToCart({ ...product, qty: 1 }));
    navigate('/cart');
  };

  const handleStarClick = (starValue) => {
    setRating(starValue);
    setShowReviewModal(true);
  };

  const submitReviewHandler = async (e) => {
    e.preventDefault();
    try {
      setLoadingReview(true);
      
      await axios.post(`/api/products/${productId}/reviews`, {
        rating,
        comment,
      });

      setLoadingReview(false);
      setShowReviewModal(false);
      alert('Review Submitted!');
      setRating(0);
      setComment('');
      fetchProduct(); 
      
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting review');
      setLoadingReview(false);
    }
  };

  if (loading) return <h2>Loading...</h2>;
  if (error) return <h2 style={{ color: 'red' }}>{error}</h2>;

  return (
    <>
    <BackButton />
      
      <div className="row">
        {/* COLUMN 1: Image */}
        <div className="col">
          <img 
            src={product.image} 
            alt={product.name} 
            style={{ width: '100%', borderRadius: '5px' }} 
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400?text=Image+Not+Found'; }}
          />
        </div>

        {/* COLUMN 2: Details + REVIEWS */}
        <div className="col">
           <h3>{product.name}</h3>
           <p style={{ color: '#555', fontSize: '0.9rem' }}>
              Rating: {product.rating} / 5 ({product.numReviews} reviews)
           </p>
           <hr />
           <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Price: KSh {product.price}</p>
           <hr />
           <p><strong>Description:</strong> {product.description}</p>

           {/* Admin Quick-Edit Button */}
           {userInfo && userInfo.isAdmin && (
             <div style={{ marginTop: '20px', marginBottom: '20px' }}>
               <Link 
                 to={`/admin/product/${product._id}/edit`} 
                 style={{
                   display: 'block',
                   width: '100%',
                   padding: '10px',
                   backgroundColor: '#f39c12',
                   color: '#fff',
                   textAlign: 'center',
                   borderRadius: '5px',
                   textDecoration: 'none',
                   fontWeight: 'bold',
                   boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                 }}
               >
                 ✏️ Quick Edit Product
               </Link>
             </div>
           )}

           <div style={{ marginTop: '40px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
              <h2>Reviews</h2>
              {product.reviews.length === 0 && <div style={{ padding: '10px', background: '#e9ecef' }}>No Reviews</div>}
              
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {product.reviews.map((review) => (
                  <li key={review._id} style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                    <strong>{review.name}</strong>
                    <div style={{ color: '#ffc107' }}>
                       {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </div>
                    <p>{review.createdAt.substring(0, 10)}</p>
                    <p>{review.comment}</p>
                  </li>
                ))}
              </ul>

              {/* Rate Product Area - HIDDEN FROM ADMIN */}
              {!userInfo?.isAdmin && (
                <div style={{ marginTop: '30px' }}>
                  <h2>Rate this Product</h2>
                  {userInfo ? (
                    <div>
                      <p>Click a star to write a review:</p>
                      <div style={{ fontSize: '2rem', cursor: 'pointer' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            style={{ color: star <= (hoverRating || rating) ? '#ffc107' : '#e4e5e9', transition: 'color 0.2s' }}
                            onClick={() => handleStarClick(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '10px', background: '#f8d7da' }}>
                      Please <Link to="/login">sign in</Link> to write a review
                    </div>
                  )}
                </div>
              )}
           </div>
        </div>

        {/* COLUMN 3: Add To Cart Card - HIDDEN FROM ADMIN */}
        {!userInfo?.isAdmin && (
          <div className="col">
            <div className="card" style={{ padding: '20px' }}>
              <p>Price: <strong>KSh {product.price}</strong></p>
              <p>Status: {product.countInStock > 0 ? 'In Stock' : 'Out Of Stock'}</p>
              
              {product.countInStock > 0 && product.countInStock <= 5 && (
                <div style={{ 
                  marginTop: '10px', 
                  padding: '10px', 
                  backgroundColor: '#fff3cd', 
                  color: '#856404', 
                  border: '1px solid #ffeeba',
                  borderRadius: '5px',
                  fontSize: '0.9rem',
                  textAlign: 'center'
                }}>
                  🔥 Hurry! Only <strong>{product.countInStock}</strong> left in stock.
                </div>
              )}

              <button 
                  className="btn-black" 
                  onClick={addToCartHandler}
                  disabled={product.countInStock === 0}
                  style={{ 
                      width: '100%', 
                      padding: '10px', 
                      background: product.countInStock === 0 ? '#ccc' : 'black', 
                      color: 'white', 
                      border: 'none', 
                      cursor: product.countInStock === 0 ? 'not-allowed' : 'pointer',
                      marginTop: '10px'
                  }}
              >
                  {product.countInStock === 0 ? 'Out of Stock' : 'Add To Cart'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* REVIEW MODAL (POPUP) */}
      {showReviewModal && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <h3>You rated it {rating} Stars</h3>
            <p>Tell us more about your experience!</p>
            
            <form onSubmit={submitReviewHandler}>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your review here..."
                style={{ width: '100%', padding: '10px', marginTop: '10px', height: '100px', borderRadius: '5px', border: '1px solid #ddd' }}
                required
              ></textarea>

              <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setShowReviewModal(false)}
                  style={{ padding: '10px 20px', background: '#eee', border: 'none', cursor: 'pointer', borderRadius: '5px' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loadingReview}
                  style={{ padding: '10px 20px', background: 'black', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px' }}
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '10px',
    width: '90%',
    maxWidth: '500px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
  },
};

export default ProductScreen;