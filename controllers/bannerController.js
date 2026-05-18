const asyncHandler = require('express-async-handler');
const Banner = require('../models/bannerModel');

// @desc    Get the active banner
// @route   GET /api/banner
const getBanner = asyncHandler(async (req, res) => {
  // We assume there's only one main banner document.
  let banner = await Banner.findOne();
  
  if (!banner) {
    // Create a default one if none exists
    banner = await Banner.create({
      message: 'Welcome to Vivo Fashion!',
      isActive: false
    });
  }
  res.json(banner);
});

// @desc    Update banner
// @route   PUT /api/banner
// @access  Private/Admin
const updateBanner = asyncHandler(async (req, res) => {
  const { message, isActive, backgroundColor, textColor } = req.body;
  
  let banner = await Banner.findOne();

  if (banner) {
    banner.message = message;
    banner.isActive = isActive;
    banner.backgroundColor = backgroundColor;
    banner.textColor = textColor;
    
    const updatedBanner = await banner.save();
    res.json(updatedBanner);
  } else {
    res.status(404);
    throw new Error('Banner not found');
  }
});

module.exports = { getBanner, updateBanner };