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
  ratings: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
      rating: { type: Number, required: true }
    }
  ]
});

module.exports = mongoose.model('Product', productSchema); 