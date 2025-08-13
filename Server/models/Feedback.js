const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // Optional for backward compatibility
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema); 