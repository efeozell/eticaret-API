<div align="right">
  <small>
    <a href="https://github.com/efeozell/eticaret-API/blob/main/api/docs/README_tr.md">TR Türkçe versiyon için tıklayınız</a>
  </small>
</div>

# 🛍️ E-Commerce Backend API 🚀

This is a fully functional E-Commerce backend API built using **Node.js**, designed to handle a range of features such
as user authentication, role-based access, product management, and order processing with cash and Stripe payment
integration.

![App Screenshot](https://github.com/efeozell/eticaret-API/blob/main/api/docs/endpoint1.png)
![App Screenshot](https://github.com/efeozell/eticaret-API/blob/main/api/docs/endpoint2.png)
![App Screenshot](https://github.com/efeozell/eticaret-API/blob/main/api/docs/stripe.png)

## ✨ Features

- 🔐 **User Authentication & Authorization**:

  - JWT-based authentication.
  - Email verification using a verification code.
  - Role-based access control (Admin, Customer).

- 🛍️ **Product & Category Browsing**:

  - Browse products and categories without authentication.
  - Support for sub-categories.

- 🛒 **Shopping Cart**:

  - Add products to the shopping cart for registered customers.

- 📦 **Order Management**:

  - Create and manage orders.
  - Support for discount coupons.

- 💳 **Payment Integration**:

  - Cash payments.
  - Stripe integration for card payments.

- 👑 **Admin Features**:

  - Manage customers, products, categories, and orders.
  - Upload and manage product images.

- 🔎 **Search & Filtering**:

  - Advanced search functionality.
  - Filtering, sorting, pagination, and field limiting.

- 🔐 **Security**:

  - Data validation.
  - Rate limiting to prevent abuse.
  - HTTP Parameter Pollution (HPP) protection.
  - Data sanitization against XSS and NoSQL injection.

- ⚡ **Performance Optimization**:
  - Support for compression.
  - CORS enabled for cross-origin requests.

## 🛠️ Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Ahmad-Nour-Haidar/nodejs-ecommerce-api.git
   ```
2. **Navigate to the project directory**:
   ```bash
   cd nodejs-ecommerce-api
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Setup .env file**:

   ```bash
   PORT=5000
   MONGO_URI=your_mongo_uri

   UPSTASH_REDIS_URL=your_redis_url

   ACCESS_TOKEN_SECRET=your_access_token_secret
   REFRESH_TOKEN_SECRET=your_refresh_token_secret

   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   STRIPE_SECRET_KEY=your_stripe_secret_key
   CLIENT_URL=http://localhost:5173
   NODE_ENV=development
   ```

5. **Start the server**:
   ```bash
   npm start
   ```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
