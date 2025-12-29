# Quick Start Guide

Get your EGO Store up and running in minutes!

## 🚀 Local Development Setup

### 1. Backend Setup (5 minutes)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example if available)
# Add these minimum required variables:
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_secret_key_min_32_chars

# Start server
npm run dev
```

Backend will run on `http://localhost:5000`

### 2. Frontend Setup (3 minutes)

```bash
# Navigate to frontend (in a new terminal)
cd frontend

# Install dependencies
npm install

# Create .env file
# VITE_API_BASE_URL=http://localhost:5000
# VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key

# Start dev server
npm run dev
```

Frontend will run on `http://localhost:5173`

## ✅ Verify Installation

1. **Backend Health Check**
   ```bash
   curl http://localhost:5000/health
   ```
   Should return: `{"status":"healthy",...}`

2. **Frontend**
   - Open `http://localhost:5173`
   - You should see the login page

## 🎯 Next Steps

1. **Set up MongoDB**
   - Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Get connection string
   - Add to `MONGO_URI` in backend `.env`

2. **Set up Stripe** (for payments)
   - Create account at [Stripe](https://stripe.com)
   - Get test API keys
   - Add to environment variables

3. **Set up Cloudinary** (for images)
   - Create account at [Cloudinary](https://cloudinary.com)
   - Get API credentials
   - Add to backend `.env`

4. **Set up Email** (for OTP)
   - Option 1: SendGrid (recommended)
   - Option 2: Gmail SMTP

## 📚 Full Documentation

- **Setup Guide**: See `README.md`
- **Deployment**: See `PRODUCTION_DEPLOYMENT.md`
- **Checklist**: See `DEPLOYMENT_CHECKLIST.md`

## 🆘 Need Help?

1. Check logs in `backend/logs/` directory
2. Review error messages in console
3. Verify all environment variables are set
4. Check MongoDB connection
5. Review documentation files

---

**Happy coding! 🎉**

