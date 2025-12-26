# Deployment Checklist

Use this checklist to ensure everything is ready before deploying.

## Pre-Deployment Checklist

### Backend Preparation
- [ ] All code is committed and pushed to GitHub
- [ ] `userController.js` is fixed and tested
- [ ] No linter errors
- [ ] MongoDB Atlas database is ready
- [ ] MongoDB connection string is ready
- [ ] JWT secret is generated (minimum 32 characters)
- [ ] Email credentials ready (if using email features)
- [ ] Stripe keys ready (if using payments)

### Frontend Preparation
- [ ] All code is committed and pushed to GitHub
- [ ] Frontend builds successfully locally (`npm run build`)
- [ ] No build errors
- [ ] API service is configured correctly

### Environment Variables Ready
- [ ] `MONGO_URI` - MongoDB connection string
- [ ] `JWT_SECRET` - Strong secret (32+ characters)
- [ ] `CLIENT_URL` - Will be frontend URL (set after frontend deploys)
- [ ] `EMAIL_USER` - Gmail address (optional)
- [ ] `EMAIL_PASS` - Gmail app password (optional)
- [ ] `STRIPE_SECRET_KEY` - Stripe secret key (optional)
- [ ] `VITE_API_URL` - Backend URL (for frontend)

---

## Deployment Steps

### Step 1: Deploy Backend
- [ ] Create new Web Service on Render
- [ ] Connect GitHub repository
- [ ] Set Root Directory: `backend`
- [ ] Set Build Command: `npm install`
- [ ] Set Start Command: `npm start`
- [ ] Add environment variables (except CLIENT_URL)
- [ ] Deploy and wait for success
- [ ] Test `/health` endpoint
- [ ] Test `/api/test` endpoint
- [ ] Note backend URL

### Step 2: Deploy Frontend
- [ ] Create new Static Site on Render
- [ ] Connect GitHub repository
- [ ] Set Root Directory: `frontend`
- [ ] Set Build Command: `npm install && npm run build`
- [ ] Set Publish Directory: `dist`
- [ ] Add `VITE_API_URL` environment variable (use backend URL)
- [ ] Deploy and wait for success
- [ ] Note frontend URL

### Step 3: Update Backend CORS
- [ ] Go to Backend Service → Environment
- [ ] Update `CLIENT_URL` to frontend URL
- [ ] Save changes (triggers redeploy)
- [ ] Wait for redeploy to complete

### Step 4: Final Testing
- [ ] Visit frontend URL
- [ ] Check browser console for errors
- [ ] Test user registration
- [ ] Test user login
- [ ] Test product browsing
- [ ] Test cart functionality
- [ ] Check backend logs for errors

---

## Post-Deployment Verification

### Backend Health
- [ ] Health endpoint returns 200: `/health`
- [ ] API test endpoint works: `/api/test`
- [ ] MongoDB connection successful (check logs)
- [ ] No errors in logs

### Frontend Functionality
- [ ] Frontend loads without errors
- [ ] API calls are successful (check network tab)
- [ ] No CORS errors in console
- [ ] Authentication works
- [ ] Products load correctly
- [ ] Cart works correctly

### Integration Testing
- [ ] User can register
- [ ] User can login
- [ ] User can browse products
- [ ] User can add to cart
- [ ] User can checkout (if payments configured)
- [ ] Admin can access admin panel (if applicable)

---

## Common Issues & Solutions

### Issue: Backend won't start
**Solution:**
- Check logs for missing environment variables
- Verify MongoDB connection string
- Ensure JWT_SECRET is set

### Issue: CORS errors
**Solution:**
- Verify CLIENT_URL matches frontend URL exactly
- Include `https://` in URL
- No trailing slash

### Issue: Frontend can't connect
**Solution:**
- Verify VITE_API_URL is set correctly
- Check browser console for API URL
- Ensure backend is awake (ping `/health`)

### Issue: Database connection fails
**Solution:**
- Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0)
- Verify connection string format
- Test connection string locally

---

## Quick Commands Reference

### Test Backend Locally
```bash
cd backend
npm install
npm start
```

### Test Frontend Locally
```bash
cd frontend
npm install
npm run dev
```

### Build Frontend Locally
```bash
cd frontend
npm run build
```

### Check Backend Health (after deployment)
```bash
curl https://your-backend-url.onrender.com/health
```

---

## URLs to Save

After deployment, save these URLs:

- **Backend URL:** `https://________________.onrender.com`
- **Frontend URL:** `https://________________.onrender.com`
- **Backend Health:** `https://________________.onrender.com/health`
- **Backend API:** `https://________________.onrender.com/api`

---

**Ready to deploy?** Follow the steps in `DEPLOYMENT_GUIDE.md`

