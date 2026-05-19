// ─────────────────────────────────────────────
//  server.js  –  ShopGreen Entry Point
// ─────────────────────────────────────────────
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");


const app = express();

// ── Middleware ────────────────────────────────
app.use(cors({ 
  origin: 'https://shopgreen-frontend.vercel.app', 
  credentials: true 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────
app.use("/api/auth",     require("./routes/auth.routes"));
app.use("/api/products", require("./routes/product.routes"));
app.use("/api/cart",     require("./routes/cart.routes"));
app.use("/api/orders",   require("./routes/order.routes"));
app.use("/api/payment",  require("./routes/payment.routes"));

// ── Health Check ──────────────────────────────
app.get("/", (req, res) =>
  res.json({ status: "ShopGreen API is running 🌿" })
);

// ── Global Error Handler ──────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ── Connect DB & Start Server ─────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
