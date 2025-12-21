# Quick Start: Deploy to Render in 5 Minutes

## 🚀 One-Click Deployment

### Step 1: Prepare Your GitHub Repository
```bash
cd c:\Users\adith\OneDrive\Desktop\ManiProject
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### Step 2: Create Backend on Render

1. Go to https://render.com (sign up if needed)
2. Click **"New +"** → Select **"Web Service"**
3. Connect your GitHub repo: **Main_Multi-vendor**
4. Fill in the form:
   - **Name:** `maniproject-backend`
   - **Language:** `Node` (should auto-detect)
   - **Branch:** `main`
   - **Region:** `Virginia (US East)` or closest to you
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm run start`
   - **Instance Type:** `Free`

5. Scroll down to **Environment Variables** section
6. Click **"+ Add Environment Variable"** and add these:
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `MONGO_URI` = `mongodb+srv://YOUR_MONGO_URI`
   - `JWT_SECRET` = `Adi@123456789_secret`
   - `EMAIL_USER` = `adithyananimon9@gmail.com`
   - `EMAIL_PASS` = `ronzvngcgxhbwdbf`
   - `STRIPE_SECRET_KEY` = `sk_test_51SJodUIBVKasxBKaw83EvqNfA26vsX4Ti0E3IHj4HxmyUvg9vqpqFPco0lunZx2C6Pex63cwnKLdzjf0vdUFuXrb00HkjHf79b`
   - `STRIPE_WEBHOOK_SECRET` = `whsec_xxxxx`
   - `CLIENT_URL` = `https://maniproject-frontend.onrender.com`

7. Click **"Deploy Web Service"** button at the bottom
8. **Wait 5-10 minutes** for deployment
9. Copy your backend URL from the dashboard

### Step 3: Create Frontend on Render

1. Click **"New +"** → Select **"Static Site"** (from the menu)
2. Select your GitHub repo: **Main_Multi-vendor**
3. Configure:
   - **Name:** `maniproject-frontend`
   - **Region:** `Oregon`
   - **Plan:** `Free`
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Publish Directory:** `frontend/dist`

4. Click **"Advanced"** → **"Add Environment Variable"** and add:
   - `VITE_API_URL` = `https://maniproject-backend.onrender.com/api`
   - `VITE_BASE_URL` = `https://maniproject-frontend.onrender.com`

5. Click **"Create Static Site"**
6. **Wait 3-5 minutes** for deployment
7. Copy your frontend URL (e.g., `https://maniproject-frontend.onrender.com`)

### Step 4: Test Your App

✅ **Backend:** https://maniproject-backend.onrender.com/api/products
✅ **Frontend:** https://maniproject-frontend.onrender.com

**Admin Login:**
- Email: `adithyaananimon9@gmail.com`
- Password: `Adi@123456789`

## 📋 Important Notes

### MongoDB Setup (First Time Only)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create a database user
4. In MongoDB Atlas → Network Access → Allow 0.0.0.0/0
5. Copy connection string and use in `MONGO_URI`

### Automatic Redeployment
- Every time you push to `main`, Render auto-deploys
- No manual steps needed after first setup

### Free Tier Limitations
- Apps spin down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- Limited to 0.5 GB RAM
- To remove spin-down: upgrade to Starter ($7/month)

### Troubleshooting

**Backend shows error?**
```
Check: Render Dashboard → Backend Service → Logs
Look for connection/environment variable errors
```

**Frontend blank page?**
```
1. Open browser console (F12)
2. Check for CORS or API errors
3. Verify VITE_API_URL is correct
4. Check if backend is running
```

**Database connection fails?**
```
1. Test MongoDB URI locally first
2. Verify IP whitelist in MongoDB Atlas
3. Check user credentials
4. Ensure NODE_ENV=production
```

## 🔗 Useful Links
- **Render Documentation:** https://render.com/docs
- **GitHub Repository:** https://github.com/Aadhii-sun/Main_Multi-vendor
- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
- **Your Backend:** https://maniproject-backend.onrender.com
- **Your Frontend:** https://maniproject-frontend.onrender.com

## ✅ Deployment Checklist
- [ ] Code pushed to GitHub
- [ ] Backend service created and deployed
- [ ] Frontend service created and deployed
- [ ] MongoDB cluster set up
- [ ] Environment variables configured
- [ ] Backend responding at /api/products
- [ ] Frontend loading
- [ ] Admin login working
- [ ] Products displaying
- [ ] Cart functionality working

**Deployed successfully? 🎉 Share your URLs!**
