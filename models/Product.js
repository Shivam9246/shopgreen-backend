// models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Electronics", "Footwear", "Kitchen", "Bags", "Accessories", "Home", "Stationery", "Other"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    description: {
      type: String,
      default: "",
    },
    image: {
      type: String,    // emoji or URL
      default: "📦",
    },
    badge: {
      type: String,
      enum: ["NEW", "SALE", null],
      default: null,
    },
    stock: {
      type: Number,
      default: 100,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
