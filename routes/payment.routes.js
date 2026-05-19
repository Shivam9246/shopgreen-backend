// routes/payment.routes.js
const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/auth.middleware");
const {
  createStripePaymentIntent,
  confirmStripePayment,
  stripeWebhook,
  createRazorpayOrder,
  verifyRazorpayPayment,
} = require("../controllers/payment.controller");

// ── Stripe Webhook (raw body needed) ──────────
// NOTE: Add this BEFORE express.json() in server.js if needed
router.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

// ── Stripe (protected) ────────────────────────
router.post("/stripe/create-intent", protect, createStripePaymentIntent);
router.post("/stripe/confirm",       protect, confirmStripePayment);

// ── Razorpay (protected) ──────────────────────
router.post("/razorpay/create-order", protect, createRazorpayOrder);
router.post("/razorpay/verify",       protect, verifyRazorpayPayment);

module.exports = router;
