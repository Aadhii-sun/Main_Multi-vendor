# Render Backend Deployment Guide

This guide will help you deploy and troubleshoot your backend on Render.

## ✅ Pre-Deployment Checklist

### 1. Required Environment Variables in Render Dashboard

Go to your Render dashboard → Your Backend Service → Environment → Add the following variables:

#### **Required (Must Have):**
- `MONGO_URI` - Your MongoDB Atlas connection string
  - Format: `mongodb+srv://username:password@cluster.mongodb.net/dbname`
  - Make sure username/password are URL-encoded if they contain special characters
- `JWT_SECRET` - A random secret string for JWT token signing
  - Generate one: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

#### **Optional (Recommended):**
- `PORT` - **DO NOT SET THIS** - Render sets it automatically
- `NODE_ENV` - Set to `production` for production deployments
- `CLIENT_URL` - Your frontend URL (e.g., `https://ego-store-frontend.onrender.com`)
- `SENDGRID_API_KEY` - **RECOMMENDED** - SendGrid API key for sending emails (works on Render free tier)
- `SENDGRID_FROM_EMAIL` - Verified sender email address in SendGrid
- `SENDGRID_FROM_NAME` - Display name for emails (optional)
- `EMAIL_USER` - Gmail address (only for local development, won't work on Render)
- `EMAIL_PASS` - Gmail app password (only for local development, won't work on Render)
- `STRIPE_SECRET_KEY` - Your Stripe secret key (if using payments)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID (if using Google login)
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret (if using Google login)

**⚠️ Important:** Render's free tier blocks SMTP connections. Use SendGrid for email sending in production. See `SENDGRID_SETUP.md` for setup instructions.

### 2. MongoDB Atlas Configuration

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Navigate to **Network Access**
3. Click **Add IP Address**
4. For Render, add: `0.0.0.0/0` (allows all IPs) OR add Render's specific IP ranges
5. Make sure your cluster is **running** (not paused)

### 3. Build & Start Commands

In Render dashboard → Settings → Build & Deploy:

- **Build Command:** `cd backend && npm install`
- **Start Command:** `cd backend && npm start`

## 🔍 Troubleshooting Steps

### Step 1: Check Render Logs

1. Go to your Render dashboard
2. Select your backend service
3. Click on the **"Logs"** tab
4. Look for errors like:
   - `Exited with status 1` - Server crashed
   - `Missing required environment variables` - Missing env vars
   - `MongoDB Connection Failed` - Database connection issue
   - `EADDRINUSE` - Port already in use (shouldn't happen on Render)

### Step 2: Verify Environment Variables

In Render logs, you should see:
```
✅ Environment variables loaded successfully
Environment: production
PORT: [number] (should be set by Render automatically)
MongoDB URI: Configured
JWT Secret: Configured
```

If you see "Missing" for required variables, add them in Render dashboard.

### Step 3: Test Your Endpoints

Once your backend is deployed and showing "Live" status:

1. **Health Check:**
   ```
   https://ego-store-backend.onrender.com/health
   ```
   Should return: `{"status":"healthy",...}`

2. **API Test:**
   ```
   https://ego-store-backend.onrender.com/api/test
   ```
   Should return: `{"message":"API is working!",...}`

3. **OTP Routes Test:**
   ```
   https://ego-store-backend.onrender.com/api/otp/test
   ```
   Should return:
   ```json
   {
     "success": true,
     "message": "OTP routes are working correctly",
     "routes": {
       "POST /api/otp/send": "Send OTP to email",
       "POST /api/otp/verify": "Verify OTP code",
       ...
     }
   }
   ```

### Step 4: Common Issues & Fixes

#### Issue: "Missing required environment variables"
**Fix:** 
- Go to Render dashboard → Environment
- Add missing variables (MONGO_URI, JWT_SECRET are required)
- Click "Save Changes"
- Click "Manual Deploy" or wait for auto-deploy

#### Issue: "MongoDB Connection Failed"
**Fix:**
1. Check MongoDB Atlas Network Access (allow 0.0.0.0/0 or Render IPs)
2. Verify MONGO_URI is correct in Render environment variables
3. Check if MongoDB cluster is running (not paused)
4. Verify username/password in connection string are correct
5. Make sure special characters in password are URL-encoded

#### Issue: "Server crashed" or "Exited with status 1"
**Fix:**
1. Check Render logs for the exact error message
2. Common causes:
   - Missing environment variables
   - MongoDB connection failure
   - Syntax errors in code
   - Missing dependencies

#### Issue: "CORS errors" from frontend
**Fix:**
1. Set `CLIENT_URL` environment variable in Render to your frontend URL
2. Make sure frontend URL matches exactly (including https://)
3. Check server logs for CORS blocking messages

#### Issue: "OTP not sending"
**Fix:**
1. **Use SendGrid** (recommended for Render):
   - Set `SENDGRID_API_KEY` in Render environment variables
   - Set `SENDGRID_FROM_EMAIL` to your verified sender email
   - See `SENDGRID_SETUP.md` for detailed instructions
2. **SMTP won't work on Render free tier** - Gmail SMTP is blocked
3. If SendGrid is not configured, OTP will be logged to server console (check Render logs)
4. For production, you must use SendGrid or another transactional email service

### Step 5: Manual Redeploy

If you make changes:
1. Go to Render dashboard → Your service
2. Click **"Manual Deploy"** → **"Deploy latest commit"**
3. Wait for deployment to complete
4. Check logs to ensure it started successfully

## 🧪 Testing After Deployment

1. **Test OTP Send:**
   ```bash
   curl -X POST https://ego-store-backend.onrender.com/api/otp/send \
     -H "Content-Type: application/json" \
     -d '{"email":"your-email@example.com"}'
   ```

2. **Check Server Status:**
   ```bash
   curl https://ego-store-backend.onrender.com/health
   ```

3. **View All Routes:**
   ```bash
   curl https://ego-store-backend.onrender.com/api/routes
   ```

## 📝 Notes

- Render automatically sets the `PORT` environment variable - **do not override it**
- The server listens on `0.0.0.0` to accept external connections
- If email is not configured, OTP codes will be logged to Render logs (check Logs tab)
- All API routes are prefixed with `/api`
- Health check endpoint is available at `/health`

## 🆘 Still Having Issues?

1. Check Render logs for specific error messages
2. Verify all environment variables are set correctly
3. Test MongoDB connection separately
4. Check that your code changes are committed and pushed to GitHub
5. Ensure Render is deploying from the correct branch

