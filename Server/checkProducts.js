const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect('mongodb://127.0.0.1:27017/Cafeteria', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkProducts() {
  try {
    // Check current products
    const currentProducts = await Product.find({});
    console.log(`📊 Current products in database: ${currentProducts.length}`);
    
    if (currentProducts.length > 0) {
      console.log('\n📋 Current products:');
      currentProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} (${product.category}) - ${product.image} - $${product.price}`);
      });
      
      // Show category breakdown
      const categoryCount = {};
      currentProducts.forEach(product => {
        categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
      });
      
      console.log('\n📊 Category breakdown:');
      Object.entries(categoryCount).forEach(([category, count]) => {
        console.log(`  ${category}: ${count} products`);
      });
    } else {
      console.log('📭 No products found in database');
    }
    
    // Ask user if they want to clear (in real usage, you'd use command line args)
    console.log('\n🗑️ Clearing all products...');
    await Product.deleteMany({});
    console.log('✅ All products cleared!');
    
    mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error:", err);
    mongoose.disconnect();
  }
}

checkProducts();
