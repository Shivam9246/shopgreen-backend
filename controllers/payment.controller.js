// controllers/payment.controller.js
const crypto   = require("crypto");
const Razorpay = require("razorpay");
const Order    = require("../models/Order");

// ── Stripe (only initialize if key is set) ────
let stripe = null;
if (
  process.env.STRIPE_SECRET_KEY &&
  process.env.STRIPE_SECRET_KEY !== "sk_test_your_stripe_secret_key"
) {
  const Stripe = require("stripe");
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
}

// ── Razorpay ──────────────────────────────────
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// ════════════════════════════════════════════
//  STRIPE
// ════════════════════════════════════════════

// ── POST /api/payment/stripe/create-intent ───
exports.createStripePaymentIntent = async (req, res, next) => {
  try {
    if (!stripe) {
      return res.status(400).json({ success: false, message: "Stripe is not configured." });
    }

    const { amount, currency = "inr" } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: { userId: req.user._id.toString() },
    });

    res.json({
      success:         true,
      clientSecret:    paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/payment/stripe/confirm ─────────
exports.confirmStripePayment = async (req, res, next) => {
  try {
    if (!stripe) {
      return res.status(400).json({ success: false, message: "Stripe is not configured." });
    }

    const { paymentIntentId, items, totalAmount, shippingAddress } = req.body;

    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (intent.status !== "succeeded") {
      return res.status(400).json({ success: false, message: "Payment not completed." });
    }

    const order = await Order.create({
      user:                  req.user._id,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod:         "stripe",
      paymentStatus:         "paid",
      orderStatus:           "confirmed",
      stripePaymentIntentId: paymentIntentId,
    });

    res.status(201).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/payment/stripe/webhook ─────────
exports.stripeWebhook = async (req, res) => {
  if (!stripe) return res.status(400).send("Stripe not configured.");

  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.payment_failed") {
    const intent = event.data.object;
    await Order.findOneAndUpdate(
      { stripePaymentIntentId: intent.id },
      { paymentStatus: "failed" }
    );
  }

  res.json({ received: true });
};


// ════════════════════════════════════════════
//  RAZORPAY
// ════════════════════════════════════════════

// ── POST /api/payment/razorpay/create-order ──
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount } = req.body;

    const options = {
      amount,
      currency: "INR",
      receipt:  `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success:  true,
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      keyId:    process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/payment/razorpay/verify ────────
exports.verifyRazorpayPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      totalAmount,
      shippingAddress,
    } = req.body;

    // Verify signature
    const body     = razorpay_order_id + "|" + razorpay_payment_id;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid payment signature." });
    }

    const order = await Order.create({
      user:              req.user._id,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod:     "razorpay",
      paymentStatus:     "paid",
      orderStatus:       "confirmed",
      razorpayOrderId:   razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    res.status(201).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};