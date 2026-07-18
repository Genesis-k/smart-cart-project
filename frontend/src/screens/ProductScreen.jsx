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

  // Review eligibility
  const [canReview, setCanReview] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(true);

  // Admin reply state (keyed by reviewId)
  const [replyDrafts, setReplyDrafts] = useState({});
  const [savingReviewId, setSavingReviewId] = useState(null);

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

  const fetchEligibility = async () => {
    if (!userInfo) {
      setCheckingEligibility(false);
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`/api/orders/can-review/${productId}`, config);
      setCanReview(data.canReview);
      setAlreadyReviewed(data.alreadyReviewed);
    } catch (err) {
      // Fail closed - don't show the review box if we can't confirm eligibility
      setCanReview(false);
    } finally {
      setCheckingEligibility(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    fetchEligibility();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post(
        `/api/products/${productId}/reviews`,
        { rating, comment },
        config
      );

      setLoadingReview(false);
      setShowReviewModal(false);
      alert('Thanks! Your review has been submitted and is pending approval.');
      setRating(0);
      setComment('');
      fetchEligibility(); // they've now reviewed, hide the box
      fetchProduct();
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting review');
      setLoadingReview(false);
    }
  };

  const approveReviewHandler = async (reviewId) => {
    setSavingReviewId(reviewId);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(
        `/api/products/${productId}/reviews/${reviewId}`,
        { isApproved: true },
        config
      );
      fetchProduct();
    } catch (err) {
      alert(err.response?.data?.message || 'Error approving review');
    } finally {
      setSavingReviewId(null);
    }
  };

  const rejectReviewHandler = async (reviewId) => {
    if (!window.confirm('Remove this review permanently?')) return;
    setSavingReviewId(reviewId);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`/api/products/${productId}/reviews/${reviewId}`, config);
      fetchProduct();
    } catch (err) {
      alert(err.response?.data?.message || 'Error removing review');
    } finally {
      setSavingReviewId(null);
    }
  };

  const saveReplyHandler = async (reviewId) => {
    const reply = replyDrafts[reviewId] ?? '';
    setSavingReviewId(reviewId);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(
        `/api/products/${productId}/reviews/${reviewId}`,
        { reply },
        config
      );
      fetchProduct();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving reply');
    } finally {
      setSavingReviewId(null);
    }
  };

  if (loading) return <h2>Loading...</h2>;
  if (error) return <h2 style={{ color: 'red' }}>{error}</h2>;

  const isAdmin = userInfo?.isAdmin;
  // Customers only ever see approved reviews. Admins see everything so they can moderate.
  const visibleReviews = isAdmin
    ? product.reviews
    : product.reviews.filter((r) => r.isApproved);

  return (
    <>
      <BackButton />

      {/* 2-COLUMN MAIN PRODUCT LAYOUT */}
      <div style={styles.gridContainer}>
        {/* COLUMN 1: Image (Left Side) */}
        <div style={styles.imageColumn}>
          <img
            src={product.image}
            alt={product.name}
            style={styles.productImage}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/600x600?text=Image+Not+Found';
            }}
          />
        </div>

        {/* COLUMN 2: Details & Actions (Right Side) */}
        <div style={styles.detailsColumn}>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '10px', marginTop: 0 }}>
            {product.name}
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ color: '#ffc107', fontSize: '1.2rem' }}>
              {'★'.repeat(Math.round(product.rating || 0))}
              {'☆'.repeat(5 - Math.round(product.rating || 0))}
            </div>
            <span style={{ color: '#666', fontSize: '0.95rem' }}>
              {product.rating} / 5 ({product.numReviews} reviews)
            </span>
          </div>

          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a1a1a', margin: '0 0 20px 0' }}>
            KSh {product.price?.toLocaleString()}
          </p>

          <p style={{ fontSize: '1.05rem', lineHeight: '1.6', color: '#444', marginBottom: '30px' }}>
            <strong>Description:</strong>
            <br />
            {product.description}
          </p>

          <div style={styles.actionBox}>
            {isAdmin ? (
              <Link to={`/admin/product/${product._id}/edit`} style={styles.adminEditBtn}>
                ✏️ Quick Edit Product
              </Link>
            ) : (
              <>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '15px',
                    fontSize: '1.1rem',
                  }}
                >
                  <span>Status:</span>
                  <strong style={{ color: product.countInStock > 0 ? '#27ae60' : '#e74c3c' }}>
                    {product.countInStock > 0 ? 'In Stock' : 'Out Of Stock'}
                  </strong>
                </div>

                {product.countInStock > 0 && product.countInStock <= 5 && (
                  <div style={styles.lowStockWarning}>
                    🔥 Hurry! Only <strong>{product.countInStock}</strong> left in stock.
                  </div>
                )}

                <button
                  onClick={addToCartHandler}
                  disabled={product.countInStock === 0}
                  style={{
                    ...styles.addToCartBtn,
                    background: product.countInStock === 0 ? '#ccc' : '#000',
                    cursor: product.countInStock === 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  {product.countInStock === 0 ? 'Out of Stock' : 'Add To Cart'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* FULL WIDTH REVIEWS SECTION (Bottom) */}
      <div style={styles.reviewsSection}>
        <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
          Customer Reviews
        </h2>

        {visibleReviews.length === 0 ? (
          <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px', color: '#666' }}>
            No reviews yet. Be the first to share your thoughts!
          </div>
        ) : (
          <div style={styles.reviewsGrid}>
            {visibleReviews.map((review) => (
              <div
                key={review._id}
                style={{
                  ...styles.reviewCard,
                  ...(isAdmin && !review.isApproved ? styles.pendingReviewCard : {}),
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <strong style={{ fontSize: '1.1rem' }}>{review.name}</strong>
                  <span style={{ color: '#888', fontSize: '0.9rem' }}>
                    {review.createdAt?.substring(0, 10)}
                  </span>
                </div>
                <div style={{ color: '#ffc107', marginBottom: '10px' }}>
                  {'★'.repeat(review.rating)}
                  {'☆'.repeat(5 - review.rating)}
                </div>
                <p style={{ color: '#444', lineHeight: '1.5', margin: 0 }}>{review.comment}</p>

                {review.reply && (
                  <div style={styles.replyBox}>
                    <strong style={{ fontSize: '0.9rem' }}>Seller reply:</strong>
                    <p style={{ margin: '5px 0 0 0', color: '#555' }}>{review.reply}</p>
                  </div>
                )}

                {isAdmin && (
                  <div style={styles.adminReviewControls}>
                    {!review.isApproved && (
                      <span style={styles.pendingBadge}>Pending approval</span>
                    )}

                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      {!review.isApproved && (
                        <button
                          onClick={() => approveReviewHandler(review._id)}
                          disabled={savingReviewId === review._id}
                          style={styles.approveBtn}
                        >
                          {savingReviewId === review._id ? '...' : 'Approve'}
                        </button>
                      )}
                      <button
                        onClick={() => rejectReviewHandler(review._id)}
                        disabled={savingReviewId === review._id}
                        style={styles.rejectBtn}
                      >
                        Remove
                      </button>
                    </div>

                    <textarea
                      placeholder="Write a reply as the seller..."
                      value={replyDrafts[review._id] ?? review.reply ?? ''}
                      onChange={(e) =>
                        setReplyDrafts((prev) => ({ ...prev, [review._id]: e.target.value }))
                      }
                      style={styles.replyInput}
                    />
                    <button
                      onClick={() => saveReplyHandler(review._id)}
                      disabled={savingReviewId === review._id}
                      style={styles.saveReplyBtn}
                    >
                      {savingReviewId === review._id ? 'Saving...' : 'Save Reply'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Rate Product Area - HIDDEN FROM ADMIN, only shown to eligible customers */}
        {!isAdmin && (
          <div style={styles.addReviewBox}>
            <h3 style={{ marginTop: 0 }}>Rate this Product</h3>

            {!userInfo ? (
              <div
                style={{
                  padding: '15px',
                  background: '#fff3cd',
                  color: '#856404',
                  borderRadius: '5px',
                  border: '1px solid #ffeeba',
                }}
              >
                Please{' '}
                <Link to="/login" style={{ fontWeight: 'bold', color: '#856404' }}>
                  sign in
                </Link>{' '}
                to write a review.
              </div>
            ) : checkingEligibility ? (
              <p style={{ color: '#666' }}>Checking your order history...</p>
            ) : alreadyReviewed ? (
              <p style={{ color: '#666' }}>You've already reviewed this product. Thanks!</p>
            ) : canReview ? (
              <div>
                <p style={{ marginBottom: '10px', color: '#555' }}>Click a star to write a review:</p>
                <div style={{ fontSize: '2.5rem', cursor: 'pointer', display: 'inline-block' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      style={{
                        color: star <= (hoverRating || rating) ? '#ffc107' : '#e4e5e9',
                        transition: 'color 0.2s',
                      }}
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
              <p style={{ color: '#666' }}>
                Reviews can only be written once your order for this product has been delivered.
              </p>
            )}
          </div>
        )}
      </div>

      {/* REVIEW MODAL (POPUP) */}
      {showReviewModal && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <h3 style={{ marginTop: 0 }}>You rated it {rating} Stars</h3>
            <p style={{ color: '#666' }}>Tell us more about your experience!</p>

            <form onSubmit={submitReviewHandler}>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your review here..."
                style={{
                  width: '100%',
                  padding: '15px',
                  marginTop: '10px',
                  height: '120px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
                required
              ></textarea>

              <div style={{ marginTop: '20px', display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  style={{
                    padding: '10px 20px',
                    background: '#f8f9fa',
                    border: '1px solid #ddd',
                    cursor: 'pointer',
                    borderRadius: '5px',
                    fontWeight: 'bold',
                    color: '#333',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingReview}
                  style={{
                    padding: '10px 20px',
                    background: '#000',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '5px',
                    fontWeight: 'bold',
                  }}
                >
                  {loadingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

// --- STYLES ---
const styles = {
  gridContainer: { display: 'flex', flexWrap: 'wrap', gap: '50px', marginTop: '20px' },
  imageColumn: { flex: '1 1 400px', maxWidth: '600px' },
  productImage: {
    width: '100%',
    height: 'auto',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    objectFit: 'cover',
  },
  detailsColumn: { flex: '1 1 400px', display: 'flex', flexDirection: 'column' },
  actionBox: { backgroundColor: '#f8f9fa', padding: '25px', borderRadius: '12px', border: '1px solid #eee' },
  adminEditBtn: {
    display: 'block',
    width: '100%',
    padding: '15px',
    backgroundColor: '#f39c12',
    color: '#fff',
    textAlign: 'center',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    transition: 'background 0.2s',
    boxSizing: 'border-box',
  },
  lowStockWarning: {
    marginBottom: '15px',
    padding: '12px',
    backgroundColor: '#fff3cd',
    color: '#856404',
    border: '1px solid #ffeeba',
    borderRadius: '8px',
    fontSize: '0.95rem',
    textAlign: 'center',
  },
  addToCartBtn: {
    width: '100%',
    padding: '15px',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    transition: 'opacity 0.2s',
  },
  reviewsSection: { marginTop: '60px', paddingTop: '30px' },
  reviewsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  reviewCard: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '10px',
    border: '1px solid #eee',
    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
  },
  pendingReviewCard: { border: '1px solid #f39c12', backgroundColor: '#fffdf7' },
  replyBox: { marginTop: '15px', padding: '12px', backgroundColor: '#f4f6f8', borderRadius: '8px' },
  adminReviewControls: { marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed #ddd' },
  pendingBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    backgroundColor: '#fff3cd',
    color: '#856404',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
  },
  approveBtn: {
    padding: '8px 14px',
    background: '#27ae60',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  rejectBtn: {
    padding: '8px 14px',
    background: '#e74c3c',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  replyInput: {
    width: '100%',
    marginTop: '10px',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    resize: 'vertical',
    minHeight: '60px',
  },
  saveReplyBtn: {
    marginTop: '8px',
    padding: '8px 14px',
    background: '#000',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  addReviewBox: { marginTop: '40px', padding: '30px', backgroundColor: '#f8f9fa', borderRadius: '12px', border: '1px solid #eee' },
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
    borderRadius: '12px',
    width: '90%',
    maxWidth: '500px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
  },
};

export default ProductScreen;