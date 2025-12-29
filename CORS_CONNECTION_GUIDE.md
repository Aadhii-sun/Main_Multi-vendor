# CORS Connection Guide

Complete guide on how CORS is configured to connect frontend to backend.

## 🔗 How CORS Works in This Project

### Backend CORS Configuration
**File:** `backend/config/cors.js`

The backend is configured to:
- ✅ Allow requests from your frontend domain
- ✅ Allow credentials (cookies, auth headers)
- ✅ Handle preflight OPTIONS requests
- ✅ Support all HTTP methods (GET, POST, PUT, DELETE, PATCH)

### Frontend API Configuration
**File:** `frontend/src/services/api.js`

The frontend is configured to:
- ✅ Send requests with credentials
- ✅ Include proper headers
- ✅ Handle CORS errors gracefully
- ✅ Auto-detect backend URL

## 🌐 Current CORS Setup

### Allowed Origins

**Development:**
- `http://localhost:5173` (Vite default)
- `http://localhost:3000`
- `http://127.0.0.1:5173`
- Any localhost origin (auto-allowed)

**Production:**
- `https://ego-store-frontend.onrender.com`
- Any `*.onrender.com` domain (auto-allowed in production)
- From `CLIENT_URL` environment variable

### CORS Headers Sent by Backend

```
Access-Control-Allow-Origin: https://ego-store-frontend.onrender.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin
Access-Control-Allow-Credentials: true
Access-Control-Expose-Headers: Content-Range, X-Content-Range, X-Request-ID
```

## 🧪 Testing CORS Connection

### 1. Test from Browser Console

Open browser console on your frontend and run:

```javascript
// Test CORS connection
fetch('https://ego-store-backend.onrender.com/api/cors-test', {
  method: 'GET',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => {
  console.log('✅ CORS Working!', data);
})
.catch(err => {
  console.error('❌ CORS Error:', err);
});
```

### 2. Test with cURL

```bash
# Test preflight request
curl -I -X OPTIONS https://ego-store-backend.onrender.com/api/products \
  -H "Origin: https://ego-store-frontend.onrender.com" \
  -H "Access-Control-Request-Method: GET"

# Should return:
# Access-Control-Allow-Origin: https://ego-store-frontend.onrender.com
# Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
```

### 3. Test API Endpoint

```bash
# Test actual API call
curl -X GET https://ego-store-backend.onrender.com/api/products \
  -H "Origin: https://ego-store-frontend.onrender.com" \
  -H "Content-Type: application/json"
```

## 🔧 Configuration Files

### Backend CORS Config
**Location:** `backend/config/cors.js`

```javascript
// Allowed origins
const allowedOrigins = [
  'https://ego-store-frontend.onrender.com',
  'http://localhost:5173',
  // ... more origins
];

// CORS config
const corsConfig = {
  origin: corsOriginHandler,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};
```

### Frontend API Config
**Location:** `frontend/src/services/api.js`

```javascript
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,  // Enable CORS with credentials
  crossDomain: true,      // Enable cross-domain requests
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});
```

## 🚀 Environment Variables

### Backend (Render.com)
```bash
CLIENT_URL=https://ego-store-frontend.onrender.com
NODE_ENV=production
```

### Frontend (Render.com)
```bash
VITE_API_BASE_URL=https://ego-store-backend.onrender.com
```

## ✅ Verification Checklist

- [ ] Backend `CLIENT_URL` is set to frontend URL
- [ ] Frontend `VITE_API_BASE_URL` is set to backend URL
- [ ] CORS test endpoint returns success
- [ ] API calls from frontend work without CORS errors
- [ ] Browser console shows no CORS errors
- [ ] Network tab shows proper CORS headers

## 🐛 Troubleshooting CORS

### Issue: CORS Error in Browser

**Symptoms:**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Solutions:**
1. Check `CLIENT_URL` in backend environment variables
2. Verify frontend URL matches exactly (no trailing slash)
3. Check backend logs for CORS allow/block messages
4. Ensure backend is running and accessible

### Issue: 401 Unauthorized

**Not a CORS issue** - This is authentication. Check:
- Token is being sent in Authorization header
- Token is valid and not expired
- User is logged in

### Issue: Network Error

**Possible CORS or connection issue:**
1. Check backend is running
2. Verify backend URL is correct
3. Check if backend is "waking up" (free tier)
4. Review browser network tab for actual error

## 📊 CORS Flow Diagram

```
Frontend (https://ego-store-frontend.onrender.com)
    ↓
    Makes request to Backend
    ↓
Backend (https://ego-store-backend.onrender.com)
    ↓
    Checks Origin header
    ↓
    Validates against allowed origins
    ↓
    If allowed:
        ✅ Returns response with CORS headers
    If not allowed:
        ❌ Returns 403 with CORS error
```

## 🔍 Debugging CORS

### Check CORS Headers in Response

1. Open browser DevTools
2. Go to Network tab
3. Make an API request
4. Click on the request
5. Check "Response Headers" for:
   - `Access-Control-Allow-Origin`
   - `Access-Control-Allow-Credentials`
   - `Access-Control-Allow-Methods`

### Check Backend Logs

Backend logs will show:
- ✅ `CORS: Allowing origin: ...`
- ❌ `CORS: Blocking origin: ...`

### Test Endpoints

**CORS Test:**
```
GET https://ego-store-backend.onrender.com/api/cors-test
```

**Health Check:**
```
GET https://ego-store-backend.onrender.com/api/health
```

**API Test:**
```
GET https://ego-store-backend.onrender.com/api/test
```

## ✨ Features

- ✅ Automatic Render.com domain allowance
- ✅ Case-insensitive origin matching
- ✅ Trailing slash normalization
- ✅ Credentials support (cookies, auth)
- ✅ Preflight request handling
- ✅ Detailed CORS logging
- ✅ Error handling and debugging

---

**Your CORS is fully configured and ready to use! 🎉**

