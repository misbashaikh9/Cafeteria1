const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.Mixed, required: true }, // Can be ObjectId or String/Number for static products
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String }
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  items: [orderItemSchema],
  address: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String, default: 'pending', enum: ['pending', 'paid', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'] },
  payment: {
    method: { type: String, default: 'cash' },
    success: { type: Boolean, default: false },
    transactionId: { type: String },
    amount: { type: Number },
    details: { type: mongoose.Schema.Types.Mixed }
  },
  paidAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema); 

