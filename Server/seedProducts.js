const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect('mongodb://127.0.0.1:27017/Cafeteria');

const products = [
  // Coffee Category (9 items - matching actual files)
  {
    name: "Affogato",
    description: "Espresso poured over vanilla ice cream.",
    price: 220,
    image: "coffee/Affogato.jpg",
    category: "Coffee",
    rating: 4.7,
    badge: "New",
    servingSize: "200ml",
    calories: 210,
    allergyInfo: "Contains milk, ice cream",
    preparationTime: "quick"
  },
  {
    name: "Cortado",
    description: "Equal parts espresso and steamed milk.",
    price: 160,
    image: "coffee/Cortado.jpeg",
    category: "Coffee",
    rating: 4.5,
    servingSize: "150ml",
    calories: 90,
    allergyInfo: "Contains milk",
    preparationTime: "quick"
  },
  {
    name: "Flat White",
    description: "Velvety microfoam milk over espresso.",
    price: 190,
    image: "coffee/FlatWhite.jpg",
    category: "Coffee",
    rating: 4.6,
    badge: "Limited",
    servingSize: "220ml",
    calories: 120,
    allergyInfo: "Contains milk",
    preparationTime: "quick"
  },
  {
    name: "Mocha",
    description: "Espresso with chocolate and steamed milk.",
    price: 240,
    image: "coffee/Mocha.jpg",
    category: "Coffee",
    rating: 4.8,
    badge: "Bestseller",
    servingSize: "250ml",
    calories: 180,
    allergyInfo: "Contains milk, chocolate",
    preparationTime: "regular"
  },
  {
    name: "Cappuccino",
    description: "Espresso with steamed milk and foam.",
    price: 180,
    image: "coffee/Cappuccino.jpg",
    category: "Coffee",
    rating: 4.8,
    badge: "Bestseller",
    servingSize: "180ml",
    calories: 110,
    allergyInfo: "Contains milk",
    preparationTime: "quick"
  },
  {
    name: "Latte",
    description: "Espresso with lots of steamed milk.",
    price: 170,
    image: "coffee/Latte.jpg",
    category: "Coffee",
    rating: 4.6,
    servingSize: "240ml",
    calories: 130,
    allergyInfo: "Contains milk",
    preparationTime: "quick"
  },
  {
    name: "Cold Brew",
    description: "Slow-steeped cold coffee, smooth and bold.",
    price: 200,
    image: "coffee/ColdBrew.jpg",
    category: "Coffee",
    rating: 4.4,
    badge: "New",
    servingSize: "300ml",
    calories: 60,
    allergyInfo: "None",
    preparationTime: "slow"
  },
  {
    name: "Americano",
    description: "Espresso with hot water, rich and smooth.",
    price: 150,
    image: "coffee/Americano.jpeg",
    category: "Coffee",
    rating: 4.3,
    servingSize: "200ml",
    calories: 15,
    allergyInfo: "None",
    preparationTime: "quick"
  },
  {
    name: "Espresso",
    description: "Strong, classic shot of pure espresso.",
    price: 120,
    image: "coffee/Espresso.jpeg",
    category: "Coffee",
    rating: 4.2,
    servingSize: "30ml",
    calories: 5,
    allergyInfo: "None",
    preparationTime: "quick"
  },

  // Pastries Category
  {
    name: "Butter Croissant",
    description: "Classic French croissant with layers of buttery flakiness.",
    price: 120,
    image: "pastries/ButterCroissant.jpg",
    category: "Pastries",
    rating: 4.7,
    badge: "Bestseller",
    servingSize: "60g",
    calories: 250,
    allergyInfo: "Contains gluten, dairy",
    preparationTime: "quick"
  },
  {
    name: "Chocolate Croissant",
    description: "Buttery croissant filled with rich dark chocolate.",
    price: 140,
    image: "pastries/ChocolateCroissant.jpg",
    category: "Pastries",
    rating: 4.8,
    badge: "Popular",
    servingSize: "70g",
    calories: 320,
    allergyInfo: "Contains gluten, dairy, chocolate",
    preparationTime: "quick"
  },
  {
    name: "Blueberry Muffin",
    description: "Moist muffin bursting with fresh blueberries.",
    price: 100,
    image: "pastries/BlueBerryMuffin.jpg",
    category: "Pastries",
    rating: 4.5,
    servingSize: "80g",
    calories: 280,
    allergyInfo: "Contains gluten, dairy, eggs",
    preparationTime: "quick"
  },
  {
    name: "Chocolate Chip Muffin",
    description: "Classic muffin loaded with chocolate chips.",
    price: 110,
    image: "pastries/ChocolateChipMuffin.jpg",
    category: "Pastries",
    rating: 4.6,
    servingSize: "85g",
    calories: 350,
    allergyInfo: "Contains gluten, dairy, eggs, chocolate",
    preparationTime: "quick"
  },
  {
    name: "Cinnamon Roll",
    description: "Sweet roll with cinnamon and cream cheese frosting.",
    price: 130,
    image: "pastries/CinnamonRoll.jpg",
    category: "Pastries",
    rating: 4.7,
    badge: "New",
    servingSize: "90g",
    calories: 380,
    allergyInfo: "Contains gluten, dairy, eggs",
    preparationTime: "regular"
  },
  {
    name: "Danish Pastry",
    description: "Flaky pastry with sweet filling and icing.",
    price: 150,
    image: "pastries/DanishPastry.jpg",
    category: "Pastries",
    rating: 4.4,
    servingSize: "75g",
    calories: 300,
    allergyInfo: "Contains gluten, dairy, eggs",
    preparationTime: "regular"
  },
  {
    name: "Apple Turnover",
    description: "Flaky pastry filled with spiced apple compote.",
    price: 140,
    image: "pastries/AppleTurnover.jpg",
    category: "Pastries",
    rating: 4.3,
    servingSize: "80g",
    calories: 320,
    allergyInfo: "Contains gluten, dairy",
    preparationTime: "regular"
  },
  {
    name: "Pain au Chocolat",
    description: "French pastry with dark chocolate batons.",
    price: 160,
    image: "pastries/PainAuChocolate.jpg",
    category: "Pastries",
    rating: 4.6,
    badge: "Premium",
    servingSize: "85g",
    calories: 350,
    allergyInfo: "Contains gluten, dairy, chocolate",
    preparationTime: "quick"
  },
  {
    name: "Almond Croissant",
    description: "Buttery croissant filled with almond cream and topped with almonds.",
    price: 170,
    image: "pastries/AlmondCroissant.jpg",
    category: "Pastries",
    rating: 4.5,
    badge: "Gourmet",
    servingSize: "90g",
    calories: 380,
    allergyInfo: "Contains gluten, dairy, nuts",
    preparationTime: "regular"
  },

  // Snacks Category (9 items) - Indian Café Snacks
  {
    name: "Samosa",
    description: "Crispy pastry filled with spiced potatoes, peas, and aromatic spices.",
    price: 80,
    image: "snacks/Samosa.jpg",
    category: "Snacks",
    rating: 4.8,
    badge: "Popular",
    servingSize: "100g",
    calories: 280,
    allergyInfo: "Contains gluten, potatoes",
    preparationTime: "quick"
  },
  {
    name: "Sprouts Chaat",
    description: "Fresh sprouted beans with tangy chutneys and spices.",
    price: 85,
    image: "snacks/SproutChaat.jpeg",
    category: "Snacks",
    rating: 4.5,
    badge: "Nutritious",
    servingSize: "120g",
    calories: 150,
    allergyInfo: "Contains sprouts",
    preparationTime: "quick"
  },
  {
    name: "Puff",
    description: "Flaky puff pastry filled with spiced vegetables or potatoes.",
    price: 70,
    image: "snacks/Puff.avif",
    category: "Snacks",
    rating: 4.4,
    servingSize: "80g",
    calories: 200,
    allergyInfo: "Contains gluten",
    preparationTime: "quick"
  },
  {
    name: "Cheese Crackers",
    description: "Savory crackers with real cheese flavor and herbs.",
    price: 75,
    image: "snacks/CheeseCrakers.jpg",
    category: "Snacks",
    rating: 4.3,
    servingSize: "45g",
    calories: 200,
    allergyInfo: "Contains gluten, dairy",
    preparationTime: "quick"
  },
  {
    name: "Pretzels",
    description: "Classic twisted pretzels with sea salt and spices.",
    price: 60,
    image: "snacks/Pretzels.jpg",
    category: "Snacks",
    rating: 4.1,
    servingSize: "50g",
    calories: 140,
    allergyInfo: "Contains gluten",
    preparationTime: "quick"
  },
  {
    name: "Granola Bar",
    description: "Oats, honey, and dried fruits in a chewy bar.",
    price: 70,
    image: "snacks/GranolaBar.jpg",
    category: "Snacks",
    rating: 4.4,
    servingSize: "40g",
    calories: 180,
    allergyInfo: "Contains gluten, nuts",
    preparationTime: "quick"
  },
  {
    name: "Trail Mix",
    description: "Dried fruits, nuts, and seeds for energy boost.",
    price: 150,
    image: "snacks/TrailMix.jpeg",
    category: "Snacks",
    rating: 4.5,
    badge: "Energy",
    servingSize: "60g",
    calories: 280,
    allergyInfo: "Contains nuts, dried fruits",
    preparationTime: "quick"
  },
  {
    name: "Chips",
    description: "Crispy potato chips with classic sea salt flavor.",
    price: 90,
    image: "snacks/Chips.jpg",
    category: "Snacks",
    rating: 4.2,
    servingSize: "85g",
    calories: 160,
    allergyInfo: "None",
    preparationTime: "quick"
  },
  {
    name: "Caramel Popcorn",
    description: "Sweet and crunchy popcorn coated with caramel.",
    price: 80,
    image: "snacks/CaramelPopcorn.jpg",
    category: "Snacks",
    rating: 4.6,
    badge: "Sweet",
    servingSize: "100g",
    calories: 220,
    allergyInfo: "None",
    preparationTime: "quick"
  },

  // Beverages Category (9 items)
  {
    name: "Fresh Orange Juice",
    description: "Freshly squeezed orange juice, rich in vitamin C.",
    price: 120,
    image: "beverages/OrangeJuice.jpg",
    category: "Beverages",
    rating: 4.5,
    badge: "Fresh",
    servingSize: "250ml",
    calories: 110,
    allergyInfo: "None",
    preparationTime: "quick"
  },
  {
    name: "Green Tea",
    description: "Premium green tea with natural antioxidants.",
    price: 80,
    image: "beverages/GreenTea.jpg",
    category: "Beverages",
    rating: 4.3,
    servingSize: "200ml",
    calories: 5,
    allergyInfo: "None",
    preparationTime: "quick"
  },
  {
    name: "Lemonade",
    description: "Refreshing lemonade with natural lemon juice.",
    price: 100,
    image: "beverages/Lemonade.jpg",
    category: "Beverages",
    rating: 4.4,
    servingSize: "300ml",
    calories: 90,
    allergyInfo: "None",
    preparationTime: "quick"
  },
  {
    name: "Hot Chocolate",
    description: "Rich and creamy hot chocolate with marshmallows.",
    price: 140,
    image: "beverages/HotChocolate.jpg",
    category: "Beverages",
    rating: 4.7,
    badge: "Popular",
    servingSize: "250ml",
    calories: 200,
    allergyInfo: "Contains dairy, chocolate",
    preparationTime: "quick"
  },
  {
    name: "Iced Tea",
    description: "Refreshing iced tea with lemon and mint.",
    price: 90,
    image: "beverages/IcedTea.jpg",
    category: "Beverages",
    rating: 4.2,
    servingSize: "350ml",
    calories: 25,
    allergyInfo: "None",
    preparationTime: "quick"
  },
  {
    name: "Smoothie",
    description: "Mixed berry smoothie with yogurt and honey.",
    price: 160,
    image: "beverages/Smoothie.jpg",
    category: "Beverages",
    rating: 4.6,
    badge: "Healthy",
    servingSize: "400ml",
    calories: 180,
    allergyInfo: "Contains dairy",
    preparationTime: "quick"
  },
  {
    name: "Coconut Water",
    description: "Natural coconut water, rich in electrolytes.",
    price: 110,
    image: "beverages/CoconutWater.jpg",
    category: "Beverages",
    rating: 4.4,
    badge: "Natural",
    servingSize: "330ml",
    calories: 45,
    allergyInfo: "None",
    preparationTime: "quick"
  },
  {
    name: "Herbal Tea",
    description: "Soothing chamomile and lavender herbal tea.",
    price: 85,
    image: "beverages/HerbalTea.jpeg",
    category: "Beverages",
    rating: 4.3,
    servingSize: "200ml",
    calories: 0,
    allergyInfo: "None",
    preparationTime: "quick"
  },
  {
    name: "Oreo Shake",
    description: "Creamy Oreo milkshake with whipped cream and cookie pieces.",
    price: 180,
    image: "beverages/OreoShake.jpeg",
    category: "Beverages",
    rating: 4.8,
    badge: "Indulgent",
    servingSize: "400ml",
    calories: 350,
    allergyInfo: "Contains dairy, cookies",
    preparationTime: "quick"
  },

  // Desserts Category (9 items)
  {
    name: "Chocolate Cake",
    description: "Rich chocolate cake with chocolate ganache frosting.",
    price: 200,
    image: "desserts/ChocolateCake.jpg",
    category: "Desserts",
    rating: 4.8,
    badge: "Bestseller",
    servingSize: "150g",
    calories: 450,
    allergyInfo: "Contains gluten, dairy, eggs, chocolate",
    preparationTime: "regular"
  },
  {
    name: "Cheesecake",
    description: "Creamy New York style cheesecake with berry compote.",
    price: 220,
    image: "desserts/CheeseCake.avif",
    category: "Desserts",
    rating: 4.7,
    badge: "Premium",
    servingSize: "180g",
    calories: 380,
    allergyInfo: "Contains dairy, eggs",
    preparationTime: "regular"
  },
  {
    name: "Tiramisu",
    description: "Classic Italian dessert with coffee-soaked ladyfingers.",
    price: 240,
    image: "desserts/Tiramisu.jpg",
    category: "Desserts",
    rating: 4.9,
    badge: "Gourmet",
    servingSize: "160g",
    calories: 320,
    allergyInfo: "Contains dairy, eggs, coffee",
    preparationTime: "regular"
  },
  {
    name: "Apple Pie",
    description: "Traditional apple pie with flaky crust and cinnamon.",
    price: 180,
    image: "desserts/ApplePie.jpg",
    category: "Desserts",
    rating: 4.6,
    servingSize: "200g",
    calories: 350,
    allergyInfo: "Contains gluten, dairy",
    preparationTime: "regular"
  },
  {
    name: "Ice Cream",
    description: "Vanilla bean ice cream with chocolate sauce.",
    price: 160,
    image: "desserts/IceCreamDessert.jpg",
    category: "Desserts",
    rating: 4.5,
    servingSize: "120g",
    calories: 280,
    allergyInfo: "Contains dairy",
    preparationTime: "quick"
  },
  {
    name: "Brownie",
    description: "Fudgy chocolate brownie with walnuts.",
    price: 140,
    image: "desserts/Brownies.jpg",
    category: "Desserts",
    rating: 4.7,
    badge: "Popular",
    servingSize: "100g",
    calories: 400,
    allergyInfo: "Contains gluten, dairy, eggs, chocolate, nuts",
    preparationTime: "quick"
  },
  {
    name: "Creme Brulee",
    description: "Classic French dessert with caramelized sugar top.",
    price: 260,
    image: "desserts/CremeBrulee.jpg",
    category: "Desserts",
    rating: 4.8,
    badge: "Gourmet",
    servingSize: "150g",
    calories: 320,
    allergyInfo: "Contains dairy, eggs",
    preparationTime: "regular"
  },
  {
    name: "Fruit Tart",
    description: "Buttery tart shell filled with custard and fresh fruits.",
    price: 200,
    image: "desserts/FruitTart.jpg",
    category: "Desserts",
    rating: 4.6,
    servingSize: "180g",
    calories: 280,
    allergyInfo: "Contains gluten, dairy, eggs",
    preparationTime: "regular"
  },
  {
    name: "Chocolate Mousse",
    description: "Silky smooth chocolate mousse with whipped cream.",
    price: 180,
    image: "desserts/ChocolateMousse.jpg",
    category: "Desserts",
    rating: 4.7,
    badge: "Elegant",
    servingSize: "120g",
    calories: 350,
    allergyInfo: "Contains dairy, eggs, chocolate",
    preparationTime: "quick"
  }
];

async function seed() {
  try {
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log("✅ Products seeded!");
    console.log(`📊 Total products added: ${products.length}`);
    console.log(`☕ Coffee products: ${products.filter(p => p.category === 'Coffee').length}`);
    console.log(`🥐 Pastry products: ${products.filter(p => p.category === 'Pastries').length}`);
    console.log(`🍰 Dessert products: ${products.filter(p => p.category === 'Desserts').length}`);
    console.log(`🥨 Snack products: ${products.filter(p => p.category === 'Snacks').length}`);
    console.log(`🥤 Beverage products: ${products.filter(p => p.category === 'Beverages').length}`);
    mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error seeding products:", err);
    mongoose.disconnect();
  }
}

seed();