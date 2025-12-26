# Debugging Signup 400 & OTP 404 Errors

## What I've Added

### 1. Comprehensive Request Logging
- **All API requests** are now logged with method, path, query, and body keys
- **Signup requests** show full body and extracted fields
- **OTP requests** show when route is hit
- **Validation errors** show exactly what failed

### 2. Route Registration Logging
- Shows when routes are registered
- Confirms OTP routes are mounted correctly

## How to Debug After Redeploy

### Step 1: Check Backend Logs (Render Dashboard → Logs)

#### Look for Route Registration:
```
📋 Registering API routes...
✅ Registered: /api/auth
✅ Registered: /api/otp
📋 Registering OTP routes...
✅ Registered: POST /api/otp/send
✅ Registered: POST /api/otp/verify
```

#### Look for Signup Request:
```
📥 POST /api/auth/signup
📝 /api/auth/signup route hit!
📝 Signup request received - Full body: { ... }
📝 Extracted fields: { name: "...", email: "...", password: "***", role: "..." }
```

#### If Validation Fails:
```
❌ Validation failed: {
  path: '/api/auth/signup',
  errors: [
    { msg: 'Password must contain at least one uppercase letter...', param: 'password' }
  ]
}
```

#### Look for OTP Request:
```
📥 POST /api/otp/send
📨 OTP /send route hit!
```

### Step 2: Common Issues & Fixes

## Signup 400 Error - Most Likely Causes

### 1. Password Validation Failing
**Backend requires:**
- Minimum 6 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)

**Example of failing passwords:**
- `password` ❌ (no uppercase, no number)
- `PASSWORD` ❌ (no lowercase, no number)
- `Password` ❌ (no number)
- `Password123` ✅ (meets all requirements)

**Fix:** Update frontend validation to match backend requirements

### 2. Field Name Mismatch
**Backend expects:**
```javascript
{
  name: string,
  email: string,
  password: string,
  role: string (optional)
}
```

**Frontend sends:**
```javascript
{
  name: userData.name,
  email: userData.email,
  password: userData.password,
  role: userData.userType || 'user'
}
```

✅ These match correctly!

### 3. Missing Required Fields
Check backend logs to see:
```
received: { name: false, email: true, password: true }
```
This shows which fields are missing.

## OTP 404 Error - Most Likely Causes

### 1. Route Not Registered
**Check logs for:**
```
✅ Registered: POST /api/otp/send
```

If you DON'T see this → route file has an error

### 2. Route Order Issue
The 404 handler might be catching it. Check if you see:
```
📨 OTP /send route hit!
```

If you DON'T see this but see the 404 handler message → route order issue

### 3. Backend Not Redeployed
Wait for backend to fully redeploy, then check logs again.

## Quick Test After Redeploy

### Test Signup:
1. Try registering with a password that meets requirements: `Password123`
2. Check backend logs for validation errors
3. If it still fails, check the exact error message in logs

### Test OTP:
1. Try sending OTP
2. Check backend logs for:
   - `📥 POST /api/otp/send` (request received)
   - `📨 OTP /send route hit!` (route matched)
   - If you see request but NOT route hit → route issue
   - If you see neither → request not reaching backend

## Expected Log Output

### Successful Signup:
```
📥 POST /api/auth/signup
📝 /api/auth/signup route hit!
📝 Signup request received - Full body: { "name": "Test", "email": "test@example.com", ... }
📝 Extracted fields: { name: "Test (4 chars)", email: "test@example.com", ... }
Registration - Email: test@example.com, Requested role: user, Assigned role: user
✅ MongoDB Connected Successfully
```

### Successful OTP:
```
📥 POST /api/otp/send
📨 OTP /send route hit!
[OTP] Request to send OTP to: test@example.com (type: user)
```

## Next Steps

1. **Wait for backend to redeploy** (check Render logs)
2. **Try signup/OTP again**
3. **Check backend logs** for the detailed messages above
4. **Share the log output** if issues persist - the logs will show exactly what's wrong!

