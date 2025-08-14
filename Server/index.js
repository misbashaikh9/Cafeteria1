const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const userModel = require('./models/Customer');
const productModel = require('./models/Product');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_jwt_secret_key'; // In production, use env variable
const cartModel = require('./models/Cart');
const Order = require('./models/Order');
const nodemailer = require('nodemailer');
const Customer = require('./models/Customer');
const Feedback = require('./models/Feedback');
const Wishlist = require('./models/Wishlist');
const bcrypt = require('bcryptjs');



const app = express();
app.use(express.json());
app.use(cors());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));
app.use('/images', express.static('images'));

// Static assets are served by React frontend from public folder

// Serve default avatar
app.get('/default-avatar.svg', (req, res) => {
  res.sendFile(path.join(__dirname, 'default-avatar.svg'));
});

// JWT middleware
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

function requireAdmin(req, res, next) {
  if (!req.user?.userId) return res.status(401).json({ error: 'Unauthorized' });
  Customer.findById(req.user.userId)
    .select('isAdmin')
    .then(doc => {
      if (!doc || !doc.isAdmin) return res.status(403).json({ error: 'Admin access required' });
      next();
    })
    .catch(() => res.status(500).json({ error: 'Failed to verify admin' }));
}

// 🔌 MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/Cafeteria')
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// 🚀 Signup Route
app.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await userModel.create({ name, email, password: hashedPassword });

    // Generate JWT
    const token = jwt.sign({ userId: newUser._id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });

    // 🛠️ Updated Response to match frontend expectations
    return res.status(201).json({
      message: "Signup successful",
      username: newUser.name,
      userId: newUser._id,
      isAdmin: newUser.isAdmin === true,
      token,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});


// 🔐 Signin Route
app.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user has hashed password (new users) or plain password (old users)
    let isValidPassword = false;
    if (user.password.startsWith('$2')) {
      // Hashed password
      isValidPassword = await bcrypt.compare(password, user.password);
    } else {
      // Plain password (for backward compatibility)
      isValidPassword = user.password === password;
    }

    if (!isValidPassword) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    // ✅ Send proper data for frontend
    return res.status(200).json({
      username: user.name,
      userId: user._id,
      isAdmin: user.isAdmin === true,
      token,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});



