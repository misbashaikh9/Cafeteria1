// Simple script to check preparation time values in products
// Run this in your browser console or as a Node.js script

// If running in browser console on Menu page:
console.log('Checking preparation times...');

// Get all products
const products = window.productsData || [];

// Group by preparation time
const prepTimeGroups = {};
products.forEach(product => {
  const prepTime = product.preparationTime || 'undefined';
  if (!prepTimeGroups[prepTime]) {
    prepTimeGroups[prepTime] = [];
  }
  prepTimeGroups[prepTime].push(product.name);
});

console.log('Preparation Time Groups:', prepTimeGroups);

// Show count for each
Object.keys(prepTimeGroups).forEach(prepTime => {
  console.log(`${prepTime}: ${prepTimeGroups[prepTime].length} products`);
  console.log('Products:', prepTimeGroups[prepTime]);
});

// Check if any products have 'slow' preparation time
const slowProducts = products.filter(p => p.preparationTime === 'slow');
console.log('Slow products:', slowProducts.map(p => p.name));

// Check if any products have 'medium' preparation time  
const mediumProducts = products.filter(p => p.preparationTime === 'medium');
console.log('Medium products:', mediumProducts.map(p => p.name));

// Check if any products have 'quick' preparation time
const quickProducts = products.filter(p => p.preparationTime === 'quick');
console.log('Quick products:', quickProducts.map(p => p.name));
