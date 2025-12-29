# Complete Deployment Checklist

Use this checklist to ensure your application is ready for production hosting.

## 📋 Pre-Deployment

### Backend Setup
- [ ] Install all dependencies: `cd backend && npm install`
- [ ] Create `.env` file with all required variables
- [ ] Test MongoDB connection locally
- [ ] Test Stripe integration (test mode)
- [ ] Test email service (SendGrid or SMTP)
- [ ] Test Cloudinary image upload
- [ ] Verify all API endpoints work
- [ ] Check logs directory is created
- [ ] Run health check: `curl http://localhost:5000/health`

### Frontend Setup
- [ ] Install all dependencies: `cd frontend && npm install`
- [ ] Create `.env` file with API URL
- [ ] Test build: `npm run build`
- [ ] Verify build output in `dist/` folder
- [ ] Test all pages load correctly
- [ ] Test authentication flow
- [ ] Test checkout process

## 🔐 Environment Variables

### Backend (.env)
- [ ] `MONGO_URI` - MongoDB connection string
- [ ] `JWT_SECRET` - At least 32 characters
- [ ] `CLIENT_URL` - Frontend URL
- [ ] `NODE_ENV=production`
- [ ] `STRIPE_SECRET_KEY` - Stripe secret key
- [ ] `STRIPE_WEBHOOK_SECRET` - Webhook secret
- [ ] `SENDGRID_API_KEY` OR `EMAIL_USER/EMAIL_PASS`
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`

### Frontend (.env)
- [ ] `VITE_API_BASE_URL` - Backend URL
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

## 🚀 Render.com Deployment

### Backend Service
- [ ] Repository connected to Render
- [ ] Service type: Web Service
- [ ] Environment: Node
- [ ] Root Directory: `backend`
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] All environment variables added
- [ ] Health check path: `/health`
- [ ] Auto-deploy enabled
- [ ] Service is running and healthy

### Frontend Service
- [ ] Repository connected to Render
- [ ] Service type: Static Site
- [ ] Root Directory: `frontend`
- [ ] Build Command: `npm install && npm run build`
- [ ] Publish Directory: `dist`
- [ ] All environment variables added
- [ ] Site is deployed and accessible

## ✅ Post-Deployment Verification

### Backend Tests
- [ ] Health check: `curl https://your-backend.onrender.com/health`
- [ ] API test: `curl https://your-backend.onrender.com/api/test`
- [ ] CORS test: `curl -H "Origin: https://your-frontend.onrender.com" https://your-backend.onrender.com/api/cors-test`
- [ ] Check logs in Render dashboard
- [ ] Verify database connection
- [ ] Test OTP email sending

### Frontend Tests
- [ ] Homepage loads
- [ ] Login page works
- [ ] Registration works
- [ ] OTP verification works
- [ ] Product listing works
- [ ] Product details page works
- [ ] Add to cart works
- [ ] Checkout process works
- [ ] Payment processing works
- [ ] Order confirmation works

### Integration Tests
- [ ] User can register
- [ ] User can login with OTP
- [ ] User can browse products
- [ ] User can add products to cart
- [ ] User can checkout
- [ ] Payment processes successfully
- [ ] Order is created
- [ ] Seller can manage products
- [ ] Admin can access dashboard

## 🔒 Security Checklist

- [ ] All `.env` files are in `.gitignore`
- [ ] No secrets committed to Git
- [ ] HTTPS enabled (Render default)
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input sanitization working
- [ ] Security headers enabled
- [ ] MongoDB IP whitelist configured
- [ ] Strong JWT secret (32+ chars)
- [ ] Stripe webhook signature verified

## 📊 Monitoring Setup

- [ ] Health check monitoring configured
- [ ] Error logging working
- [ ] Logs accessible in Render
- [ ] Uptime monitoring set up (optional)
- [ ] Error tracking configured (optional)

## 🎯 Final Steps

- [ ] Test complete user journey
- [ ] Test seller workflow
- [ ] Test admin functions
- [ ] Verify all features work
- [ ] Check mobile responsiveness
- [ ] Test on different browsers
- [ ] Document any custom configurations
- [ ] Share deployment URLs with team

## 🐛 Troubleshooting

If something doesn't work:

1. **Check Render Logs**
   - Go to Render dashboard
   - Click on your service
   - View "Logs" tab

2. **Check Backend Logs**
   - SSH into Render (if available)
   - Check `backend/logs/` directory
   - Review error logs

3. **Verify Environment Variables**
   - Double-check all variables are set
   - Verify no typos
   - Check variable values are correct

4. **Test Locally First**
   - Reproduce issue locally
   - Fix locally
   - Deploy fix

5. **Check Health Endpoint**
   - Visit `/health` endpoint
   - Review service status
   - Check which services are failing

---

**✅ Once all items are checked, your application is production-ready!**
