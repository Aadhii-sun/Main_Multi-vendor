# EGO Store - Multi-Vendor E-Commerce Platform

A full-stack multi-vendor e-commerce platform built with React and Node.js, featuring user authentication, product management, payment processing, and comprehensive admin/seller dashboards.

## 🚀 Features

### Core Features
- **Multi-Vendor Support**: Sellers can create and manage their own stores
- **User Authentication**: OTP-based login and password authentication
- **Product Management**: Full CRUD operations with images, categories, and reviews
- **Shopping Cart**: Persistent cart with multi-vendor support
- **Payment Processing**: Stripe integration for secure payments
- **Order Management**: Complete order lifecycle tracking
- **Admin Dashboard**: Comprehensive admin panel for platform management
- **Seller Dashboard**: Analytics and product management for sellers
- **Image Upload**: Cloudinary integration for image storage and optimization

### Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Input sanitization (NoSQL injection & XSS protection)
- CORS configuration
- Rate limiting
- Security headers (Helmet)
- Request ID tracking

### Technical Features
- Structured logging with Winston
- Error tracking and monitoring
- Health check endpoints
- Environment variable validation
- Response compression
- Database indexing optimization

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account or local MongoDB
- Cloudinary account (for image uploads)
- Stripe account (for payments)
- SendGrid account or SMTP credentials (for emails)

## 🛠️ Installation

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in backend directory:
```env
# Required
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_min_32_characters

# Recommended
CLIENT_URL=http://localhost:5173
NODE_ENV=development
PORT=5000

# Email Configuration (choose one)
SENDGRID_API_KEY=your_sendgrid_api_key
# OR
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Payment
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional
LOG_LEVEL=debug
```

4. Start the server:
```bash
npm run dev  # Development mode with nodemon
# OR
npm start   # Production mode
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in frontend directory:
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

4. Start the development server:
```bash
npm run dev
```

## 📁 Project Structure

```
ManiProject/
├── backend/
│   ├── config/          # Configuration files (DB, email, logger, env)
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware (auth, validation, error)
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── services/        # Business logic services
│   ├── utils/           # Utility functions
│   ├── logs/            # Application logs (auto-generated)
│   └── server.js        # Main server file
│
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── contexts/    # React Context providers
│   │   ├── pages/       # Page components
│   │   ├── services/    # API service layer
│   │   └── utils/       # Utility functions
│   └── dist/           # Build output
│
└── README.md           # This file
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - Password login
- `GET /api/auth/me` - Get current user
- `POST /api/otp/send` - Send OTP email
- `POST /api/otp/verify` - Verify OTP code

### Products
- `GET /api/products` - List products (with filters, pagination)
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (seller)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status

### Payments
- `POST /api/payments/create-intent` - Create Stripe payment intent
- `POST /api/payments/confirm-payment` - Confirm payment
- `POST /api/payments/webhook` - Stripe webhook handler

### Cart & Wishlist
- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove from cart
- Similar endpoints for wishlist

### Admin
- `GET /api/admin/users` - List all users
- `GET /api/admin/sellers` - List all sellers
- `GET /api/admin/products` - List all products
- `GET /api/admin/orders` - List all orders
- `GET /api/admin/analytics` - Platform analytics

## 🚢 Deployment

### Backend Deployment (Render.com)

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set the following:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: `Node`

4. Add environment variables in Render dashboard:
   - All variables from `.env` file
   - Set `NODE_ENV=production`
   - Set `CLIENT_URL` to your frontend URL

### Frontend Deployment (Render.com)

1. Create a new Static Site
2. Set the following:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

3. Add environment variables:
   - `VITE_API_BASE_URL` - Your backend URL
   - `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

### Environment Variables Checklist

**Backend (Required):**
- ✅ `MONGO_URI`
- ✅ `JWT_SECRET` (min 32 characters)
- ✅ `CLIENT_URL`

**Backend (Recommended):**
- ✅ `STRIPE_SECRET_KEY`
- ✅ `SENDGRID_API_KEY` or `EMAIL_USER/EMAIL_PASS`
- ✅ `CLOUDINARY_API_SECRET`

**Frontend:**
- ✅ `VITE_API_BASE_URL`
- ✅ `VITE_STRIPE_PUBLISHABLE_KEY`

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test                    # Run connection tests
npm run test:mongodb       # Test MongoDB connection
npm run test:stripe        # Test Stripe configuration
npm run test:email         # Test email service
```

### Frontend Tests
```bash
cd frontend
npm test                   # Run Jest tests
npm run test:watch         # Watch mode
```

## 📊 Monitoring & Logging

### Logs
- Logs are stored in `backend/logs/` directory
- Daily rotation with 14-day retention
- Separate files for errors, combined logs, exceptions

### Health Check
- `GET /health` - Comprehensive health check endpoint
- Checks database, Stripe, email, and Cloudinary status

### Request Tracking
- All requests include `X-Request-ID` header
- Request IDs logged for debugging

## 🔒 Security Best Practices

1. **Never commit `.env` files**
2. **Use strong JWT secrets** (minimum 32 characters)
3. **Enable MongoDB IP whitelisting**
4. **Use HTTPS in production**
5. **Regularly update dependencies**
6. **Monitor logs for suspicious activity**

## 📝 API Documentation

For detailed API documentation, see:
- Swagger/OpenAPI: Coming soon
- Postman Collection: Coming soon

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
- Check MongoDB connection string
- Verify all required environment variables are set
- Check logs in `backend/logs/` directory

**CORS errors:**
- Ensure `CLIENT_URL` is set correctly
- Check CORS configuration in `server.js`

**Payment issues:**
- Verify Stripe keys are correct
- Check Stripe webhook configuration
- Review payment logs

**Image upload fails:**
- Verify Cloudinary credentials
- Check file size limits (10MB max)
- Review upload service logs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

ISC

## 👥 Support

For issues and questions:
- Check the documentation files in the root directory
- Review logs for error details
- Check deployment guides

## 🎯 Roadmap

- [ ] Advanced search with Elasticsearch
- [ ] Real-time notifications
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Automated testing suite
- [ ] API rate limiting per user
- [ ] Caching layer (Redis)

---

**Built with ❤️ using React, Node.js, MongoDB, and Stripe**

