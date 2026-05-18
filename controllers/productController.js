const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');

// ... Keep getProducts, getProductById, deleteProduct, createProduct, updateProduct ...
// (I am omitting the existing functions here to save space, but DO NOT DELETE THEM from your file)

const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 8;
  const page = Number(req.query.pageNumber) || 1;
  const keyword = req.query.keyword ? { name: { $regex: req.query.keyword, $options: 'i' } } : {};
  const section = (req.query.section && req.query.section !== 'undefined') ? { section: req.query.section } : {};
  const query = { ...keyword, ...section };
  const count = await Product.countDocuments(query);
  const products = await Product.find(query).limit(pageSize).skip(pageSize * (page - 1));
  res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) { res.json(product); } else { res.status(404); throw new Error('Product not found'); }
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) { await product.deleteOne(); res.json({ message: 'Product removed' }); } else { res.status(404); throw new Error('Product not found'); }
});

const createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    name: 'Sample Name', price: 0, user: req.user._id, image: '/images/sample.jpg', brand: 'Sample Brand', category: 'Sample Category', section: 'Female', countInStock: 0, numReviews: 0, description: 'Sample description',
  });
  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, brand, category, section, countInStock } = req.body;
  const product = await Product.findById(req.params.id);
  if (product) {
    product.name = name; product.price = price; product.description = description; product.image = image; product.brand = brand; product.category = category; product.section = section || product.section; product.countInStock = countInStock;
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else { res.status(404); throw new Error('Product not found'); }
});

// UPDATED: Create new review
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) { res.status(400); throw new Error('Product already reviewed'); }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
      isApproved: false, // Default to false
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review submitted! It will appear after approval.' });
  } else { res.status(404); throw new Error('Product not found'); }
});

const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(3);
  res.json(products);
});

// --- NEW ADMIN REVIEW FUNCTIONS ---

// @desc    Get ALL reviews from ALL products
// @route   GET /api/products/reviews/all
// @access  Private/Admin
const getAllReviews = asyncHandler(async (req, res) => {
  // Use aggregation to unwind the reviews array so we get a flat list
  const reviews = await Product.aggregate([
    { $unwind: '$reviews' },
    {
      $project: {
        _id: 1,
        name: 1, // Product Name
        review: '$reviews',
      },
    },
    { $sort: { 'review.createdAt': -1 } } // Newest first
  ]);
  res.json(reviews);
});

// @desc    Approve or Reply to a review
// @route   PUT /api/products/:id/reviews/:reviewId
// @access  Private/Admin
const updateReviewStatus = asyncHandler(async (req, res) => {
  const { isApproved, reply } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    const review = product.reviews.id(req.params.reviewId);
    if (review) {
      if (isApproved !== undefined) review.isApproved = isApproved;
      if (reply !== undefined) review.reply = reply;
      
      await product.save();
      res.json({ message: 'Review updated' });
    } else {
      res.status(404);
      throw new Error('Review not found');
    }
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a review
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Private/Admin
const deleteReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    // Filter out the review to delete
    product.reviews = product.reviews.filter(
      (r) => r._id.toString() !== req.params.reviewId.toString()
    );
    
    // Recalculate rating
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.length > 0
      ? product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length
      : 0;

    await product.save();
    res.json({ message: 'Review deleted' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

module.exports = {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  createProductReview,
  getTopProducts,
  getAllReviews, // Export
  updateReviewStatus, // Export
  deleteReview, // Export
};