const mongoose = require('mongoose');

const bannerSchema = mongoose.Schema(
  {
    message: { type: String, required: true },
    isActive: { type: Boolean, default: false },
    backgroundColor: { type: String, default: '#000000' },
    textColor: { type: String, default: '#ffffff' },
  },
  { timestamps: true }
);

const Banner = mongoose.model('Banner', bannerSchema);
module.exports = Banner;