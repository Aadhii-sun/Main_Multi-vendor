# Complete Deployment Guide - Render.com

This guide will help you deploy both backend and frontend to Render.com.

## Prerequisites

- ✅ GitHub repository with your code pushed
- ✅ MongoDB Atlas account (or MongoDB connection string)
- ✅ Render.com account (free tier works)
- ✅ All environment variables ready

---

## Step 1: Deploy Backend First

### 1.1 Create Backend Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select branch: `main` (or your default branch)

### 1.2 Configure Backend Settings

**Basic Settings:**
- **Name:** `ego-store-backend` (or your preferred name)
- **Environment:** `Node`
- **Region:** `Oregon` (or closest to you)
- **Branch:** `main`
- **Root Directory:** `backend` ⚠️ **IMPORTANT**
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Plan:** `Free` (or upgrade if needed)

### 1.3 Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add:

#### Required Variables:
```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://[USERNAME]:[PASSWORD]@[CLUSTER].mongodb.net/ecommerce?retryWrites=true&w=majority
JWT_SECRET=your_strong_jwt_secret_here_minimum_32_characters_long
CLIENT_URL=https://ego-store-frontend.onrender.com
```

#### Optional Variables (if you use these features):
```
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 1.4 Create and Deploy

1. Click **"Create Web Service"**
2. Wait 5-10 minutes for initial deployment
3. Note your backend URL: `https://ego-store-backend.onrender.com`

### 1.5 Verify Backend Deployment

1. Check **Logs** tab - look for:
   - `✅ MongoDB Connected Successfully`
   - `Server running in production mode on port 5000`

2. Test health endpoint:
   ```
   https://your-backend-url.onrender.com/health
   ```
   Should return:
   ```json
   {
     "status": "healthy",
     "timestamp": "...",
     "uptime": ...,
     "environment": "production"
   }
   ```

3. Test API endpoint:
   ```
   https://your-backend-url.onrender.com/api/test
   ```

---

## Step 2: Deploy Frontend

### 2.1 Create Frontend Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Static Site"**
3. Connect your GitHub repository (same as backend)
4. Select branch: `main`

### 2.2 Configure Frontend Settings

**Basic Settings:**
- **Name:** `ego-store-frontend` (or your preferred name)
- **Environment:** `Static`
- **Region:** `Oregon` (or same as backend)
- **Branch:** `main`
- **Root Directory:** `frontend` ⚠️ **IMPORTANT**
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist` ⚠️ **IMPORTANT**
- **Plan:** `Free` (or upgrade if needed)

### 2.3 Add Environment Variables

Click **"Environment"** → **"Add Environment Variable"**:

```
VITE_API_URL=https://ego-store-backend.onrender.com
```

⚠️ **IMPORTANT:** Replace `ego-store-backend.onrender.com` with your actual backend URL from Step 1.4

### 2.4 Create and Deploy

1. Click **"Create Static Site"**
2. Wait 5-10 minutes for initial deployment
3. Note your frontend URL: `https://ego-store-frontend.onrender.com`

### 2.5 Update Backend CORS

1. Go back to your **Backend Service** on Render
2. Go to **Environment** tab
3. Update `CLIENT_URL` to match your frontend URL:
   ```
   CLIENT_URL=https://ego-store-frontend.onrender.com
   ```
4. Click **"Save Changes"** - this will trigger a redeploy

---

## Step 3: Final Verification

### 3.1 Test Frontend

1. Visit your frontend URL: `https://ego-store-frontend.onrender.com`
2. Open browser console (F12)
3. Check for:
   - ✅ API URL is correct
   - ✅ No CORS errors
   - ✅ Backend connection successful

### 3.2 Test Full Flow

1. **Register a new user**
2. **Login**
3. **Browse products**
4. **Add to cart**
5. **Checkout** (if payment is configured)

### 3.3 Check Backend Logs

Monitor backend logs for any errors:
- Go to Backend Service → **Logs** tab
- Look for any error messages
- Verify all API calls are being received

---

## Important Notes

### Free Tier Limitations

- **Backend:** May sleep after 15 minutes of inactivity
- **Frontend:** Always available (static sites don't sleep)
- **First request after sleep:** May take 30-60 seconds to wake up

### Environment Variables

- **Never commit `.env` files to GitHub**
- **Always set variables in Render Dashboard**
- **Backend variables:** Set in Backend Service → Environment
- **Frontend variables:** Must start with `VITE_` prefix

### CORS Configuration

- Backend `CLIENT_URL` must match frontend URL exactly
- Include `https://` in the URL
- No trailing slash

### MongoDB Atlas

- Ensure MongoDB Atlas allows connections from `0.0.0.0/0` (all IPs)
- Or add Render's IP ranges to whitelist
- Verify connection string format is correct

---

## Troubleshooting

### Backend won't start?

1. Check **Logs** tab for errors
2. Verify all required environment variables are set:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `CLIENT_URL`
3. Ensure MongoDB connection string is correct
4. Check if port is set correctly (Render auto-assigns, but PORT=5000 is good)

### CORS errors?

1. Verify `CLIENT_URL` in backend matches frontend URL exactly
2. Check backend logs for CORS blocking messages
3. Ensure frontend URL includes `https://`
4. No trailing slash in `CLIENT_URL`

### Frontend can't connect to backend?

1. Verify `VITE_API_URL` is set correctly in frontend
2. Check browser console for API URL being used
3. Ensure backend is awake (make a request to `/health`)
4. Check backend logs to see if requests are received

### Database connection fails?

1. Verify MongoDB Atlas IP whitelist allows `0.0.0.0/0`
2. Check MongoDB connection string format
3. Ensure database user has correct permissions
4. Test connection string locally first

### 404 errors on API calls?

1. Verify routes are mounted correctly in `server.js`
2. Check that all routes start with `/api`
3. Ensure backend is fully started (check logs)
4. Test endpoints directly: `https://backend-url.onrender.com/api/test`

---

## Quick Reference

### Backend URLs
- **Health Check:** `https://ego-store-backend.onrender.com/health`
- **API Base:** `https://ego-store-backend.onrender.com/api`
- **Test Endpoint:** `https://ego-store-backend.onrender.com/api/test`

### Frontend URL
- **Live Site:** `https://ego-store-frontend.onrender.com`

### Environment Variables Checklist

**Backend:**
- [ ] `NODE_ENV=production`
- [ ] `PORT=5000`
- [ ] `MONGO_URI=...`
- [ ] `JWT_SECRET=...`
- [ ] `CLIENT_URL=...`
- [ ] `EMAIL_USER=...` (optional)
- [ ] `EMAIL_PASS=...` (optional)
- [ ] `STRIPE_SECRET_KEY=...` (optional)

**Frontend:**
- [ ] `VITE_API_URL=...`

---

## Next Steps After Deployment

1. ✅ Test all major features
2. ✅ Set up custom domain (optional)
3. ✅ Configure monitoring (optional)
4. ✅ Set up automated backups for MongoDB
5. ✅ Review security settings

---

**Need Help?**
- Check Render logs for detailed error messages
- Verify all environment variables are set correctly
- Ensure MongoDB Atlas is accessible from Render's IPs
- Test endpoints individually to isolate issues
