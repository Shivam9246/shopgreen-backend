// controllers/product.controller.js
const Product = require("../models/Product");

// ── GET /api/products ─────────────────────────
exports.getAllProducts = async (req, res, next) => {
  try {
    const { category, badge, search, sort } = req.query;
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (badge)    filter.badge    = badge;
    if (search)   filter.name     = { $regex: search, $options: "i" };

    let query = Product.find(filter);

    if (sort === "price_asc")  query = query.sort({ price:  1 });
    if (sort === "price_desc") query = query.sort({ price: -1 });
    if (sort === "newest")     query = query.sort({ createdAt: -1 });

    const products = await query;
    res.json({ success: true, count: products.length, products });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/products/:id ─────────────────────
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found." });
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/products  (admin) ───────────────
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/products/:id  (admin) ────────────
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found." });
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/products/:id  (admin) ─────────
exports.deleteProduct = async (req, res, next) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: "Product removed." });
  } catch (err) {
    next(err);
  }
};
