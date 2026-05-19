// scripts/seed.js  –  run with: node scripts/seed.js
const mongoose = require("mongoose");
const dotenv   = require("dotenv");
dotenv.config();

const Product = require("../models/Product");

const products = [
  { name: "Wireless Headphones", category: "Electronics",  price: 49,  image: "🎧", badge: "NEW",  stock: 50 },
  { name: "Running Shoes",       category: "Footwear",     price: 79,  image: "👟", badge: "SALE", stock: 30 },
  { name: "Coffee Mug",          category: "Kitchen",      price: 14,  image: "☕", badge: null,   stock: 100 },
  { name: "Backpack",            category: "Bags",         price: 59,  image: "🎒", badge: "NEW",  stock: 45 },
  { name: "Sunglasses",          category: "Accessories",  price: 29,  image: "🕶️", badge: null,   stock: 60 },
  { name: "Plant Pot",           category: "Home",         price: 19,  image: "🌿", badge: "SALE", stock: 80 },
  { name: "Notebook",            category: "Stationery",   price: 9,   image: "📓", badge: null,   stock: 200 },
  { name: "Hand Wash",           category: "Home",         price: 8,   image: "🧴", badge: null,   stock: 150 },
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log("✅ Products seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
})();
