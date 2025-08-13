const mongoose = require('mongoose');

const pendingUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  verificationToken: {
    type: String,
    required: true,
    unique: true,
  },
  verificationExpires: {
    type: Date,
    required: true,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PendingUser', pendingUserSchema); 