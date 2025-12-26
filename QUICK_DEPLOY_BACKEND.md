# Quick Backend Deployment to Render

## Step-by-Step Instructions

### 1. Go to Render Dashboard
- Visit: https://dashboard.render.com
- Sign in or create account

### 2. Create New Web Service
- Click **"New +"** button (top right)
- Select **"Web Service"**

### 3. Connect GitHub Repository
- Click **"Connect account"** if not connected
- Select repository: `Aadhii-sun/Main_Multi-vendor`
- Click **"Connect"**

### 4. Configure Service Settings

**Basic Information:**
- **Name:** `ego-store-backend` (or your preferred name)
- **Region:** `Oregon` (or closest to you)
- **Branch:** `main`
- **Root Directory:** `backend` ⚠️ **CRITICAL - Must be "backend"**

**Build & Deploy:**
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Plan:** `Free` (or upgrade if needed)

### 5. Add Environment Variables

Click **"Advanced"** → Scroll to **"Environment Variables"** → Click **"Add Environment Variable"**

#### Required Variables (MUST HAVE):
```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority
JWT_SECRET=your_strong_secret_minimum_32_characters_long_use_random_string
CLIENT_URL=https://ego-store-frontend.onrender.com
```

⚠️ **Note:** Update `CLIENT_URL` after frontend deploys. For now, use a placeholder or your expected frontend URL.

#### Optional Variables (Add if you use these features):
```
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 6. Create Service
- Click **"Create Web Service"** button
- Wait 5-10 minutes for deployment

### 7. Monitor Deployment
- Watch the **"Logs"** tab
- Look for:
  - ✅ `✅ MongoDB Connected Successfully`
  - ✅ `Server running in production mode on port 5000`
  - ✅ No error messages

### 8. Test Deployment

Once deployed, test these endpoints:

1. **Health Check:**
   ```
   https://your-backend-url.onrender.com/health
   ```
   Should return JSON with status: "healthy"

2. **API Test:**
   ```
   https://your-backend-url.onrender.com/api/test
   ```
   Should return JSON with message: "API is working!"

3. **Save Your Backend URL:**
   - Note the URL: `https://________________.onrender.com`
   - You'll need this for frontend deployment

---

## Troubleshooting

### Build Fails?
- Check logs for missing dependencies
- Verify Root Directory is set to `backend`
- Ensure package.json exists in backend folder

### Server Won't Start?
- Check logs for error messages
- Verify `MONGO_URI` is correct
- Verify `JWT_SECRET` is set (minimum 32 characters)
- Check MongoDB Atlas allows connections from all IPs (0.0.0.0/0)

### Database Connection Fails?
- Verify MongoDB connection string format
- Check MongoDB Atlas Network Access allows all IPs
- Ensure database user has correct permissions

---

## Next Steps After Backend Deploys

1. ✅ Test health endpoint
2. ✅ Test API endpoint
3. ✅ Note backend URL
4. ✅ Deploy frontend (use backend URL in VITE_API_URL)
5. ✅ Update backend CLIENT_URL with frontend URL

