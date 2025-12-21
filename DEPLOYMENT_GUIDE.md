# Render Deployment Guide for ManiProject

## Prerequisites
- GitHub account with repository pushed
- Render.com account (free tier available)
- Environment variables ready

## Step-by-Step Deployment

### 1. Push Code to GitHub
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. Backend Deployment

#### Create Backend Service on Render:
1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Fill in the following:
   - **Name:** maniproject-backend
   - **Environment:** Node
   - **Region:** Oregon (or closest to you)
   - **Plan:** Free
   - **Build Command:** `npm install`
   - **Start Command:** `npm run start`
   - **Root Directory:** `backend`

#### Add Environment Variables:
Click "Advanced" and add these:

```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://[USERNAME]:[PASSWORD]@[CLUSTER].mongodb.net/ecommerce?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
CLIENT_URL=https://maniproject-frontend.onrender.com
```

5. Click "Create Web Service"
6. Wait for deployment (5-10 minutes)
7. Copy the backend URL (e.g., `https://maniproject-backend.onrender.com`)

### 3. Frontend Deployment

#### Create Frontend Service on Render:
1. Click "New +" → "Static Site"
2. Connect your GitHub repository
3. Fill in the following:
   - **Name:** maniproject-frontend
   - **Environment:** Static
   - **Region:** Oregon
   - **Plan:** Free
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Publish Directory:** `frontend/dist`
   - **Root Directory:** `/`

#### Add Environment Variables:
```
VITE_API_URL=https://maniproject-backend.onrender.com/api
VITE_BASE_URL=https://maniproject-frontend.onrender.com
```

4. Click "Create Static Site"
5. Wait for deployment (3-5 minutes)

### 4. Update Backend Environment

After frontend is deployed:
1. Go to Backend service settings
2. Update `CLIENT_URL` to your frontend URL
3. Redeploy

### 5. Connect MongoDB Atlas

If you don't have MongoDB yet:
1. Go to [mongodb.com](https://mongodb.com)
2. Create a free cluster
3. Create a user and database
4. Get connection string
5. Add to backend `MONGO_URI` environment variable

### 6. Update Frontend API URL

In `frontend/src/services/api.js`:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'https://maniproject-backend.onrender.com/api';
```

### 7. Test the Deployment

**Backend:**
- Visit: `https://maniproject-backend.onrender.com/api/health` (if you have a health check)

**Frontend:**
- Visit: `https://maniproject-frontend.onrender.com`
- Try admin login with:
  - Email: `adithyaananimon9@gmail.com`
  - Password: `Adi@123456789`

## Troubleshooting

### Backend not starting?
- Check logs in Render dashboard
- Verify `package.json` has correct `start` script
- Ensure all environment variables are set

### Frontend shows blank?
- Check browser console for API errors
- Verify `VITE_API_URL` is correct
- Check if CORS is enabled on backend

### Database connection issues?
- Verify MongoDB URI is correct
- Check IP whitelist in MongoDB Atlas (allow 0.0.0.0/0 for Render)
- Ensure database user has correct permissions

### Free tier limitations?
- Auto-spins down after 15 minutes of inactivity
- Limited to 0.5 GB RAM
- First deployment takes longer

## Upgrade to Paid (Optional)

For better performance:
- Upgrade to Starter ($7/month) or higher
- No more spin-down time
- More RAM and resources

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| MONGO_URI | MongoDB connection string | mongodb+srv://user:pass@cluster.mongodb.net/db |
| JWT_SECRET | JWT signing secret | your_secret_key_123 |
| EMAIL_USER | Gmail for sending emails | your_email@gmail.com |
| EMAIL_PASS | Gmail app password | xxxx xxxx xxxx xxxx |
| STRIPE_SECRET_KEY | Stripe test key | sk_test_xxxxx |
| CLIENT_URL | Frontend URL | https://maniproject-frontend.onrender.com |
| VITE_API_URL | Backend API URL | https://maniproject-backend.onrender.com/api |

## Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Backend service created on Render
- [ ] Frontend service created on Render
- [ ] Environment variables added
- [ ] MongoDB cluster created and connected
- [ ] Backend and frontend URLs configured
- [ ] Health check successful
- [ ] Admin login working
- [ ] Products loading correctly
- [ ] Cart and checkout functional

## Need Help?

- Render Docs: https://render.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
- GitHub: Push any fixes and redeploy automatically
