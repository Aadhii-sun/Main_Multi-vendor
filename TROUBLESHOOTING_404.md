# Troubleshooting 404 Errors

## Common Causes of 404 Errors

### 1. Browser Resource Requests (Not API Calls)
The error `login:1 Failed to load resource: 404` is often a **browser resource** (favicon, image, CSS), NOT an API call.

**How to check:**
- Open browser DevTools → Network tab
- Look for the failed request
- Check the URL - if it's NOT `/api/...`, it's not an API call

### 2. API Route Mismatch

**Frontend calls:**
- `/otp/send` → Becomes `https://ego-store-backend.onrender.com/api/otp/send` ✅
- `/auth/signin` → Becomes `https://ego-store-backend.onrender.com/api/auth/signin` ✅
- `/auth/me` → Becomes `https://ego-store-backend.onrender.com/api/auth/me` ✅

**Backend routes:**
- `POST /api/otp/send` ✅
- `POST /api/auth/signin` ✅
- `GET /api/auth/me` ✅

**All routes match correctly!**

### 3. Backend Not Running or Sleeping

On Render free tier, backend sleeps after 15 minutes.

**Solution:**
- Wait 30-60 seconds for backend to wake up
- Use the "Retry" button in the login form
- Check backend health: `https://ego-store-backend.onrender.com/health`

### 4. Wrong API URL Configuration

**Check in browser console:**
```javascript
🔗 API Base URL: https://ego-store-backend.onrender.com/api
```

**If wrong, verify:**
- Frontend environment variable: `VITE_API_URL=https://ego-store-backend.onrender.com`
- Should NOT include `/api` (it's added automatically)

### 5. CORS Issues

If you see CORS errors, check:
- Backend `CLIENT_URL` environment variable
- Should match frontend URL exactly: `https://ego-store-frontend.onrender.com`

## How to Debug

1. **Open Browser Console (F12)**
   - Look for: `🌐 Making request to: [URL]`
   - This shows the exact API URL being called

2. **Check Network Tab**
   - Filter by "XHR" or "Fetch"
   - Look for failed requests
   - Check the Request URL

3. **Check Backend Logs (Render Dashboard)**
   - Go to Backend Service → Logs
   - Look for incoming requests
   - Check for route errors

4. **Test Backend Directly**
   - Health: `https://ego-store-backend.onrender.com/health`
   - API Test: `https://ego-store-backend.onrender.com/api/test`

## Quick Fixes

### If API calls are failing:
1. Verify backend is awake (check `/health`)
2. Check `VITE_API_URL` is set correctly
3. Verify routes match (see above)
4. Check CORS settings

### If browser resources are failing:
- These are usually harmless (favicon, etc.)
- Can be ignored if the app works

## Still Having Issues?

Check the browser console for detailed error messages. The new error handler will show:
- Exact URL that failed
- Available routes
- Helpful debugging info

