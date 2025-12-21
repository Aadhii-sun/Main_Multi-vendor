const mongoose = require('mongoose');
const Stripe = require('stripe');
const nodemailer = require('nodemailer');
require('dotenv').config();

class ConnectionTester {
  constructor() {
    this.results = {
      mongodb: { status: 'pending', message: '', details: {} },
      stripe: { status: 'pending', message: '', details: {} },
      email: { status: 'pending', message: '', details: {} }
    };
  }

  async testMongoDB() {
    try {
      console.log('🔄 Testing MongoDB connection...');

      if (!process.env.MONGO_URI) {
        this.results.mongodb = {
          status: 'error',
          message: 'MONGO_URI not configured in environment variables',
          details: {}
        };
        return;
      }

      // Test connection without connecting to server
      const mongoUrl = new URL(process.env.MONGO_URI);
      this.results.mongodb.details = {
        host: mongoUrl.hostname,
        port: mongoUrl.port,
        database: mongoUrl.pathname.substring(1),
        protocol: mongoUrl.protocol
      };

      // Try to connect
      await mongoose.connect(process.env.MONGO_URI);
      await mongoose.disconnect();

      this.results.mongodb = {
        status: 'success',
        message: 'MongoDB connection successful',
        details: this.results.mongodb.details
      };

      console.log('✅ MongoDB: Connected successfully');
    } catch (error) {
      this.results.mongodb = {
        status: 'error',
        message: `MongoDB connection failed: ${error.message}`,
        details: this.results.mongodb.details
      };
      console.log('❌ MongoDB: Connection failed');
    }
  }

  async testStripe() {
    try {
      console.log('🔄 Testing Stripe connection...');

      if (!process.env.STRIPE_SECRET_KEY) {
        this.results.stripe = {
          status: 'error',
          message: 'STRIPE_SECRET_KEY not configured',
          details: {}
        };
        return;
      }

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

      // Test by retrieving balance (requires valid key)
      const balance = await stripe.balance.retrieve();

      this.results.stripe = {
        status: 'success',
        message: 'Stripe connection successful',
        details: {
          currency: balance.currency,
          available: balance.available.reduce((sum, bal) => sum + bal.amount, 0),
          pending: balance.pending.reduce((sum, bal) => sum + bal.amount, 0)
        }
      };

      console.log('✅ Stripe: Connected successfully');
    } catch (error) {
      this.results.stripe = {
        status: 'error',
        message: `Stripe connection failed: ${error.message}`,
        details: {}
      };
      console.log('❌ Stripe: Connection failed');
    }
  }

  async testEmail() {
    try {
      console.log('🔄 Testing Email service connection...');

      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        this.results.email = {
          status: 'error',
          message: 'Email credentials not configured (EMAIL_USER, EMAIL_PASS)',
          details: {}
        };
        return;
      }

      let transporter;

      // Try Gmail first
      if (process.env.EMAIL_USER.includes('gmail.com')) {
        transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });
      } else {
        // Try custom SMTP
        transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: process.env.SMTP_PORT || 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });
      }

      // Verify connection
      await transporter.verify();

      this.results.email = {
        status: 'success',
        message: 'Email service connection successful',
        details: {
          service: process.env.EMAIL_USER.includes('gmail.com') ? 'Gmail' : 'Custom SMTP',
          user: process.env.EMAIL_USER,
          host: process.env.SMTP_HOST || 'smtp.gmail.com'
        }
      };

      console.log('✅ Email: Connected successfully');
    } catch (error) {
      this.results.email = {
        status: 'error',
        message: `Email connection failed: ${error.message}`,
        details: {}
      };
      console.log('❌ Email: Connection failed');
    }
  }

  async testAll() {
    console.log('🚀 Starting Cloud Service Connection Tests...\n');

    await Promise.allSettled([
      this.testMongoDB(),
      this.testStripe(),
      this.testEmail()
    ]);

    console.log('\n📊 Test Results Summary:');
    console.log('=' .repeat(50));

    Object.entries(this.results).forEach(([service, result]) => {
      const status = result.status === 'success' ? '✅' : '❌';
      console.log(`${status} ${service.toUpperCase()}: ${result.message}`);

      if (result.details && Object.keys(result.details).length > 0) {
        console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
      }
      console.log('');
    });

    const successCount = Object.values(this.results).filter(r => r.status === 'success').length;
    const totalCount = Object.keys(this.results).length;

    console.log(`📈 Overall: ${successCount}/${totalCount} services connected successfully`);

    if (successCount === totalCount) {
      console.log('🎉 All cloud services are properly configured!');
    } else {
      console.log('⚠️  Some services need configuration. Check environment variables.');
    }

    return this.results;
  }

  getResults() {
    return this.results;
  }
}

module.exports = ConnectionTester;

// Export individual methods for testing
module.exports.testMongoDB = async () => {
  const tester = new ConnectionTester();
  await tester.testMongoDB();
  return tester.getResults().mongodb;
};

module.exports.testStripe = async () => {
  const tester = new ConnectionTester();
  await tester.testStripe();
  return tester.getResults().stripe;
};

module.exports.testEmail = async () => {
  const tester = new ConnectionTester();
  await tester.testEmail();
  return tester.getResults().email;
};

// If run directly, test all connections
if (require.main === module) {
  const tester = new ConnectionTester();
  tester.testAll().then((results) => {
    console.log('\n📊 Test Results Summary:');
    console.log('=' .repeat(50));

    Object.entries(results).forEach(([service, result]) => {
      const status = result.status === 'success' ? '✅' : '❌';
      console.log(`${status} ${service.toUpperCase()}: ${result.message}`);

      if (result.details && Object.keys(result.details).length > 0) {
        console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
      }
      console.log('');
    });

    const successCount = Object.values(results).filter(r => r.status === 'success').length;
    const totalCount = Object.keys(results).length;

    console.log(`📈 Overall: ${successCount}/${totalCount} services connected successfully`);

    if (successCount === totalCount) {
      console.log('🎉 All cloud services are properly configured!');
    } else {
      console.log('⚠️  Some services need configuration. Check environment variables.');
    }

    process.exit(0);
  }).catch((error) => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}
