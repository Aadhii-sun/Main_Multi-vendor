# Production Deployment Guide

Complete guide for deploying EGO Store to production.

## 🎯 Pre-Deployment Checklist

### Backend Checklist
- [ ] All environment variables configured
- [ ] MongoDB Atlas cluster created and accessible
- [ ] Database indexes created
- [ ] Stripe account configured (test mode verified)
- [ ] Cloudinary account configured
- [ ] Email service configured (SendGrid or SMTP)
- [ ] CORS origins configured
- [ ] Logs directory created (auto-created on first run)
- [ ] Health check endpoint tested

### Frontend Checklist
- [ ] Environment variables set
- [ ] API base URL configured
- [ ] Stripe publishable key configured
- [ ] Build tested locally
- [ ] All routes tested
- [ ] Error boundaries in place

## 🚀 Render.com Deployment

### Backend Deployment

1. **Create Web Service**
   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   ```
   Name: ego-store-backend
   Environment: Node
   Region: Oregon (or closest to your users)
   Branch: main
   Root Directory: backend
   Build Command: npm install
   Start Command: npm start
   ```

3. **Environment Variables**
   Add all variables from your `.env` file:
   ```
   NODE_ENV=production
   PORT=5000
   MONGO_URI=mongodb+srv://...
   JWT_SECRET=your_very_long_secret_key_min_32_chars
   CLIENT_URL=https://ego-store-frontend.onrender.com
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   SENDGRID_API_KEY=SG....
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   LOG_LEVEL=info
   ```

4. **Advanced Settings**
   - Auto-Deploy: Yes
   - Health Check Path: `/health`
   - Health Check Timeout: 300 seconds

### Frontend Deployment

1. **Create Static Site**
   - Go to Render Dashboard
   - Click "New +" → "Static Site"
   - Connect your GitHub repository

2. **Configure Site**
   ```
   Name: ego-store-frontend
   Branch: main
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

3. **Environment Variables**
   ```
   VITE_API_BASE_URL=https://ego-store-backend.onrender.com
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```

4. **Custom Domain (Optional)**
   - Add your custom domain in Render settings
   - Update DNS records as instructed

## 🔧 Post-Deployment Steps

### 1. Verify Backend
```bash
# Health check
curl https://ego-store-backend.onrender.com/health

# API test
curl https://ego-store-backend.onrender.com/api/test
```

### 2. Verify Frontend
- Visit your frontend URL
- Test login/registration
- Test product browsing
- Test checkout flow

### 3. Configure Stripe Webhooks
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://ego-store-backend.onrender.com/api/payments/webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### 4. MongoDB Atlas Configuration
1. **Network Access**
   - Add Render IP: `0.0.0.0/0` (or specific IPs)
   - Or use MongoDB Atlas IP Access List

2. **Database User**
   - Create dedicated database user
   - Use strong password
   - Grant appropriate permissions

3. **Connection String**
   - Use connection string format:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
   ```

### 5. Monitor Logs
- Check Render logs dashboard
- Monitor `backend/logs/` directory
- Set up log aggregation (optional)

## 🔒 Security Hardening

### 1. Environment Variables
- ✅ Never commit `.env` files
- ✅ Use strong secrets (32+ characters)
- ✅ Rotate secrets regularly
- ✅ Use different secrets for dev/staging/prod

### 2. Database Security
- ✅ Enable MongoDB authentication
- ✅ Use IP whitelisting
- ✅ Enable MongoDB encryption at rest
- ✅ Regular backups

### 3. API Security
- ✅ Enable rate limiting
- ✅ Use HTTPS only
- ✅ Validate all inputs
- ✅ Sanitize user data

### 4. Payment Security
- ✅ Use Stripe test mode first
- ✅ Verify webhook signatures
- ✅ Never log payment details
- ✅ Use PCI-compliant practices

## 📊 Monitoring Setup

### 1. Health Monitoring
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Monitor `/health` endpoint
- Set alerts for downtime

### 2. Error Tracking
- Consider Sentry or similar
- Monitor error logs
- Set up alerts for critical errors

### 3. Performance Monitoring
- Monitor API response times
- Track database query performance
- Monitor memory and CPU usage

## 🧪 Testing Production

### 1. Smoke Tests
```bash
# Backend health
curl https://ego-store-backend.onrender.com/health

# API endpoint
curl https://ego-store-backend.onrender.com/api/test

# CORS test
curl -H "Origin: https://ego-store-frontend.onrender.com" \
     https://ego-store-backend.onrender.com/api/cors-test
```

### 2. Functional Tests
- [ ] User registration
- [ ] OTP login
- [ ] Product browsing
- [ ] Add to cart
- [ ] Checkout process
- [ ] Payment processing
- [ ] Order tracking
- [ ] Seller dashboard
- [ ] Admin dashboard

### 3. Performance Tests
- [ ] Page load times
- [ ] API response times
- [ ] Image loading
- [ ] Database query performance

## 🔄 Maintenance

### Regular Tasks
- **Weekly**: Review error logs
- **Monthly**: Update dependencies
- **Quarterly**: Security audit
- **As needed**: Database backups

### Backup Strategy
1. **Database Backups**
   - MongoDB Atlas automatic backups
   - Manual export scripts
   - Retention: 30 days minimum

2. **Code Backups**
   - Git repository (primary)
   - Regular commits
   - Tagged releases

3. **Configuration Backups**
   - Document all environment variables
   - Store securely (password manager)
   - Version control for non-sensitive configs

## 🐛 Troubleshooting Production Issues

### Backend Issues

**Server won't start:**
1. Check Render logs
2. Verify environment variables
3. Check MongoDB connection
4. Review `backend/logs/` directory

**CORS errors:**
1. Verify `CLIENT_URL` is correct
2. Check CORS configuration
3. Review allowed origins in logs

**Database connection fails:**
1. Check MongoDB Atlas IP whitelist
2. Verify connection string
3. Check MongoDB cluster status
4. Review connection logs

### Frontend Issues

**API calls failing:**
1. Verify `VITE_API_BASE_URL`
2. Check CORS configuration
3. Review browser console
4. Check network tab

**Build fails:**
1. Check build logs
2. Verify Node.js version
3. Check for dependency issues
4. Review environment variables

## 📈 Scaling Considerations

### When to Scale
- High traffic volume
- Slow response times
- Database connection limits
- Memory/CPU constraints

### Scaling Options
1. **Horizontal Scaling**
   - Multiple backend instances
   - Load balancer
   - Session management

2. **Database Scaling**
   - MongoDB Atlas scaling
   - Read replicas
   - Connection pooling

3. **Caching**
   - Redis for sessions
   - CDN for static assets
   - API response caching

## ✅ Production Readiness Checklist

- [ ] All environment variables configured
- [ ] Database backups enabled
- [ ] Monitoring set up
- [ ] Error tracking configured
- [ ] Security headers enabled
- [ ] HTTPS enabled
- [ ] Rate limiting configured
- [ ] Logging configured
- [ ] Health checks working
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Team trained on deployment process

---

**Your application is now production-ready! 🎉**

For support, check logs and documentation, or review the troubleshooting section.

