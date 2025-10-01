const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: { type: Object, required: true }, // Sao chép thông tin sản phẩm tại thời điểm mua
    quantity: { type: Number, required: true },
    price: { type: Number, required: true } // Ghi lại giá tại thời điểm đặt hàng
  }],
  shippingAddress: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  subTotal: { // Tổng tiền hàng
    type: Number, 
    required: true 
  },
  shippingFee: { // Phí vận chuyển
    type: Number, 
    required: true, 
    default: 0 
  },
  discountAmount: { // Số tiền được giảm
    type: Number,
    default: 0
  },
  totalAmount: { // Tổng tiền cuối cùng phải trả
    type: Number, 
    required: true 
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'VIETQR'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Order", orderSchema);