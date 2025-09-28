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
  stockQuantity: { 
    type: Number, 
    required: true, 
    default: 0 
  },
  images: [String], 
  historicalFigure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HistoricalFigure',
    required: true
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
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