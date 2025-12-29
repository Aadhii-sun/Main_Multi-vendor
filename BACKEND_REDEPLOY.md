# Backend Redeployment Guide for Render

## Step-by-Step: Redeploy Backend on Render

### Option 1: Update Existing Backend Service (Recommended)

If you already have a backend service on Render:

1. **Go to Render Dashboard**
   - Navigate to https://dashboard.render.com
   - Find your backend service (likely named "EGO Store" or "ego-store")

2. **Update Environment Variables**
   - Click on your backend service
   - Go to **Settings** → **Environment**
   - Verify/Update these variables:
     ```
     NODE_ENV=production
     PORT=5000
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret_here
     CLIENT_URL=https://ego-store-p0yt.onrender.com
     EMAIL_USER=your_email@gmail.com (optional)
     EMAIL_PASS=your_app_password (optional)
     STRIPE_SECRET_KEY=your_stripe_key (optional)
     STRIPE_WEBHOOK_SECRET=your_webhook_secret (optional)
     ```

3. **Verify Build Settings**
   - Go to **Settings** → **Build & Deploy**
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm run start`

4. **Redeploy**
   - Go to **Manual Deploy** tab
   - Click **"Clear build cache & deploy"**
   - Wait 5-10 minutes for deployment

---

### Option 2: Create New Backend Service (Fresh Start)

If you want to start completely fresh:

1. **Delete Old Service (if exists)**
   - Go to your backend service on Render
   - Click **Settings** → Scroll down → **Delete Service**
   - Confirm deletion

2. **Create New Web Service**
   - Go to https://dashboard.render.com
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub repository: `Aadhii-sun/Main_Multi-vendor`
   - Select branch: `main`

3. **Configure Service Settings**
   - **Name:** `ego-store-backend` (or your preferred name)
   - **Environment:** `Node`
   - **Region:** Choose closest to you (e.g., `Oregon`, `Virginia`)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm run start`
   - **Plan:** `Free` (or upgrade if needed)

4. **Add Environment Variables**
   Click **"Advanced"** → **"Add Environment Variable"** and add:

   **Required Variables:**
   ```
   NODE_ENV=production
   PORT=5000
   MONGO_URI=mongodb+srv://[USERNAME]:[PASSWORD]@[CLUSTER].mongodb.net/ecommerce?retryWrites=true&w=majority
   JWT_SECRET=your_strong_jwt_secret_here_min_32_chars
   CLIENT_URL=https://ego-store-p0yt.onrender.com
   ```

   **Optional Variables (if you use these features):**
   ```
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_gmail_app_password
   STRIPE_SECRET_KEY=sk_test_your_stripe_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

5. **Create Service**
   - Click **"Create Web Service"**
   - Wait 5-10 minutes for initial deployment

6. **Verify Deployment**
   - Once deployed, check the **Logs** tab
   - Look for: `✅ MongoDB Connected Successfully`
   - Look for: `Server running in production mode on port 5000`
   - Test health endpoint: `https://your-backend-url.onrender.com/health`

---

## Important Configuration Details

### Root Directory
- Must be set to: `backend`
- This tells Render where your backend code is located

### Build Command
- Use: `npm install`
- This installs all dependencies

### Start Command
- Use: `npm run start`
- This runs `node server.js` as defined in package.json

### Port Configuration
- Render automatically assigns a port via `PORT` environment variable
- Your code uses `process.env.PORT || 5000` which is correct
- Don't hardcode port 5000 in production

### CORS Configuration
- `CLIENT_URL` must match your frontend URL exactly
- Current frontend: `https://ego-store-p0yt.onrender.com`
- Backend will allow requests from this origin

---

## After Deployment

### 1. Test Backend Health
Visit: `https://your-backend-url.onrender.com/health`
Expected response:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "uptime": ...,
  "environment": "production",
  "version": "1.0.0"
}
```

### 2. Test API Endpoint
Visit: `https://your-backend-url.onrender.com/api/products`
Should return products or require authentication

### 3. Update Frontend (if backend URL changed)
If you created a new backend with a different URL:
- Go to Frontend service on Render
- Update `VITE_API_URL` environment variable
- Redeploy frontend

---

## Troubleshooting

### Backend won't start?
- Check **Logs** tab for errors
- Verify all required environment variables are set
- Ensure MongoDB URI is correct
- Check if JWT_SECRET is set

### CORS errors?
- Verify `CLIENT_URL` matches frontend URL exactly
- Check backend logs for CORS blocking messages
- Ensure frontend URL includes `https://`

### Database connection fails?
- Verify MongoDB Atlas IP whitelist allows `0.0.0.0/0` (all IPs)
- Check MongoDB connection string format
- Ensure database user has correct permissions

### 404 errors on API calls?
- Verify routes are mounted correctly in `server.js`
- Check that all routes start with `/api`
- Ensure backend is fully started (check logs)

---

## Current Backend URL
Your backend should be accessible at:
- **Current:** `https://ego-store.onrender.com`
- **Health Check:** `https://ego-store.onrender.com/health`
- **API Base:** `https://ego-store.onrender.com/api`

---

## Next Steps After Redeployment

1. ✅ Test backend health endpoint
2. ✅ Verify MongoDB connection in logs
3. ✅ Test API endpoints (products, auth, etc.)
4. ✅ Update frontend `VITE_API_URL` if backend URL changed
5. ✅ Test full login flow from frontend

---

**Need Help?**
- Check Render logs for detailed error messages
- Verify all environment variables are set correctly
- Ensure MongoDB Atlas is accessible from Render's IPs



