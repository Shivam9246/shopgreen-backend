// routes/product.routes.js
const express = require("express");
const router  = express.Router();
const { protect, adminOnly } = require("../middleware/auth.middleware");
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");

router.get("/",        getAllProducts);
router.get("/:id",     getProductById);
router.post("/",       protect, adminOnly, createProduct);
router.put("/:id",     protect, adminOnly, updateProduct);
router.delete("/:id",  protect, adminOnly, deleteProduct);

module.exports = router;
