# New Backend Setup on Render - Step by Step

## Complete Guide to Deploy Backend Fresh

### Step 1: Create New Web Service

1. **Go to Render Dashboard**
   - Navigate to https://dashboard.render.com
   - Make sure you're logged in

2. **Create New Service**
   - Click the **"New +"** button (top right)
   - Select **"Web Service"** from the dropdown

3. **Connect GitHub Repository**
   - Click **"Connect account"** if not already connected
   - Select your repository: **`Aadhii-sun/Main_Multi-vendor`**
   - Click **"Connect"**

---

### Step 2: Configure Service Settings

Fill in the following details:

**Basic Settings:**
- **Name:** `ego-store-backend` (or your preferred name)
- **Environment:** `Node`
- **Region:** Choose closest to you (e.g., `Oregon (US West)`, `Virginia (US East)`)
- **Branch:** `main`
- **Root Directory:** `backend` ⚠️ **IMPORTANT: Must be `backend`**
- **Runtime:** `Node` (should auto-detect)
- **Build Command:** `npm install`
- **Start Command:** `npm run start`
- **Instance Type:** `Free` (or upgrade if needed)

**Advanced Settings (click "Advanced"):**
- Leave other settings as default for now

---

### Step 3: Add Environment Variables

**⚠️ CRITICAL: Add these BEFORE creating the service**

Click **"Add Environment Variable"** and add each one:

#### Required Variables:

1. **NODE_ENV**
   - Key: `NODE_ENV`
   - Value: `production`
   - ⚠️ Must be `production`, NOT `development`

2. **PORT**
   - Key: `PORT`
   - Value: `5000`
   - (Render will override this, but set it anyway)

3. **MONGO_URI**
   - Key: `MONGO_URI`
   - Value: `mongodb+srv://[USERNAME]:[PASSWORD]@[CLUSTER].mongodb.net/ecommerce?retryWrites=true&w=majority`
   - Replace `[USERNAME]`, `[PASSWORD]`, and `[CLUSTER]` with your actual MongoDB credentials

4. **JWT_SECRET**
   - Key: `JWT_SECRET`
   - Value: `your_strong_secret_key_here_min_32_characters`
   - Use a long, random string (at least 32 characters)

5. **CLIENT_URL**
   - Key: `CLIENT_URL`
   - Value: `https://ego-store-p0yt.onrender.com`
   - ⚠️ This is your FRONTEND URL (for CORS)

#### Optional Variables (if you use these features):

6. **EMAIL_USER**
   - Key: `EMAIL_USER`
   - Value: `adithyananimon9@gmail.com` (or your email)

7. **EMAIL_PASS**
   - Key: `EMAIL_PASS`
   - Value: `your_gmail_app_password`
   - Get this from Gmail → Account → Security → App Passwords

8. **STRIPE_SECRET_KEY**
   - Key: `STRIPE_SECRET_KEY`
   - Value: `sk_test_your_stripe_key` (if using Stripe)

9. **STRIPE_WEBHOOK_SECRET**
   - Key: `STRIPE_WEBHOOK_SECRET`
   - Value: `whsec_your_webhook_secret` (if using Stripe)

10. **GOOGLE_CLIENT_ID** (if using Google OAuth)
    - Key: `GOOGLE_CLIENT_ID`
    - Value: `your_google_client_id`

11. **GOOGLE_CLIENT_SECRET** (if using Google OAuth)
    - Key: `GOOGLE_CLIENT_SECRET`
    - Value: `your_google_client_secret`

---

### Step 4: Create the Service

1. **Review all settings** - Make sure everything is correct
2. Click **"Create Web Service"** at the bottom
3. **Wait 5-10 minutes** for the initial deployment

---

### Step 5: Verify Deployment

While deployment is in progress:

1. **Watch the Logs**
   - Click on your new service
   - Go to **"Logs"** tab
   - Watch for:
     - `✅ Environment configuration loaded`
     - `✅ MongoDB Connected Successfully`
     - `Server running in production mode on port 5000`
     - `🌐 CORS: Production mode - restricted origins`

2. **Check for Errors**
   - Look for any red error messages
   - Common issues:
     - Missing environment variables
     - MongoDB connection failed
     - Port binding issues

---

### Step 6: Test the Backend

Once deployment is complete:

1. **Health Check**
   - Visit: `https://your-backend-name.onrender.com/health`
   - Should return: `{"status":"healthy","environment":"production",...}`

2. **API Test**
   - Visit: `https://your-backend-name.onrender.com/api/test`
   - Should return: `{"message":"API is working!",...}`

3. **Check Logs**
   - Go to **Logs** tab
   - Should see: `✅ MongoDB Connected Successfully`
   - Should see: `Server running in production mode`

---

### Step 7: Update Frontend (if backend URL changed)

If your new backend has a different URL:

1. **Go to Frontend Service on Render**
   - Navigate to your frontend static site
   - Go to **Settings** → **Environment**

2. **Update VITE_API_URL**
   - Find `VITE_API_URL`
   - Update value to: `https://your-new-backend-url.onrender.com`
   - (No `/api` suffix, no trailing slash)

3. **Redeploy Frontend**
   - Go to **Manual Deploy** tab
   - Click **"Deploy latest commit"**
   - Wait 3-5 minutes

---

## Quick Checklist

Before creating the service, make sure you have:

- [ ] MongoDB connection string ready
- [ ] JWT secret key ready (32+ characters)
- [ ] Frontend URL: `https://ego-store-p0yt.onrender.com`
- [ ] All optional credentials (email, Stripe, etc.) if needed

During setup:

- [ ] Root Directory set to: `backend`
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm run start`
- [ ] NODE_ENV = `production` (NOT development)
- [ ] CLIENT_URL = `https://ego-store-p0yt.onrender.com`
- [ ] All required environment variables added

After deployment:

- [ ] Health check works: `/health`
- [ ] API test works: `/api/test`
- [ ] MongoDB connected (check logs)
- [ ] CORS configured (check logs)
- [ ] Frontend VITE_API_URL updated (if needed)

---

## Common Issues & Solutions

### Issue: "MongoDB connection failed"
**Solution:**
- Verify MongoDB URI is correct
- Check MongoDB Atlas → Network Access → Allow `0.0.0.0/0` (all IPs)
- Ensure database user has correct permissions

### Issue: "CORS errors"
**Solution:**
- Verify `CLIENT_URL` matches frontend URL exactly
- Check `NODE_ENV` is set to `production`
- Ensure frontend URL includes `https://`

### Issue: "Port binding error"
**Solution:**
- Render automatically assigns port via `PORT` env var
- Your code uses `process.env.PORT || 5000` which is correct
- Don't hardcode port 5000

### Issue: "Build failed"
**Solution:**
- Check Root Directory is `backend` (not `/backend` or empty)
- Verify `package.json` exists in backend folder
- Check build logs for specific npm errors

---

## Your Current Configuration

**Frontend URL:** `https://ego-store-p0yt.onrender.com`

**Backend URL (new):** `https://your-backend-name.onrender.com` (will be assigned by Render)

**After deployment, update frontend:**
- `VITE_API_URL` = `https://your-backend-name.onrender.com`

---

## Need Help?

If you encounter issues:
1. Check the **Logs** tab for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB Atlas allows connections from Render
4. Test backend endpoints directly in browser

**Ready to create the service? Follow the steps above!**





