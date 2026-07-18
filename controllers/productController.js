const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');
const Order = require('../models/orderModel'); // needed for the delivered-order check

// ... Keep getProducts, getProductById, deleteProduct, createProduct, updateProduct ...
// (unchanged from your version)

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

// Helper: recalculate rating/numReviews from APPROVED reviews only.
// Keeping this in one place means every place that touches reviews stays consistent.
const recalculateApprovedRating = (product) => {
  const approved = product.reviews.filter((r) => r.isApproved);
  product.numReviews = approved.length;
  product.rating = approved.length
    ? approved.reduce((acc, r) => acc + r.rating, 0) / approved.length
    : 0;
};

// Create new review
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Prevent duplicate reviews
  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );
  if (alreadyReviewed) {
    res.status(400);
    throw new Error('You already reviewed this product');
  }

  // Enforce: must have a DELIVERED order containing this product
  const deliveredOrder = await Order.findOne({
    user: req.user._id,
    isDelivered: true,
    'orderItems.product': product._id,
  });
  if (!deliveredOrder) {
    res.status(400);
    throw new Error('You can only review products from delivered orders');
  }

  const review = {
    name: req.user.name,
    rating: Number(rating),
    comment,
    user: req.user._id,
    // isApproved defaults to false via the schema - new reviews start hidden
  };

  product.reviews.push(review);
  recalculateApprovedRating(product); // won't count this new review until it's approved

  await product.save();
  res.status(201).json({ message: 'Review submitted - pending approval' });
});

const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(3);
  res.json(products);
});

// --- ADMIN REVIEW FUNCTIONS ---

// @desc    Get ALL reviews from ALL products
// @route   GET /api/products/reviews/all
// @access  Private/Admin
const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Product.aggregate([
    { $unwind: '$reviews' },
    {
      $project: {
        _id: 1,
        name: 1, // Product Name
        review: '$reviews',
      },
    },
    { $sort: { 'review.createdAt': -1 } }, // Newest first
  ]);
  res.json(reviews);
});

// @desc    Approve/unapprove or reply to a review
// @route   PUT /api/products/:id/reviews/:reviewId
// @access  Private/Admin
const updateReviewStatus = asyncHandler(async (req, res) => {
  const { isApproved, reply } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const review = product.reviews.id(req.params.reviewId);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  if (isApproved !== undefined) review.isApproved = isApproved;
  if (reply !== undefined) review.reply = reply;

  // Recalculate every time, since approving/unapproving changes what counts
  recalculateApprovedRating(product);

  await product.save();
  res.json({ message: 'Review updated' });
});

// @desc    Delete a review
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Private/Admin
const deleteReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  product.reviews = product.reviews.filter(
    (r) => r._id.toString() !== req.params.reviewId.toString()
  );

  recalculateApprovedRating(product);

  await product.save();
  res.json({ message: 'Review deleted' });
});

module.exports = {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  createProductReview,
  getTopProducts,
  getAllReviews,
  updateReviewStatus,
  deleteReview,
};