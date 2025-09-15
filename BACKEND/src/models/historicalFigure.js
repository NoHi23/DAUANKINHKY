const mongoose = require('mongoose');

const historicalFigureSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    unique: true
  },
  period: { // Thời kỳ/Giai đoạn lịch sử
    type: String, 
    required: true 
  },
  bio: { // Tiểu sử, mô tả chi tiết
    type: String, 
    required: true 
  },
  mainImage: { // Ảnh chân dung hoặc ảnh chính
    type: String, 
    required: true 
  },
  podcast: [{ // Danh sách các tập podcast liên quan
    title: String,
    audioUrl: String,
    duration: Number // tính bằng giây
  }],
  gallery: [String] // Một album ảnh các hình ảnh liên quan
}, {
  timestamps: true
});

module.exports = mongoose.model('HistoricalFigure', historicalFigureSchema);