// 🛒 Get All Products (Menu Items)
app.get('/products', async (req, res) => {
  try {
    const products = await productModel.find();
    // Add ratingsCount to each product
    const productsWithCount = products.map(p => {
      const obj = p.toObject();
      obj.ratingsCount = p.ratings ? p.ratings.length : 0;
      return obj;
    });
    res.status(200).json(productsWithCount);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// ⭐ Rate a Product (only for logged-in users)
app.post('/products/:id/rate', authenticateJWT, async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.userId;
    const { rating } = req.body;
    if (!userId || typeof rating !== 'number') {
      return res.status(400).json({ error: 'userId and rating are required' });
    }
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    // Remove previous rating by this user if exists
    product.ratings = product.ratings.filter(r => r.userId.toString() !== userId);
    // Add new rating
    product.ratings.push({ userId, rating });
    // Recalculate average rating
    const avg = product.ratings.reduce((sum, r) => sum + r.rating, 0) / product.ratings.length;
    product.rating = Math.round(avg * 10) / 10;
    await product.save();
    res.status(200).json({ rating: product.rating, ratingsCount: product.ratings.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to rate product' });
  }
});

// ❌ Remove a user's rating for a product
app.delete('/products/:id/rate', authenticateJWT, async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.userId;
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    // Remove the user's rating
    product.ratings = product.ratings.filter(r => r.userId.toString() !== userId);
    // Recalculate average rating
    if (product.ratings.length > 0) {
      const avg = product.ratings.reduce((sum, r) => sum + r.rating, 0) / product.ratings.length;
      product.rating = Math.round(avg * 10) / 10;
    } else {
      product.rating = 0;
    }
    await product.save();
    res.status(200).json({ rating: product.rating, ratingsCount: product.ratings.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove rating' });
  }
});

// 💖 WISHLIST ROUTES

// Get user's wishlist
app.get('/wishlist', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const wishlist = await Wishlist.find({ userId }).populate('productId');
    res.status(200).json(wishlist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// Add item to wishlist
app.post('/wishlist', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Check if product exists
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if already in wishlist
    const existingWishlistItem = await Wishlist.findOne({ userId, productId });
    if (existingWishlistItem) {
      return res.status(409).json({ error: 'Product already in wishlist' });
    }

    const wishlistItem = await Wishlist.create({ userId, productId });
    const populatedItem = await Wishlist.findById(wishlistItem._id).populate('productId');
    
    res.status(201).json(populatedItem);
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Product already in wishlist' });
    }
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

// Remove item from wishlist
app.delete('/wishlist/:productId', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;

    const deletedItem = await Wishlist.findOneAndDelete({ userId, productId });
    if (!deletedItem) {
      return res.status(404).json({ error: 'Wishlist item not found' });
    }

    res.status(200).json({ message: 'Removed from wishlist' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

// Check if product is in user's wishlist
app.get('/wishlist/check/:productId', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;

    const wishlistItem = await Wishlist.findOne({ userId, productId });
    res.status(200).json({ inWishlist: !!wishlistItem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to check wishlist status' });
  }
});

// 🛒 Get current user's cart
app.get('/cart', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    let cart = await cartModel.findOne({ userId }).populate('items.productId');
    if (!cart) {
      cart = await cartModel.create({ userId, items: [] });
    }
    res.status(200).json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// 🛒 Update current user's cart
app.post('/cart', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { items } = req.body; // [{ productId, quantity }]
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items must be an array' });
    }
    if (items.length === 0) {
      // If items is empty, delete the cart document
      await cartModel.deleteOne({ userId });
      return res.status(200).json({ items: [] });
    }
    const cart = await cartModel.findOneAndUpdate(
      { userId },
      { items, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    res.status(200).json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// Nodemailer transporter for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'bh.cafe712@gmail.com',
    pass: 'lzhs ahan zbjg yzso'
  }
});

// Place a new order
app.post('/orders', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { items, address, phone } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must have at least one item.' });
    }
    if (!address || !phone) {
      return res.status(400).json({ error: 'Address and phone are required.' });
    }
    
    // Instead of saving order immediately, just validate and return order data
    // The order will be saved only after successful payment
    const orderData = {
      userId,
      items: items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      address,
      phone,
      totalAmount: items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };
    
    // Return order data for payment processing
    res.status(200).json({ 
      message: 'Order validated successfully!', 
      orderData 
    });
  } catch (err) {
    console.error('❌ Order validation failed:', err);
    res.status(500).json({ 
      error: 'Failed to validate order.',
      details: err.message 
    });
  }
});

// Save feedback for an order
app.post('/feedback', authenticateJWT, async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;
    const userId = req.user.userId; // Changed from req.user.id to req.user.userId
    
    if (!orderId || !rating) {
      return res.status(400).json({ error: 'Order ID and rating are required.' });
    }
    
    // Prevent duplicate feedback for the same order/user
    const existing = await Feedback.findOne({ orderId, userId });
    if (existing) {
      return res.status(400).json({ error: 'Feedback already submitted for this order.' });
    }
    
    const feedback = new Feedback({ orderId, userId, rating, comment });
    await feedback.save();

    // Find all products in this order and update their ratings
    try {
      const order = await Order.findById(orderId);
      if (order && order.items && order.items.length > 0) {
        for (const item of order.items) {
          if (item.productId) {
            // Find all orders containing this product
            const ordersWithProduct = await Order.find({ 'items.productId': item.productId }).select('_id');
            const orderIds = ordersWithProduct.map(o => o._id);
            
            // Find all feedbacks for these orders
            const feedbacks = await Feedback.find({ 
              orderId: { $in: orderIds }, 
              rating: { $gte: 1 } 
            });
            
            // Get the current product to preserve existing fake data
            const currentProduct = await productModel.findById(item.productId);
            if (!currentProduct) continue;
            
            // Calculate new average by combining existing fake data with new feedback
            let totalRating = 0;
            let totalReviews = 0;
            
            // Add existing fake rating data (weighted by review count)
            if (currentProduct.averageRating && currentProduct.reviewCount) {
              totalRating += (currentProduct.averageRating * currentProduct.reviewCount);
              totalReviews += currentProduct.reviewCount;
            }
            
            // Add new feedback
            if (feedbacks.length > 0) {
              const feedbackSum = feedbacks.reduce((acc, f) => acc + (f.rating || 0), 0);
              totalRating += feedbackSum;
              totalReviews += feedbacks.length;
            }
            
            // Calculate new average
            if (totalReviews > 0) {
              const newAverageRating = Math.round((totalRating / totalReviews) * 10) / 10;
              const newReviewCount = totalReviews;
              
              // Update product document
              await productModel.findByIdAndUpdate(item.productId, {
                averageRating: newAverageRating,
                reviewCount: newReviewCount
              });
            }
          }
        }
      }
    } catch (updateError) {
      console.error('Error updating product ratings:', updateError);
      // Don't fail the feedback submission if rating update fails
    }

    res.status(201).json({ message: 'Feedback submitted!', feedback });
  } catch (err) {
    console.error('Failed to submit feedback:', err);
    res.status(500).json({ error: 'Failed to submit feedback.' });
  }
});

// Save individual product review
app.post('/product-review', authenticateJWT, async (req, res) => {
  try {
    const { productId, orderId, rating, comment } = req.body;
    const userId = req.user.userId;
    
    if (!productId || !orderId || !rating) {
      return res.status(400).json({ error: 'Product ID, Order ID, and rating are required.' });
    }
    
    // Check if user has already reviewed this product from this order
    const existing = await Feedback.findOne({ 
      orderId, 
      userId, 
      productId 
    });
    
    if (existing) {
      return res.status(400).json({ error: 'You have already reviewed this product from this order.' });
    }
    
    // Create new product review
    const productReview = new Feedback({ 
      orderId, 
      userId, 
      productId, 
      rating, 
      comment 
    });
    
    await productReview.save();

    // Update product's average rating and review count
    try {
      // Find all reviews for this product
      const productReviews = await Feedback.find({ 
        productId, 
        rating: { $gte: 1 } 
      });
      
      // Get the current product to preserve existing fake data
      const currentProduct = await productModel.findById(productId);
      if (!currentProduct) return;
      
      // Calculate new average by combining existing fake data with new reviews
      let totalRating = 0;
      let totalReviews = 0;
      
      // Add existing fake rating data (weighted by review count)
      if (currentProduct.averageRating && currentProduct.reviewCount) {
        totalRating += (currentProduct.averageRating * currentProduct.reviewCount);
        totalReviews += currentProduct.reviewCount;
      }
      
      // Add new real reviews
      if (productReviews.length > 0) {
        const newReviewsSum = productReviews.reduce((acc, r) => acc + (r.rating || 0), 0);
        totalRating += newReviewsSum;
        totalReviews += productReviews.length;
      }
      
      // Calculate new average
      if (totalReviews > 0) {
        const newAverageRating = Math.round((totalRating / totalReviews) * 10) / 10;
        const newReviewCount = totalReviews;
        
        // Update product document
        await productModel.findByIdAndUpdate(productId, {
          averageRating: newAverageRating,
          reviewCount: newReviewCount
        });
      }
    } catch (updateError) {
      console.error('Error updating product rating:', updateError);
      // Don't fail the review submission if rating update fails
    }

    res.status(201).json({ message: 'Product review submitted!', review: productReview });
  } catch (err) {
    console.error('Failed to submit product review:', err);
    res.status(500).json({ error: 'Failed to submit product review.' });
  }
});

// Get all orders for the authenticated user
app.get('/orders', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

// Get a single order by ID for the authenticated user
app.get('/orders/:id', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const orderId = req.params.id;
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    res.status(200).json({ order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch order.' });
  }
});

// Get profile info for the authenticated user
app.get('/profile', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await Customer.findById(userId).select('name email phone address city state pincode profileImage preferences');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
});

// Update profile info for the authenticated user
app.put('/profile', authenticateJWT, upload.single('profileImage'), async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, phone, address, city, state, pincode, preferences } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required.' });
    }

    const update = { 
      name: name.trim(),
      phone: phone || '',
      address: address || '',
      city: city || '',
      state: state || '',
      pincode: pincode || ''
    };

    // Handle preferences
    if (preferences) {
      try {
        let prefs = preferences;
        if (typeof preferences === 'string') {
          prefs = JSON.parse(preferences);
        }
        update.preferences = {
          emailNotifications: prefs.emailNotifications !== undefined ? prefs.emailNotifications : true,
          smsNotifications: prefs.smsNotifications !== undefined ? prefs.smsNotifications : false,
          newsletter: prefs.newsletter !== undefined ? prefs.newsletter : true,
          darkMode: prefs.darkMode !== undefined ? prefs.darkMode : false
        };
      } catch (e) {
        console.error('Error parsing preferences:', e);
      }
    }

    // Handle profile image upload
    if (req.file) {
      update.profileImage = `/uploads/${req.file.filename}`;
    }

    const user = await Customer.findByIdAndUpdate(userId, update, { 
      new: true, 
      select: 'name email phone address city state pincode profileImage preferences' 
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// Change password route
app.put('/profile/password', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { password, newPassword } = req.body;
    
    if (!password || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at lest 6 characters.' });
    }

    const user = await Customer.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to change password.' });
  }
});

// Get user's reviews/feedback
app.get('/reviews', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const reviews = await Feedback.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
});

// Get product reviews
app.get('/product-reviews/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Get current product info
    const product = await productModel.findById(productId).select('averageRating reviewCount name');
    
    // Get reviews
    const reviews = await Feedback.find({ 
      productId, 
      rating: { $gte: 1 } 
    })
    .populate('userId', 'name')
    .sort({ createdAt: -1 })
    .limit(10); // Limit to recent 10 reviews
    
    res.status(200).json({ 
      reviews,
      productInfo: {
        averageRating: product?.averageRating || 0,
        reviewCount: product?.reviewCount || 0,
        name: product?.name || 'Product'
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch product reviews.' });
  }
});

// Test email notification endpoint
app.post('/test-email', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await Customer.findById(userId);
    
    if (!user?.email) {
      return res.status(400).json({ error: 'User email not found.' });
    }

    // Send test email
    await transporter.sendMail({
      from: 'bh.cafe712@gmail.com',
      to: user.email,
      subject: 'Brew Haven - Test Email Notification',
      html: `
        <h2>Test Email Notification</h2>
        <p>Hello ${user.name},</p>
        <p>This is a test email to confirm that your email notifications are working properly.</p>
        <p>If you received this email, your notification settings are configured correctly!</p>
        <p>Best regards,<br>Brew Haven Team ☕</p>
      `
    });

    res.status(200).json({ message: 'Test email sent successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send test email.' });
  }
});

