# 🌿 ShopGreen – Full Stack Backend

Node.js + Express + MongoDB backend for the ShopGreen shopping website.

---

## 📁 Project Structure

```
shopgreen-backend/
├── server.js                  ← Entry point
├── .env.example               ← Copy to .env and fill values
├── package.json
├── api.js                     ← Copy this to your FRONTEND folder
│
├── models/
│   ├── User.js                ← User schema with bcrypt hashing
│   ├── Product.js             ← Product schema
│   └── Order.js               ← Order schema (Stripe + Razorpay)
│
├── controllers/
│   ├── auth.controller.js     ← Register, Login, Profile
│   ├── product.controller.js  ← CRUD for products
│   ├── order.controller.js    ← Order history
│   └── payment.controller.js  ← Stripe + Razorpay
│
├── routes/
│   ├── auth.routes.js
│   ├── product.routes.js
│   ├── cart.routes.js
│   ├── order.routes.js
│   └── payment.routes.js
│
├── middleware/
│   └── auth.middleware.js     ← JWT protect + adminOnly
│
└── scripts/
    └── seed.js                ← Populates DB with your 8 products
```

---

## 🚀 Setup – Step by Step

### 1. Prerequisites
- Node.js v18+ installed → https://nodejs.org
- MongoDB installed locally **or** a free MongoDB Atlas account → https://cloud.mongodb.com

### 2. Install dependencies
```bash
cd shopgreen-backend
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
```
Open `.env` and fill in:
| Variable | Where to get it |
|---|---|
| `MONGO_URI` | Local: `mongodb://localhost:27017/shopgreen` or Atlas connection string |
| `JWT_SECRET` | Any random string (e.g. `openssl rand -hex 32`) |
| `RAZORPAY_KEY_ID` / `SECRET` | https://dashboard.razorpay.com → Settings → API Keys |
| `STRIPE_SECRET_KEY` | https://dashboard.stripe.com → Developers → API Keys |

### 4. Seed the database (optional but recommended)
```bash
node scripts/seed.js
```
This creates all 8 products matching your frontend.

### 5. Start the server
```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```
Server runs at **http://localhost:5000**

---

## 🔗 Connect Frontend to Backend

1. Copy `api.js` from this folder into your **SHOPPING** frontend folder.
2. Add Razorpay script to your `index.html` `<head>`:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```
3. In your `script.js`, replace the cart "Proceed to Checkout" button handler:
```js
import { authAPI, razorpayAPI } from './api.js';

// On "Proceed to Checkout" click:
document.querySelector('.checkout-btn').addEventListener('click', async () => {
  if (!authAPI.isLoggedIn()) {
    alert('Please login to checkout');
    // Show login modal
    return;
  }

  const shippingAddress = {
    street: '123 Main St',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110001',
  };

  try {
    const result = await razorpayAPI.checkout(cart, totalAmount, shippingAddress);
    if (result.success) {
      alert('✅ Order placed successfully!');
      clearCart();
    }
  } catch (err) {
    alert('Payment failed: ' + err.description);
  }
});
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Create account |
| POST | `/api/auth/login` | Public | Login, get JWT |
| GET | `/api/auth/me` | Protected | Current user |
| PUT | `/api/auth/update-profile` | Protected | Update name/address |
| PUT | `/api/auth/change-password` | Protected | Change password |

### Products
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/products` | Public | All products (filter by `?category=&badge=&search=&sort=`) |
| GET | `/api/products/:id` | Public | Single product |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Soft delete |

### Payment
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/payment/razorpay/create-order` | Protected | Start Razorpay payment |
| POST | `/api/payment/razorpay/verify` | Protected | Verify & save order |
| POST | `/api/payment/stripe/create-intent` | Protected | Start Stripe payment |
| POST | `/api/payment/stripe/confirm` | Protected | Confirm & save order |

### Orders
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/orders/my` | Protected | My order history |
| GET | `/api/orders/:id` | Protected | Single order |
| GET | `/api/orders` | Admin | All orders |
| PUT | `/api/orders/:id/status` | Admin | Update status |

---

## 🧪 Test with cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"123456"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# Get products
curl http://localhost:5000/api/products
```

---

## 📦 Tech Stack
- **Runtime**: Node.js 18+
- **Framework**: Express 4
- **Database**: MongoDB + Mongoose
- **Auth**: JWT + bcryptjs
- **Payments**: Razorpay (India) + Stripe (International)
- **Validation**: express-validator
