const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private
 */
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  } else {
    const order = new Order({
      orderItems: orderItems.map((x) => ({
        ...x,
        product: x._id,
        _id: undefined,
      })),
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  }
});

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

/**
 * @desc    Update order to paid
 * @route   PUT /api/orders/:id/pay
 * @access  Private
 */
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id || 'SIMULATED_MPESA_ID',
      status: req.body.status || 'COMPLETED',
      update_time: req.body.update_time || Date.now(),
      email_address: req.body.email_address || order.user.email,
    };

    const updatedOrder = await order.save();

    for (const index in order.orderItems) {
      const item = order.orderItems[index];
      const product = await Product.findById(item.product);

      if (product) {
        product.countInStock = product.countInStock - item.qty;
        if (product.countInStock < 0) product.countInStock = 0;
        await product.save();
      }
    }

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

/**
 * @desc    Update order to delivered
 * @route   PUT /api/orders/:id/deliver
 * @access  Private/Admin
 */
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

/**
 * @desc    Update order to NOT delivered (Revert)
 * @route   PUT /api/orders/:id/undeliver
 * @access  Private/Admin
 */
const updateOrderToUnDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = false;
    order.deliveredAt = null;

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

/**
 * @desc    Get all orders
 * @route   GET /api/orders
 * @access  Private/Admin
 */
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name');
  res.json(orders);
});

/**
 * @desc    Get logged in user orders
 * @route   GET /api/orders/myorders
 * @access  Private
 */
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

/**
 * @desc    Check if the logged-in user can review a specific product
 * @route   GET /api/orders/can-review/:productId
 * @access  Private
 */
const checkCanReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const alreadyReviewed = await Product.findOne({
    _id: productId,
    'reviews.user': req.user._id,
  });

  const deliveredOrder = await Order.findOne({
    user: req.user._id,
    isDelivered: true,
    'orderItems.product': productId,
  });

  res.json({
    canReview: !!deliveredOrder && !alreadyReviewed,
    alreadyReviewed: !!alreadyReviewed,
  });
});

/**
 * @desc    Get all delivered items belonging to the logged-in user that they
 *          haven't reviewed yet - powers the "please review your purchase" reminder
 * @route   GET /api/orders/reviewable-items
 * @access  Private
 */
const getReviewableItems = asyncHandler(async (req, res) => {
  const deliveredOrders = await Order.find({
    user: req.user._id,
    isDelivered: true,
  });

  // Collect unique products across all of this user's delivered orders
  const productMap = new Map();
  deliveredOrders.forEach((order) => {
    order.orderItems.forEach((item) => {
      productMap.set(item.product.toString(), {
        productId: item.product,
        name: item.name,
        image: item.image,
      });
    });
  });

  const productIds = Array.from(productMap.keys());

  if (productIds.length === 0) {
    return res.json([]);
  }

  // Find which of those products this user has already reviewed
  const alreadyReviewedProducts = await Product.find({
    _id: { $in: productIds },
    'reviews.user': req.user._id,
  }).select('_id');

  const reviewedIds = new Set(alreadyReviewedProducts.map((p) => p._id.toString()));

  const reviewableItems = productIds
    .filter((id) => !reviewedIds.has(id))
    .map((id) => productMap.get(id));

  res.json(reviewableItems);
});

module.exports = {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateOrderToUnDelivered,
  getOrders,
  getMyOrders,
  checkCanReview,
  getReviewableItems,
};