// 💳 Demo Payment Integration
app.post('/create-payment-intent', authenticateJWT, async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required.' });
    }

    // Simulate payment intent creation
    const paymentIntent = {
      id: 'pi_' + Math.random().toString(36).substr(2, 9),
      amount: amount,
      currency: currency,
      status: 'requires_payment_method',
      client_secret: 'pi_' + Math.random().toString(36).substr(2, 9) + '_secret_' + Math.random().toString(36).substr(2, 9),
      created: Math.floor(Date.now() / 1000)
    };

    res.status(200).json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntent: paymentIntent
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create payment intent.' });
  }
});

// Process demo payment
app.post('/process-payment', authenticateJWT, async (req, res) => {
  try {
    const { paymentMethodId, amount, orderData, paymentDetails } = req.body;
    
    if (!paymentMethodId || !amount || !orderData) {
      return res.status(400).json({ error: 'Payment method, amount, and order data are required.' });
    }

    // Validate payment details based on method
    if (paymentMethodId === 'pm_demo_upi' && (!paymentDetails?.upiId || !paymentDetails?.upiName)) {
      return res.status(400).json({ error: 'UPI ID and name are required for UPI payment.' });
    }

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate payment success (90% success rate for demo)
    const isSuccess = Math.random() > 0.1;
    
    if (isSuccess) {
      // Determine payment method for database
      let paymentMethod = 'demo_card';
      if (paymentMethodId === 'pm_demo_upi') {
        paymentMethod = 'upi';
      } else if (paymentMethodId === 'pm_demo_cash') {
        paymentMethod = 'cash';
      }

      // Create order data with payment information
      const orderToSave = {
        ...orderData,
        payment: {
          method: paymentMethod,
          success: true,
          transactionId: 'txn_' + Math.random().toString(36).substr(2, 9),
          amount: amount,
          details: paymentMethodId === 'pm_demo_upi' ? {
          upiId: paymentDetails.upiId,
          upiName: paymentDetails.upiName
        } : {}
        },
        status: paymentMethod === 'cash' ? 'pending' : 'paid',
        paidAt: paymentMethod === 'cash' ? null : new Date()
      };

      // Save order to database only after successful payment
      const order = new Order(orderToSave);
      await order.save();
      
      // Debug: log the whole order object
      console.log('Order object:', order);
      
      console.log('✅ Order saved to database after successful payment:', {
        orderId: order._id,
        userId: order.userId,
        itemsCount: order.items.length,
        paymentMethod: order.payment ? order.payment.method : null,
        status: order.status
      });

      res.status(200).json({ 
        success: true,
        message: 'Payment processed successfully!',
        transactionId: order.payment.transactionId,
        amount: amount,
        paymentMethod: paymentMethod,
        orderId: order._id
      });
    } else {
      res.status(400).json({ 
        success: false,
        error: 'Payment failed. Please try again.',
        code: 'payment_declined'
      });
    }
  } catch (err) {
    console.error('❌ Payment processing failed:', err);
    res.status(500).json({ error: 'Payment processing failed.' });
  }
});

