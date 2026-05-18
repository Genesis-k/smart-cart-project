const express = require('express');
const router = express.Router();
const {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  logoutUser,
  getWishlist,
  toggleWishlist,
  googleAuthUser,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.post('/logout', logoutUser);
router.post('/login', authUser);
router.post('/google', googleAuthUser);

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Wishlist Routes
router.route('/wishlist')
  .get(protect, getWishlist)
  .post(protect, toggleWishlist);

module.exports = router;