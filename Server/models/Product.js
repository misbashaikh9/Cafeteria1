const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: false,
    default: 0
  },
  averageRating: {
    type: Number,
    required: false,
    default: 0
  },
  reviewCount: {
    type: Number,
    required: false,
    default: 0
  },
  badge: {
    type: String,
    required: false
  },
  servingSize: {
    type: String,
    required: false
  },
  calories: {
    type: Number,
    required: false
  },
  allergyInfo: {
    type: String,
    required: false
  },
  preparationTime: {
    type: String,
    enum: ['quick', 'regular', 'slow'],
    default: 'regular',
    required: false
  }
});

module.exports = mongoose.model('Product', productSchema); 