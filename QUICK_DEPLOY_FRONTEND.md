# Quick Frontend Deployment to Render

## Backend is Live! ✅
- **Backend URL:** `https://ego-store-backend.onrender.com`
- **Health Check:** Working ✅
- **API Test:** Working ✅

---

## Step-by-Step Frontend Deployment

### 1. Go to Render Dashboard
- Visit: https://dashboard.render.com
- You should see your backend service already there

### 2. Create New Static Site
- Click **"New +"** button (top right)
- Select **"Static Site"** (NOT Web Service)

### 3. Connect GitHub Repository
- Select repository: `Aadhii-sun/Main_Multi-vendor`
- Click **"Connect"**

### 4. Configure Service Settings

**Basic Information:**
- **Name:** `ego-store-frontend` (or your preferred name)
- **Region:** `Oregon` (or same as backend)
- **Branch:** `main`
- **Root Directory:** `frontend` ⚠️ **CRITICAL - Must be "frontend"**

**Build & Deploy:**
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist` ⚠️ **CRITICAL - Must be "dist"**
- **Plan:** `Free` (or upgrade if needed)

### 5. Add Environment Variable

Click **"Environment"** → **"Add Environment Variable"**

**Required Variable:**
```
VITE_API_URL=https://ego-store-backend.onrender.com
```

⚠️ **IMPORTANT:** This tells the frontend where to find your backend API.

### 6. Create Service
- Click **"Create Static Site"** button
- Wait 5-10 minutes for deployment

### 7. Monitor Deployment
- Watch the **"Logs"** tab
- Look for:
  - ✅ Build successful
  - ✅ No errors
  - ✅ Deployment complete

### 8. Get Your Frontend URL
- Once deployed, note your frontend URL
- It will be: `https://ego-store-frontend.onrender.com` (or similar)

### 9. Update Backend CORS (Important!)

After frontend deploys, update backend to allow frontend:

1. Go to your **Backend Service** on Render
2. Click **"Environment"** tab
3. Find `CLIENT_URL` variable
4. Update it to match your frontend URL:
   ```
   CLIENT_URL=https://ego-store-frontend.onrender.com
   ```
5. Click **"Save Changes"** - this will trigger a redeploy
6. Wait for backend to redeploy (2-3 minutes)

---

## Testing After Deployment

### 1. Visit Frontend URL
- Open: `https://ego-store-frontend.onrender.com`
- Open browser console (F12)

### 2. Check Console
Look for:
- ✅ `🔗 API Base URL: https://ego-store-backend.onrender.com/api`
- ✅ No CORS errors
- ✅ No network errors

### 3. Test Functionality
- ✅ User registration
- ✅ User login
- ✅ Browse products
- ✅ Add to cart
- ✅ Checkout (if payments configured)

---

## Troubleshooting

### Frontend can't connect to backend?
- Verify `VITE_API_URL` is set correctly
- Check browser console for API URL
- Ensure backend is awake (visit `/health` endpoint)

### CORS errors?
- Verify `CLIENT_URL` in backend matches frontend URL exactly
- Include `https://` in URL
- No trailing slash
- Redeploy backend after updating `CLIENT_URL`

### Build fails?
- Check logs for errors
- Verify Root Directory is `frontend`
- Ensure package.json exists in frontend folder

---

## Quick Reference

**Backend:**
- URL: `https://ego-store-backend.onrender.com`
- Health: `https://ego-store-backend.onrender.com/health`
- API: `https://ego-store-backend.onrender.com/api`

**Frontend:**
- URL: `https://ego-store-frontend.onrender.com` (after deployment)

**Environment Variables:**

**Backend (already set):**
- `CLIENT_URL` - Update after frontend deploys

**Frontend (to set):**
- `VITE_API_URL=https://ego-store-backend.onrender.com`

---

## Next Steps

1. ✅ Deploy frontend (follow steps above)
2. ✅ Update backend `CLIENT_URL` with frontend URL
3. ✅ Test full application flow
4. ✅ Celebrate! 🎉