// Get payment methods (demo)
app.get('/payment-methods', authenticateJWT, async (req, res) => {
  try {
    // Demo payment methods
    const paymentMethods = [
      {
        id: 'pm_demo_visa',
        type: 'card',
        card: {
          brand: 'visa',
          last4: '4242',
          exp_month: 12,
          exp_year: 2025
        }
      },
      {
        id: 'pm_demo_mastercard',
        type: 'card',
        card: {
          brand: 'mastercard',
          last4: '5555',
          exp_month: 10,
          exp_year: 2026
        }
      }
    ];

    res.status(200).json({ paymentMethods });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch payment methods.' });
  }
});

// Send order confirmation email
app.post('/send-order-email', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { orderId, items, total, address, phone, payment } = req.body;
    
    const user = await Customer.findById(userId);
    if (!user?.email) {
      return res.status(400).json({ error: 'User email not found.' });
    }

    // Create order items HTML
    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e3e8ee;">
          <img src="http://localhost:3000/${item.image}" alt="${item.name}" style="width: 40px; height: 30px; object-fit: cover; border-radius: 4px; margin-right: 8px;">
          ${item.name}
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #e3e8ee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e3e8ee; text-align: right;">₹${item.price}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e3e8ee; text-align: right;">₹${item.price * item.quantity}</td>
      </tr>
    `).join('');

    // Payment method text
    let paymentMethod = 'Cash on Delivery';
    if (payment?.paymentMethodId === 'pm_demo_card') {
      paymentMethod = 'Credit/Debit Card';
    } else if (payment?.paymentMethodId === 'pm_demo_upi') {
      paymentMethod = 'UPI Payment';
    }

    await transporter.sendMail({
      from: 'bh.cafe712@gmail.com',
      to: user.email,
      subject: `Brew Haven - Order Confirmation #${orderId.slice(-6).toUpperCase()}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f7fafc; padding: 0; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(59,47,47,0.08);">
          <!-- Header -->
          <div style="background: #2d3748; padding: 32px 0 18px 0; text-align: center;">
            <img src="https://i.ibb.co/6b7n6Qw/Cafe-logo.png" alt="Brew Haven Logo" style="height: 60px; margin-bottom: 8px;" />
            <h1 style="color: #fff; margin: 0; font-size: 2.1em; letter-spacing: 2px; font-weight: 700;">Brew Haven</h1>
            <p style="color: #c3dafe; margin: 0; font-size: 1.1em;">Order Confirmation</p>
          </div>

          <!-- Order Details Section -->
          <div style="padding: 28px 24px 18px 24px;">
            <h2 style="color: #2d3748; font-weight: 600; margin-bottom: 10px;">Thank you for your order, ${user.name}! 🎉</h2>
            <div style="color: #3182ce; font-size: 1.1em; margin-bottom: 8px;"><b>Order #${orderId.slice(-6).toUpperCase()}</b></div>
            <div style="color: #718096; font-size: 0.98em; margin-bottom: 18px;">Order Date: ${new Date().toLocaleDateString()} | Estimated Delivery: ${new Date(Date.now() + 40 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            <div style="background: #edf2f7; border-radius: 8px; padding: 16px 18px; margin-bottom: 18px;">
              <strong style="color: #2d3748;">Order Summary</strong>
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                  <tr style="background: #e3e8ee;">
                    <th style="padding: 8px; text-align: left; border-bottom: 2px solid #3182ce;">Item</th>
                    <th style="padding: 8px; text-align: center; border-bottom: 2px solid #3182ce;">Qty</th>
                    <th style="padding: 8px; text-align: right; border-bottom: 2px solid #3182ce;">Price</th>
                    <th style="padding: 8px; text-align: right; border-bottom: 2px solid #3182ce;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              <div style="text-align: right; margin-top: 12px; padding-top: 10px; border-top: 2px solid #3182ce; font-size: 1.1em; color: #3182ce; font-weight: 700;">
                Total: ₹${total}
              </div>
            </div>

            <!-- Delivery Info -->
            <div style="background: #edf2f7; border-radius: 8px; padding: 16px 18px; margin-bottom: 18px;">
              <strong style="color: #2d3748;">Delivery Information</strong>
              <p style="margin: 8px 0 0 0; color: #2d3748;"><b>Address:</b> ${address}</p>
              <p style="margin: 4px 0 0 0; color: #2d3748;"><b>Phone:</b> ${phone}</p>
              <p style="margin: 4px 0 0 0; color: #2d3748;"><b>Payment Method:</b> ${paymentMethod}</p>
              ${payment?.transactionId ? `<p style="margin: 4px 0 0 0; color: #2d3748;"><b>Transaction ID:</b> ${payment.transactionId}</p>` : ''}
              ${payment?.paymentMethod === 'upi' ? `<p style="margin: 4px 0 0 0; color: #2d3748;"><b>UPI ID:</b> ${req.body.paymentDetails?.upiId || 'N/A'}</p>` : ''}
            </div>

            <!-- Payment Status Block -->
            <div style="background: ${payment && payment.paymentMethod === 'cash' && payment.status !== 'paid' ? '#bee3f8' : '#c6f6d5'}; padding: 15px; border-radius: 6px; border-left: 4px solid ${payment && payment.paymentMethod === 'cash' && payment.status !== 'paid' ? '#63b3ed' : '#38a169'}; margin-bottom: 20px;">
              <strong style="color: ${payment && payment.paymentMethod === 'cash' && payment.status !== 'paid' ? '#2b6cb0' : '#276749'};">
                ${payment && payment.paymentMethod === 'cash' && payment.status !== 'paid'
                  ? '⏳ Payment Status: Pending (Cash on Delivery)'
                  : '✅ Payment Status: Paid'}
              </strong><br>
              <small style="color: #4a5568;">
                ${payment && payment.paymentMethod === 'cash' && payment.status !== 'paid'
                  ? 'Please pay with cash when your order is delivered.'
                  : 'Your payment has been processed successfully.'}
              </small>
            </div>

            <div style="text-align: center; color: #4a5568; font-size: 14px; margin-top: 32px;">
              <p>If you have any questions, please contact us at <a href="mailto:support@brewhaven.com" style="color: #3182ce; text-decoration: underline;">support@brewhaven.com</a></p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #2d3748; color: #fff; text-align: center; padding: 18px 0 10px 0; border-radius: 0 0 16px 16px;">
            <div style="font-size: 1.1em; font-weight: 600; letter-spacing: 1px;">Brew Haven</div>
            <div style="margin-top: 8px;">
              <a href="https://instagram.com/" style="display: inline-block; margin: 0 8px; color: #fff; text-decoration: none;">
                <img src="https://cdn-icons-png.flaticon.com/24/2111/2111463.png" alt="Instagram" style="vertical-align: middle; height: 24px;" />
              </a>
              <a href="https://facebook.com/" style="display: inline-block; margin: 0 8px; color: #fff; text-decoration: none;">
                <img src="https://cdn-icons-png.flaticon.com/24/733/733547.png" alt="Facebook" style="vertical-align: middle; height: 24px;" />
              </a>
            </div>
            <div style="margin-top: 8px; font-size: 13px; color: #c3dafe;">&copy; ${new Date().getFullYear()} Brew Haven. All rights reserved.</div>
          </div>
        </div>
      `
    });

    res.status(200).json({ message: 'Order confirmation email sent successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send order confirmation email.' });
  }
});

// === Admin Endpoints ===
// Get basic admin info for current user
app.get('/admin/me', authenticateJWT, async (req, res) => {
  try {
    const me = await Customer.findById(req.user.userId).select('name email isAdmin');
    if (!me) return res.status(404).json({ error: 'User not found' });
    res.json({ isAdmin: me.isAdmin === true, name: me.name, email: me.email });
  } catch (e) {
    res.status(500).json({ error: 'Failed to load admin info' });
  }
});

// List all users (admin)
app.get('/admin/users', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const users = await Customer.find().select('name email isAdmin createdAt');
    res.json({ users });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Promote/demote admin
app.put('/admin/users/:id/role', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const { isAdmin } = req.body;
    const updated = await Customer.findByIdAndUpdate(req.params.id, { isAdmin: !!isAdmin }, { new: true }).select('name email isAdmin');
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json({ user: updated });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// List all orders (admin)
app.get('/admin/orders', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ orders });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update order status (admin)
app.put('/admin/orders/:id/status', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'paid', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ order });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Product CRUD (admin)
app.post('/admin/products', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const created = await productModel.create(req.body);
    res.status(201).json({ product: created });
  } catch (e) {
    res.status(400).json({ error: 'Failed to create product', details: e.message });
  }
});

app.put('/admin/products/:id', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const updated = await productModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json({ product: updated });
  } catch (e) {
    res.status(400).json({ error: 'Failed to update product', details: e.message });
  }
});

app.delete('/admin/products/:id', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const deleted = await productModel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: 'Failed to delete product', details: e.message });
  }
});

// 🚨 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ✅ Start Server
app.listen(3001,'0.0.0.0',() => {
  console.log("🚀 Server running on http://localhost:3001");
});
