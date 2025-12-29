# Backend URLs and Connection Configuration

Complete guide to all backend URL and connection settings.

## 📍 Main Configuration Files

### 1. Environment Variables Configuration
**File:** `backend/config/env.js`

This is the **main file** where all backend URLs and connections are configured:

```javascript
module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,                    // MongoDB connection
  jwtSecret: process.env.JWT_SECRET,
  clientUrl: process.env.CLIENT_URL,                   // Frontend URL for CORS
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY          // Stripe API
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'dkq9qo8vf',
    apiKey: process.env.CLOUDINARY_API_KEY || '799582919956526',
    apiSecret: process.env.CLOUDINARY_API_SECRET
  },
  email: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY
  }
};
```

**Lines 74-101:** All environment variables are exported here

---

### 2. CORS Configuration (Frontend URL)
**File:** `backend/config/cors.js`

**Lines 12-24:** Allowed frontend origins:
```javascript
const getAllowedOrigins = () => {
  const allowedOrigins = [
    config.clientUrl,                              // From CLIENT_URL env var
    process.env.CLIENT_URL,                        // Direct env var
    'http://localhost:5173',                       // Local dev
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'https://ego-store-frontend.onrender.com',     // Production frontend
    // ...
  ];
};
```

**Where to change:** Edit lines 14-23 to add/remove allowed frontend URLs

---

### 3. Server Configuration
**File:** `backend/server.js`

**Line 2:** Loads config from `env.js`
```javascript
const config = require('./config/env');
```

**Line 137:** Stripe configuration
```javascript
const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;
```

**Line 290:** Server port
```javascript
const PORT = process.env.PORT || 5000;
```

**Lines 299-308:** Server startup logs show URLs
```javascript
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server URL: http://0.0.0.0:${PORT}`);
  logger.info(`Health check: http://0.0.0.0:${PORT}/health`);
  logger.info(`API test: http://0.0.0.0:${PORT}/api/test`);
});
```

---

### 4. MongoDB Connection
**File:** `backend/config/db.js`

**Line 11:** MongoDB connection URL
```javascript
const conn = await mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  family: 4,
});
```

**Where to change:** Set `MONGO_URI` environment variable

---

## 🔧 Environment Variables (`.env` file)

Create `backend/.env` file with these URLs/connections:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Frontend URL (for CORS)
CLIENT_URL=https://ego-store-frontend.onrender.com

# Database Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# Authentication
JWT_SECRET=your_very_long_secret_key_minimum_32_characters

# Payment (Stripe)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Image Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME=dkq9qo8vf
CLOUDINARY_API_KEY=799582919956526
CLOUDINARY_API_SECRET=your_api_secret

# Email Service (Choose one)
# Option 1: SendGrid
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Option 2: SMTP
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

---

## 📋 Quick Reference Table

| Setting | Environment Variable | Config File | Default/Example |
|---------|---------------------|-------------|-----------------|
| **Server Port** | `PORT` | `env.js` line 76 | `5000` |
| **Frontend URL** | `CLIENT_URL` | `cors.js` line 14 | `https://ego-store-frontend.onrender.com` |
| **MongoDB** | `MONGO_URI` | `db.js` line 11 | `mongodb+srv://...` |
| **Stripe** | `STRIPE_SECRET_KEY` | `server.js` line 137 | `sk_live_...` |
| **Cloudinary** | `CLOUDINARY_*` | `env.js` lines 96-100 | `dkq9qo8vf` |
| **Email** | `SENDGRID_API_KEY` or `EMAIL_USER` | `env.js` lines 83-86 | - |

---

## 🎯 How to Change Backend URLs

### Change Frontend URL (CORS)

**Option 1: Environment Variable (Recommended)**
```bash
# In backend/.env or Render.com environment variables
CLIENT_URL=https://your-new-frontend-url.com
```

**Option 2: Edit Code**
Edit `backend/config/cors.js` line 21:
```javascript
'https://your-new-frontend-url.com', // Production frontend
```

### Change MongoDB Connection

**In `backend/.env`:**
```env
MONGO_URI=mongodb+srv://new-username:password@new-cluster.mongodb.net/dbname
```

### Change Server Port

**In `backend/.env`:**
```env
PORT=3000
```

Or edit `backend/config/env.js` line 76:
```javascript
port: process.env.PORT || 3000,  // Changed default
```

### Change Cloudinary

**In `backend/.env`:**
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Or edit `backend/config/env.js` lines 96-100

---

## 🔍 Where URLs Are Used

### Frontend URL (`CLIENT_URL`)
- **CORS configuration:** `backend/config/cors.js` (lines 14, 21)
- **Email links:** Email service (password reset, OTP links)
- **Redirect URLs:** After authentication

### MongoDB URL (`MONGO_URI`)
- **Database connection:** `backend/config/db.js` (line 11)
- **Loaded from:** `backend/config/env.js` (line 77)

### Stripe URL/Keys
- **Payment processing:** `backend/server.js` (line 137)
- **Webhook endpoint:** `backend/controllers/paymentController.js`

### Cloudinary URLs
- **Image upload:** `backend/services/uploadService.js`
- **Image transformation:** Cloudinary SDK

---

## 🚀 Production URLs (Render.com)

### Backend Service
```
https://ego-store-backend.onrender.com
```

### Frontend Service
```
https://ego-store-frontend.onrender.com
```

### API Endpoints
```
https://ego-store-backend.onrender.com/api
https://ego-store-backend.onrender.com/api/products
https://ego-store-backend.onrender.com/api/auth/signin
```

---

## 📝 Summary

**Main Configuration File:** `backend/config/env.js`
- All environment variables are loaded and exported here
- This is the single source of truth for backend configuration

**CORS Configuration:** `backend/config/cors.js`
- Frontend URLs that are allowed to access the backend
- Edit lines 14-23 to add/remove frontend URLs

**Database Connection:** `backend/config/db.js`
- MongoDB connection using `MONGO_URI` from environment

**Server Setup:** `backend/server.js`
- Uses config from `env.js`
- Sets up Stripe, Cloudinary, and other services

---

**All backend URLs and connections are configured through environment variables, loaded in `backend/config/env.js`! 🎯**

