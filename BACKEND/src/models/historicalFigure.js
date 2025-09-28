const mongoose = require('mongoose');

const historicalFigureSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    unique: true
  },
  period: { 
    type: String, 
    required: true 
  },
  bio: { 
    type: String, 
    required: true 
  },
  mainImage: { 
    type: String, 
    required: true 
  },
  podcast: [{ 
    title: String,
    audioUrl: String,
    duration: Number 
  }],
  gallery: [String] 
}, {
  timestamps: true
});

module.exports = mongoose.model('HistoricalFigure', historicalFigureSchema);