# SendGrid Email Setup Guide

This guide will help you set up SendGrid to send emails (including OTP codes) from your backend on Render.

## Why SendGrid?

Render's free tier blocks outbound SMTP connections, so Gmail SMTP won't work. SendGrid is a transactional email service that works perfectly with Render and offers a free tier with 100 emails per day.

## Step 1: Create a SendGrid Account

1. Go to [SendGrid.com](https://sendgrid.com/)
2. Click **"Start for Free"** or **"Sign Up"**
3. Fill in your details:
   - Email address
   - Password
   - Company name (optional)
4. Verify your email address
5. Complete the account setup

## Step 2: Verify Your Sender Identity

SendGrid requires you to verify who you are sending emails from:

### Option A: Single Sender Verification (Easiest - Recommended for Testing)

1. In SendGrid dashboard, go to **Settings** → **Sender Authentication**
2. Click **"Verify a Single Sender"**
3. Fill in the form:
   - **From Email Address**: Your email (e.g., `your-email@gmail.com`)
   - **From Sender Name**: Your name or company name
   - **Reply To**: Same as From Email Address
   - **Company Address**: Your address
   - **City, State, Zip**: Your location
   - **Country**: Your country
4. Click **"Create"**
5. Check your email and click the verification link
6. ✅ Once verified, you can use this email as the sender

### Option B: Domain Authentication (Better for Production)

If you have your own domain:
1. Go to **Settings** → **Sender Authentication** → **Authenticate Your Domain**
2. Follow the DNS setup instructions
3. This allows you to send from any email on your domain

## Step 3: Create an API Key

1. In SendGrid dashboard, go to **Settings** → **API Keys**
2. Click **"Create API Key"**
3. Give it a name (e.g., "Render Backend API Key")
4. Select **"Full Access"** or **"Restricted Access"** with Mail Send permissions
5. Click **"Create & View"**
6. **⚠️ IMPORTANT**: Copy the API key immediately - you won't be able to see it again!
   - It will look like: `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## Step 4: Add API Key to Render

1. Go to your Render dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Click **"Add Environment Variable"**
5. Add the following variables:

   | Key | Value | Description |
   |-----|-------|-------------|
   | `SENDGRID_API_KEY` | `SG.xxxxxxxx...` | Your SendGrid API key (from Step 3) |
   | `SENDGRID_FROM_EMAIL` | `your-email@gmail.com` | The verified sender email (from Step 2) |
   | `SENDGRID_FROM_NAME` | `Your Name` | Display name for emails (optional) |

6. Click **"Save Changes"**

## Step 5: Remove Old SMTP Variables (Optional)

If you had `EMAIL_USER` and `EMAIL_PASS` set for Gmail SMTP, you can remove them:
- They're no longer needed since SendGrid will be used
- The system will automatically use SendGrid if `SENDGRID_API_KEY` is set

## Step 6: Deploy and Test

1. In Render dashboard, click **"Manual Deploy"** → **"Deploy latest commit"**
2. Wait for deployment to complete
3. Check the logs - you should see:
   ```
   ✅ SendGrid email service initialized
   Email Service: SendGrid (API)
   ```

4. Test the OTP endpoint:
   ```bash
   curl -X POST https://ego-store-backend.onrender.com/api/otp/send \
     -H "Content-Type: application/json" \
     -d '{"email":"your-email@example.com"}'
   ```

5. Check your email - you should receive the OTP code!

## Troubleshooting

### Issue: "Email sending failed" in logs

**Check:**
1. Is `SENDGRID_API_KEY` set correctly in Render?
2. Is the API key valid? (Try creating a new one)
3. Is your sender email verified in SendGrid?
4. Check SendGrid dashboard → **Activity** → **Email Activity** for delivery status

### Issue: "Sender not verified"

**Fix:**
1. Go to SendGrid → **Settings** → **Sender Authentication**
2. Make sure your sender email is verified
3. Use the exact same email in `SENDGRID_FROM_EMAIL`

### Issue: Emails going to spam

**Fix:**
1. Use Domain Authentication instead of Single Sender
2. Set up SPF and DKIM records (SendGrid will guide you)
3. Warm up your domain gradually (start with low volume)

### Issue: "API key invalid"

**Fix:**
1. Create a new API key in SendGrid
2. Make sure it has "Mail Send" permissions
3. Update `SENDGRID_API_KEY` in Render
4. Redeploy

## SendGrid Free Tier Limits

- **100 emails per day** (free tier)
- Perfect for development and small applications
- Upgrade to paid plans for higher limits

## Testing Locally

To test SendGrid locally:

1. Create a `.env` file in your `backend` folder:
   ```env
   SENDGRID_API_KEY=SG.your-api-key-here
   SENDGRID_FROM_EMAIL=your-verified-email@example.com
   SENDGRID_FROM_NAME=Your Name
   ```

2. Run your backend:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. Test sending an email - it will use SendGrid!

## Next Steps

- ✅ Your OTP emails will now work on Render!
- ✅ All other email templates (order confirmations, etc.) will also use SendGrid
- ✅ Monitor your email sending in SendGrid dashboard → **Activity**

## Support

- SendGrid Documentation: https://docs.sendgrid.com/
- SendGrid Support: https://support.sendgrid.com/

