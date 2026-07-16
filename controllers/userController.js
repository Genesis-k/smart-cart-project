const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password))) {
    generateToken(res, user._id);
    res.json({ _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, phone: user.phone, shippingAddress: user.shippingAddress });
  } else {
    res.status(401); throw new Error('Invalid email or password');
  }
});

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) { res.status(400); throw new Error('User already exists'); }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = await User.create({ name, email, password: hashedPassword });
  if (user) {
    generateToken(res, user._id);
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin });
  } else { res.status(400); throw new Error('Invalid user data'); }
});

const googleAuthUser = asyncHandler(async (req, res) => {
  const { email, name } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    generateToken(res, user._id);
    res.json({ _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, phone: user.phone, shippingAddress: user.shippingAddress });
  } else {
    const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(randomPassword, salt);
    const newUser = await User.create({ name, email, password: hashedPassword });

    if (newUser) {
      generateToken(res, newUser._id);
      res.status(201).json({ _id: newUser._id, name: newUser.name, email: newUser.email, isAdmin: newUser.isAdmin });
    } else {
      res.status(400); throw new Error('Invalid user data from Google');
    }
  }
});

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({ _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, phone: user.phone, shippingAddress: user.shippingAddress });
  } else { res.status(404); throw new Error('User not found'); }
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone; // Update Phone

    // Update nested shipping address
    if (req.body.shippingAddress) {
      user.shippingAddress = {
        address: req.body.shippingAddress.address || user.shippingAddress?.address,
        city: req.body.shippingAddress.city || user.shippingAddress?.city,
        postalCode: req.body.shippingAddress.postalCode || user.shippingAddress?.postalCode,
        country: req.body.shippingAddress.country || user.shippingAddress?.country,
      };
    }

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }
    const updatedUser = await user.save();
    res.json({ _id: updatedUser._id, name: updatedUser.name, email: updatedUser.email, isAdmin: updatedUser.isAdmin, phone: updatedUser.phone, shippingAddress: updatedUser.shippingAddress });
  } else { res.status(404); throw new Error('User not found'); }
});

const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ message: 'Logged out successfully' });
});

// --- WISHLIST LOGIC ---
const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist');
  if (user) {
    res.json(user.wishlist);
  } else {
    res.status(404); throw new Error('User not found');
  }
});

const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const user = await User.findById(req.user._id);

  if (user) {
    const alreadyExists = user.wishlist.find(id => id.toString() === productId);
    if (alreadyExists) {
      user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
      await user.save();
      res.json({ message: 'Removed from wishlist', action: 'removed' });
    } else {
      user.wishlist.push(productId);
      await user.save();
      res.json({ message: 'Added to wishlist', action: 'added' });
    }
  } else {
    res.status(404); throw new Error('User not found');
  }
});

module.exports = { authUser, registerUser, getUserProfile, updateUserProfile, logoutUser, getWishlist, toggleWishlist, googleAuthUser };