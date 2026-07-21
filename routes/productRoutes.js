const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  createProductReview,
  getTopProducts,
  getLowStockProducts, // Import
  getAllReviews, // Import
  updateReviewStatus, // Import
  deleteReview, // Import
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

// General Product Routes
router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

// Top Products
router.get('/top', getTopProducts);

// Low Stock Products (admin restock reminder) - must be before /:id
router.get('/low-stock', protect, admin, getLowStockProducts);

// NEW: Admin Review Management Routes
// Get ALL reviews (Must be before /:id)
router.get('/reviews/all', protect, admin, getAllReviews);

// Manage specific reviews (Approve/Reply/Delete)
router.route('/:id/reviews/:reviewId')
  .put(protect, admin, updateReviewStatus)
  .delete(protect, admin, deleteReview);

// Public Review Route (Submit)
router.route('/:id/reviews').post(protect, createProductReview);

// Specific Product Routes
router.route('/:id')
  .get(getProductById)
  .delete(protect, admin, deleteProduct)
  .put(protect, admin, updateProduct);

module.exports = router;