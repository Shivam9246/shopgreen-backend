// routes/cart.routes.js
// NOTE: Your current frontend handles cart in localStorage.
// This route is optional – use it if you want server-side cart persistence.

const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/auth.middleware");
const mongoose = require("mongoose");

// Simple in-model approach: embed cart in User document
// For a dedicated Cart model, see the README.

const User = require("../models/User");

// ── GET /api/cart ─────────────────────────────
router.get("/", protect, async (req, res) => {
  const user = await User.findById(req.user._id).populate("cart.product");
  res.json({ success: true, cart: user.cart || [] });
});

module.exports = router;
