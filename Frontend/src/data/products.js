// Import all product images
import mochaImage from '/menu-images/Mocha.jpg';
import cappuccinoImage from '/menu-images/Cappuccino.jpeg';
import latteImage from '/menu-images/Latte.jpeg';
import espressoImage from '/menu-images/Espresso.jpeg';
import affogatoImage from '/menu-images/Affogato.jpeg';
import cortadoImage from '/menu-images/Cortado.jpeg';
import flatWhiteImage from '/menu-images/FlatWhite.jpeg';
import coldBrewImage from '/menu-images/ColdBrew.jpeg';
import americanoImage from '/menu-images/Americano.png';

// Static products array with imported images
export const products = [
  {
    id: 1,
    name: "Affogato",
    description: "Espresso poured over vanilla ice cream.",
    price: 220,
    image: affogatoImage,
    category: "Coffee",
    rating: 4.7,
    badge: "New",
    servingSize: "200ml",
    calories: 210,
    allergyInfo: "Contains milk, ice cream"
  },
  {
    id: 2,
    name: "Cortado",
    description: "Equal parts espresso and steamed milk.",
    price: 160,
    image: cortadoImage,
    category: "Coffee",
    rating: 4.5,
    servingSize: "150ml",
    calories: 90,
    allergyInfo: "Contains milk"
  },
  {
    id: 3,
    name: "Flat White",
    description: "Velvety microfoam milk over espresso.",
    price: 190,
    image: flatWhiteImage,
    category: "Coffee",
    rating: 4.6,
    badge: "Limited",
    servingSize: "220ml",
    calories: 120,
    allergyInfo: "Contains milk"
  },
  {
    id: 4,
    name: "Mocha",
    description: "Espresso with chocolate and steamed milk.",
    price: 240,
    image: mochaImage,
    category: "Coffee",
    rating: 4.8,
    badge: "Bestseller",
    servingSize: "250ml",
    calories: 180,
    allergyInfo: "Contains milk, chocolate"
  },
  {
    id: 5,
    name: "Cappuccino",
    description: "Espresso with steamed milk and foam.",
    price: 180,
    image: cappuccinoImage,
    category: "Coffee",
    rating: 4.8,
    badge: "Bestseller",
    servingSize: "180ml",
    calories: 110,
    allergyInfo: "Contains milk"
  },
  {
    id: 6,
    name: "Latte",
    description: "Espresso with lots of steamed milk.",
    price: 170,
    image: latteImage,
    category: "Coffee",
    rating: 4.6,
    servingSize: "240ml",
    calories: 130,
    allergyInfo: "Contains milk"
  },
  {
    id: 7,
    name: "Cold Brew",
    description: "Slow-steeped cold coffee, smooth and bold.",
    price: 200,
    image: coldBrewImage,
    category: "Coffee",
    rating: 4.4,
    badge: "New",
    servingSize: "300ml",
    calories: 60,
    allergyInfo: "None"
  },
  {
    id: 8,
    name: "Americano",
    description: "Espresso with hot water, rich and smooth.",
    price: 150,
    image: americanoImage,
    category: "Coffee",
    rating: 4.3,
    servingSize: "200ml",
    calories: 15,
    allergyInfo: "None"
  },
  {
    id: 9,
    name: "Espresso",
    description: "Strong, classic shot of pure espresso.",
    price: 120,
    image: espressoImage,
    category: "Coffee",
    rating: 4.5,
    servingSize: "60ml",
    calories: 5,
    allergyInfo: "None"
  }
];

// Helper functions
export const getProductsByCategory = (category) => {
  if (category === 'All') return products;
  return products.filter(product => product.category === category);
};

export const getTopRatedProducts = () => {
  return products.filter(product => product.rating >= 4.5);
};

export const getProductById = (id) => {
  return products.find(product => product.id === id);
}; 