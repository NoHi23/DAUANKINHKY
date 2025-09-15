const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  sku: { // Stock Keeping Unit - Mã định danh sản phẩm
    type: String, 
    required: true, 
    unique: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  stockQuantity: { // Số lượng trong kho
    type: Number, 
    required: true, 
    default: 0 
  },
  images: [String], // Danh sách URL các hình ảnh sản phẩm
  historicalFigure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HistoricalFigure',
    required: true
  },
  isActive: { // Dùng để ẩn/hiện sản phẩm
    type: Boolean, 
    default: true 
  },
  // Các trường để hiển thị đánh giá
  averageRating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Product", productSchema);