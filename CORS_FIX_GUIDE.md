# CORS and Deployment Fix Guide

## ✅ What Was Fixed

### 1. Enhanced CORS Configuration
- Added case-insensitive origin matching
- Added automatic allowance for all `onrender.com` domains in production
- Improved preflight OPTIONS request handling
- Added explicit OPTIONS handler for all routes

### 2. Better Error Handling
- More detailed CORS error logging
- Normalized origin comparison (handles trailing slashes, case differences)

## 🔧 Environment Variables Required

Make sure these are set in your Render.com backend service:

### Required Environment Variables:
```bash
CLIENT_URL=https://ego-store-frontend.onrender.com
NODE_ENV=production
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### Optional but Recommended:
```bash
SENDGRID_API_KEY=your_sendgrid_key  # For email/OTP
STRIPE_SECRET_KEY=your_stripe_key   # For payments
CLOUDINARY_CLOUD_NAME=dkq9qo8vf
CLOUDINARY_API_KEY=799582919956526
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

## 🧪 Testing CORS

### 1. Test from Browser Console (on frontend):
```javascript
fetch('https://ego-store-backend.onrender.com/api/cors-test', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

### 2. Test with cURL:
```bash
curl -I -X OPTIONS https://ego-store-backend.onrender.com/api/otp/send \
  -H "Origin: https://ego-store-frontend.onrender.com" \
  -H "Access-Control-Request-Method: POST"
```

You should see:
```
Access-Control-Allow-Origin: https://ego-store-frontend.onrender.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin
```

### 3. Test OTP Endpoint:
```bash
curl -X POST https://ego-store-backend.onrender.com/api/otp/send \
  -H "Content-Type: application/json" \
  -H "Origin: https://ego-store-frontend.onrender.com" \
  -d '{"email":"test@example.com","type":"user"}'
```

## 🚀 Deployment Checklist

- [ ] Set `CLIENT_URL` environment variable in Render backend
- [ ] Set `NODE_ENV=production` in Render backend
- [ ] Verify backend is deployed and accessible
- [ ] Test CORS with the test endpoints above
- [ ] Verify frontend can call `/api/otp/send` and `/api/otp/verify`
- [ ] Check browser console for CORS errors

## 🔍 Troubleshooting

### If you still see CORS errors:

1. **Check environment variables:**
   ```bash
   # In Render dashboard, verify CLIENT_URL is set correctly
   CLIENT_URL=https://ego-store-frontend.onrender.com
   ```

2. **Check backend logs:**
   - Look for CORS allow/block messages
   - Verify the origin being checked matches your frontend URL

3. **Verify frontend API URL:**
   - Check `frontend/src/services/api.js`
   - Should be: `https://ego-store-backend.onrender.com/api`

4. **Test backend directly:**
   ```bash
   curl https://ego-store-backend.onrender.com/api/test
   ```

### Common Issues:

1. **404 Errors:**
   - Verify routes are registered in `server.js`
   - Check that `/api/otp/send` route exists

2. **CORS Errors:**
   - Ensure `CLIENT_URL` is set in Render
   - Check that frontend URL matches exactly (no trailing slash differences)
   - Verify backend is allowing `onrender.com` domains

3. **Backend "Waking Up":**
   - Free tier services sleep after inactivity
   - First request may take 30-60 seconds
   - Subsequent requests should be fast

## 📝 Notes

- The CORS configuration now automatically allows all `onrender.com` domains in production
- This makes it easier to deploy without worrying about exact URL matching
- In development, localhost origins are automatically allowed
- All requests are logged for debugging

