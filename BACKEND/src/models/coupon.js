const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { // Ví dụ: 'SUMMER2025'
    type: String,
    required: true,
    unique: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed_amount'], // Giảm theo % hoặc số tiền cố định
    required: true
  },
  discountValue: {
    type: Number,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Coupon', couponSchema);