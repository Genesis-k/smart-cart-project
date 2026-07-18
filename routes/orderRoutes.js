const express = require('express');
const router = express.Router();
const {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateOrderToUnDelivered,
  getOrders,
  getMyOrders,
  checkCanReview, // <-- this was missing, which caused the crash
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, addOrderItems)
  .get(protect, admin, getOrders);

router.get('/can-review/:productId', protect, checkCanReview);

// IMPORTANT: This route must be ABOVE the /:id route.
router.route('/myorders').get(protect, getMyOrders);

router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);
router.route('/:id/undeliver').put(protect, admin, updateOrderToUnDelivered);

module.exports = router;