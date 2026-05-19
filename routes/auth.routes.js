// routes/auth.routes.js
const express = require("express");
const { body  } = require("express-validator");
const router  = express.Router();

const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
} = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

// Validation rules
const registerRules = [
  body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
  body("email").isEmail().withMessage("Valid email required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

const loginRules = [
  body("email").isEmail().withMessage("Valid email required"),
  body("password").notEmpty().withMessage("Password required"),
];

// ── Public routes ─────────────────────────────
router.post("/register", registerRules, register);
router.post("/login",    loginRules,    login);

// ── Protected routes ──────────────────────────
router.get("/me",               protect, getMe);
router.put("/update-profile",   protect, updateProfile);
router.put("/change-password",  protect, changePassword);

module.exports = router;
