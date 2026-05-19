// routes/order.routes.js
const express = require("express");
const router  = express.Router();
const { protect, adminOnly } = require("../middleware/auth.middleware");
const {
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/order.controller");

router.get("/my",           protect,              getMyOrders);
router.get("/:id",          protect,              getOrderById);
router.get("/",             protect, adminOnly,   getAllOrders);
router.put("/:id/status",   protect, adminOnly,   updateOrderStatus);

module.exports = router;
