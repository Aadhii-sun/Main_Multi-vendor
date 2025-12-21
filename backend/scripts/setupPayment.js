/**
 * Payment Setup Verification Script
 * 
 * This script helps verify that your Stripe payment integration is properly configured.
 * Run with: node scripts/setupPayment.js
 */

require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function checkPaymentSetup() {
  console.log('\n🔍 Checking Payment System Configuration...\n');
  console.log('='.repeat(60));

  const issues = [];
  const warnings = [];
  const success = [];

  // Check Stripe Secret Key
  if (!process.env.STRIPE_SECRET_KEY) {
    issues.push('❌ STRIPE_SECRET_KEY is not set in .env file');
  } else {
    const key = process.env.STRIPE_SECRET_KEY;
    if (key.startsWith('sk_test_')) {
      success.push('✅ STRIPE_SECRET_KEY is set (Test mode)');
    } else if (key.startsWith('sk_live_')) {
      success.push('✅ STRIPE_SECRET_KEY is set (Live mode)');
      warnings.push('⚠️  You are using LIVE mode keys. Make sure this is intentional!');
    } else {
      issues.push('❌ STRIPE_SECRET_KEY format is invalid (should start with sk_test_ or sk_live_)');
    }
  }

  // Check Stripe Webhook Secret
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    warnings.push('⚠️  STRIPE_WEBHOOK_SECRET is not set (optional for development, required for production)');
  } else {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (webhookSecret.startsWith('whsec_')) {
      success.push('✅ STRIPE_WEBHOOK_SECRET is set');
    } else {
      warnings.push('⚠️  STRIPE_WEBHOOK_SECRET format may be invalid (should start with whsec_)');
    }
  }

  // Check Frontend Publishable Key (informational)
  console.log('\n📋 Frontend Configuration:');
  console.log('   Make sure VITE_STRIPE_PUBLISHABLE_KEY is set in frontend/.env');
  console.log('   The key should start with pk_test_ (test) or pk_live_ (live)');

  // Test Stripe Connection
  if (process.env.STRIPE_SECRET_KEY) {
    console.log('\n🔌 Testing Stripe Connection...');
    try {
      const balance = await stripe.balance.retrieve();
      success.push('✅ Successfully connected to Stripe API');
      console.log(`   Account balance: ${balance.available[0]?.amount / 100} ${balance.available[0]?.currency.toUpperCase()}`);
    } catch (error) {
      issues.push(`❌ Failed to connect to Stripe: ${error.message}`);
    }
  }

  // Check Database Models
  console.log('\n📦 Checking Database Models...');
  try {
    const Payment = require('../models/Payment');
    const Order = require('../models/Order');
    success.push('✅ Payment and Order models are loaded');
  } catch (error) {
    issues.push(`❌ Failed to load models: ${error.message}`);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Summary:\n');

  if (success.length > 0) {
    console.log('✅ Success:');
    success.forEach(msg => console.log(`   ${msg}`));
  }

  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    warnings.forEach(msg => console.log(`   ${msg}`));
  }

  if (issues.length > 0) {
    console.log('\n❌ Issues:');
    issues.forEach(msg => console.log(`   ${msg}`));
  }

  // Final Status
  console.log('\n' + '='.repeat(60));
  if (issues.length === 0) {
    console.log('\n✅ Payment system is properly configured!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Set VITE_STRIPE_PUBLISHABLE_KEY in frontend/.env');
    console.log('   2. For local development, use Stripe CLI:');
    console.log('      stripe listen --forward-to localhost:5000/api/payments/webhook');
    console.log('   3. Test the payment flow with test cards');
    console.log('   4. Check PAYMENT_SETUP.md for detailed instructions\n');
  } else {
    console.log('\n❌ Payment system needs configuration');
    console.log('\n📝 Fix the issues above and run this script again\n');
  }

  process.exit(issues.length > 0 ? 1 : 0);
}

// Run the check
checkPaymentSetup().catch(error => {
  console.error('\n❌ Error running payment setup check:', error.message);
  process.exit(1);
});

