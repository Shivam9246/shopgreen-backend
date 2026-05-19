// api.js  –  Add this file to your SHOPPING frontend folder
// It connects your existing index.html / script.js to the backend

const API_BASE = "http://localhost:5000/api";

// ── Helper: get auth header ───────────────────
const authHeader = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("shopgreen_token")}`,
});

// ════════════════════════════════════════════
//  AUTH
// ════════════════════════════════════════════

export const authAPI = {
  // Register new user
  register: async (name, email, password) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (data.token) localStorage.setItem("shopgreen_token", data.token);
    return data;
  },

  // Login
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.token) localStorage.setItem("shopgreen_token", data.token);
    return data;
  },

  // Get current user
  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: authHeader() });
    return res.json();
  },

  // Logout (client-side)
  logout: () => localStorage.removeItem("shopgreen_token"),

  // Check if logged in
  isLoggedIn: () => !!localStorage.getItem("shopgreen_token"),
};

// ════════════════════════════════════════════
//  PRODUCTS
// ════════════════════════════════════════════

export const productAPI = {
  // Fetch all products (with optional filters)
  getAll: async ({ category, badge, search, sort } = {}) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (badge)    params.set("badge",    badge);
    if (search)   params.set("search",   search);
    if (sort)     params.set("sort",     sort);

    const res = await fetch(`${API_BASE}/products?${params}`);
    return res.json();
  },

  getById: async (id) => {
    const res = await fetch(`${API_BASE}/products/${id}`);
    return res.json();
  },
};

// ════════════════════════════════════════════
//  PAYMENT – STRIPE
// ════════════════════════════════════════════

export const stripeAPI = {
  // Step 1: Create payment intent on the server
  createIntent: async (amountInPaise) => {
    const res = await fetch(`${API_BASE}/payment/stripe/create-intent`, {
      method:  "POST",
      headers: authHeader(),
      body:    JSON.stringify({ amount: amountInPaise }),
    });
    return res.json();
  },

  // Step 2: After Stripe.js confirms payment, tell server to save order
  confirmOrder: async ({ paymentIntentId, items, totalAmount, shippingAddress }) => {
    const res = await fetch(`${API_BASE}/payment/stripe/confirm`, {
      method:  "POST",
      headers: authHeader(),
      body:    JSON.stringify({ paymentIntentId, items, totalAmount, shippingAddress }),
    });
    return res.json();
  },
};

// ════════════════════════════════════════════
//  PAYMENT – RAZORPAY
// ════════════════════════════════════════════

export const razorpayAPI = {
  // Step 1: Create Razorpay order
  createOrder: async (amountInPaise) => {
    const res = await fetch(`${API_BASE}/payment/razorpay/create-order`, {
      method:  "POST",
      headers: authHeader(),
      body:    JSON.stringify({ amount: amountInPaise }),
    });
    return res.json();
  },

  // Step 2: Verify payment signature after Razorpay checkout
  verifyPayment: async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature, items, totalAmount, shippingAddress }) => {
    const res = await fetch(`${API_BASE}/payment/razorpay/verify`, {
      method:  "POST",
      headers: authHeader(),
      body:    JSON.stringify({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        items,
        totalAmount,
        shippingAddress,
      }),
    });
    return res.json();
  },

  // Complete Razorpay checkout flow (call this from your "Proceed to Checkout" button)
  checkout: async (cart, totalAmount, shippingAddress) => {
    const amountInPaise = totalAmount * 100;

    // 1. Create order on backend
    const orderData = await razorpayAPI.createOrder(amountInPaise);
    if (!orderData.success) throw new Error("Could not create order");

    // 2. Open Razorpay checkout modal
    return new Promise((resolve, reject) => {
      const options = {
        key:      orderData.keyId,
        amount:   orderData.amount,
        currency: orderData.currency,
        name:     "ShopGreen",
        description: "Purchase",
        order_id: orderData.orderId,
        handler: async (response) => {
          // 3. Verify on backend
          const items = cart.map((item) => ({
            product:  item.id,
            name:     item.name,
            price:    item.price,
            quantity: item.quantity,
            image:    item.image,
          }));

          const result = await razorpayAPI.verifyPayment({
            ...response,
            items,
            totalAmount,
            shippingAddress,
          });
          resolve(result);
        },
        prefill:  { name: "", email: "", contact: "" },
        theme:    { color: "#2e8b57" }, // ShopGreen brand color
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp) => reject(resp.error));
      rzp.open();
    });
  },
};

// ════════════════════════════════════════════
//  ORDERS
// ════════════════════════════════════════════

export const orderAPI = {
  getMyOrders: async () => {
    const res = await fetch(`${API_BASE}/orders/my`, { headers: authHeader() });
    return res.json();
  },

  getById: async (id) => {
    const res = await fetch(`${API_BASE}/orders/${id}`, { headers: authHeader() });
    return res.json();
  },
};
