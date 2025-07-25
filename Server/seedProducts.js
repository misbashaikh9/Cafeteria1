const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect('mongodb://127.0.0.1:27017/Cafeteria', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const products = [
  {
    name: "Affogato",
    description: "Espresso poured over vanilla ice cream.",
    price: 220,
    image: "Affogato.jpeg",
    category: "Coffee",
    rating: 4.7,
    badge: "New",
    servingSize: "200ml",
    calories: 210,
    allergyInfo: "Contains milk, ice cream"
  },
  {
    name: "Cortado",
    description: "Equal parts espresso and steamed milk.",
    price: 160,
    image: "Cortado.jpeg",
    category: "Coffee",
    rating: 4.5,
    servingSize: "150ml",
    calories: 90,
    allergyInfo: "Contains milk"
  },
  {
    name: "Flat White",
    description: "Velvety microfoam milk over espresso.",
    price: 190,
    image: "FlatWhite.jpeg",
    category: "Coffee",
    rating: 4.6,
    badge: "Limited",
    servingSize: "220ml",
    calories: 120,
    allergyInfo: "Contains milk"
  },
  {
    name: "Mocha",
    description: "Espresso with chocolate and steamed milk.",
    price: 240,
    image: "Mocha.jpg",
    category: "Coffee",
    rating: 4.8,
    badge: "Bestseller",
    servingSize: "250ml",
    calories: 180,
    allergyInfo: "Contains milk, chocolate"
  },
  {
    name: "Cappuccino",
    description: "Espresso with steamed milk and foam.",
    price: 180,
    image: "Cappuccino.jpeg",
    category: "Coffee",
    rating: 4.8,
    badge: "Bestseller",
    servingSize: "180ml",
    calories: 110,
    allergyInfo: "Contains milk"
  },
  {
    name: "Latte",
    description: "Espresso with lots of steamed milk.",
    price: 170,
    image: "Latte.jpeg",
    category: "Coffee",
    rating: 4.6,
    servingSize: "240ml",
    calories: 130,
    allergyInfo: "Contains milk"
  },
  {
    name: "Cold Brew",
    description: "Slow-steeped cold coffee, smooth and bold.",
    price: 200,
    image: "ColdBrew.jpeg",
    category: "Coffee",
    rating: 4.4,
    badge: "New",
    servingSize: "300ml",
    calories: 60,
    allergyInfo: "None"
  },
  {
    name: "Americano",
    description: "Espresso with hot water, rich and smooth.",
    price: 150,
    image: "Americano.png",
    category: "Coffee",
    rating: 4.3,
    servingSize: "200ml",
    calories: 15,
    allergyInfo: "None"
  },
  {
    name: "Espresso",
    description: "Strong, classic shot of pure espresso.",
    price: 120,
    image: "Espresso.jpeg",
    category: "Coffee",
    rating: 4.5,
    servingSize: "60ml",
    calories: 5,
    allergyInfo: "None"
  }
];

async function seed() {
  try {
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log("✅ Products seeded!");
    mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error seeding products:", err);
    mongoose.disconnect();
  }
}

seed(); 