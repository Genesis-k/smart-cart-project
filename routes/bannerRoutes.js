const express = require('express');
const router = express.Router();
const { getBanner, updateBanner } = require('../controllers/bannerController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getBanner)
  .put(protect, admin, updateBanner);

module.exports = router;