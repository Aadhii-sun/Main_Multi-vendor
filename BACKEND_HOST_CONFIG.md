# Backend Host Configuration - Single Form

## 🎯 Simple Single Configuration File

All backend host URLs and connections are now configured in **ONE SINGLE FILE**:

**📁 File:** `backend/config/backendHost.js`

## ✏️ How to Change Backend URLs

### Step 1: Open the Configuration File

Open: `backend/config/backendHost.js`

### Step 2: Edit the URLs (Lines 8-10)

```javascript
const BACKEND_CONFIG = {
  // Backend Server URL (where this backend is hosted)
  host: process.env.BACKEND_HOST || 'https://ego-store-backend.onrender.com',
  
  // Frontend URL (for CORS and redirects)
  frontend: process.env.CLIENT_URL || 'https://ego-store-frontend.onrender.com',
  
  // ... rest of config
};
```

### Step 3: Change the Default Values

Simply change the default URLs:

```javascript
// Example: Change backend host
host: process.env.BACKEND_HOST || 'https://your-new-backend.com',

// Example: Change frontend URL
frontend: process.env.CLIENT_URL || 'https://your-new-frontend.com',
```

## 🔧 Environment Variables (Optional)

You can also set these via environment variables in `backend/.env`:

```env
# Backend Host URL
BACKEND_HOST=https://ego-store-backend.onrender.com
BACKEND_URL=https://ego-store-backend.onrender.com

# Frontend URL
CLIENT_URL=https://ego-store-frontend.onrender.com
FRONTEND_URL=https://ego-store-frontend.onrender.com
```

**Priority:** Environment variables override the defaults in `backendHost.js`

## 📋 Complete Configuration Structure

```javascript
const BACKEND_CONFIG = {
  // Main URLs
  host: 'https://ego-store-backend.onrender.com',      // Backend URL
  frontend: 'https://ego-store-frontend.onrender.com',  // Frontend URL
  apiPath: '/api',                                      // API path
  
  // Database
  database: {
    uri: process.env.MONGO_URI,                         // MongoDB URL
  },
  
  // External Services
  services: {
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    },
    cloudinary: {
      cloudName: 'dkq9qo8vf',
      apiKey: '799582919956526',
      apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
  },
  
  // Server
  server: {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
};
```

## 🚀 Quick Examples

### Change Backend Host

**File:** `backend/config/backendHost.js` line 9

```javascript
host: process.env.BACKEND_HOST || 'https://my-new-backend.com',
```

### Change Frontend URL

**File:** `backend/config/backendHost.js` line 12

```javascript
frontend: process.env.CLIENT_URL || 'https://my-new-frontend.com',
```

### Change for Local Development

**File:** `backend/config/backendHost.js`

```javascript
host: process.env.BACKEND_HOST || 'http://localhost:5000',
frontend: process.env.CLIENT_URL || 'http://localhost:5173',
```

## ✅ What Gets Updated Automatically

When you change URLs in `backendHost.js`, these are automatically updated:

- ✅ CORS allowed origins
- ✅ Email redirect URLs
- ✅ API endpoints
- ✅ Server configuration
- ✅ All backend references

## 📍 Where It's Used

The centralized config is used in:

1. **`backend/config/env.js`** - Main config export
2. **`backend/config/cors.js`** - CORS allowed origins
3. **`backend/server.js`** - Server setup and logging
4. **All controllers** - Via `config` import

## 🎯 Summary

**ONE FILE TO RULE THEM ALL:** `backend/config/backendHost.js`

- Change backend URL → Edit line 9
- Change frontend URL → Edit line 12
- Everything else updates automatically!

---

**That's it! Simple, single form configuration! 🎉**

