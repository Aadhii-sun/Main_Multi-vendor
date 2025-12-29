const fs = require('fs');
const path = require('path');

// Load environment variables from .env file when available
const envPath = path.resolve(__dirname, '../.env');
let envConfig = {};

try {
  if (fs.existsSync(envPath)) {
    envConfig = fs
      .readFileSync(envPath, 'utf-8')
      .split('\n')
      .filter(Boolean) // Remove empty lines
      .reduce((acc, line) => {
        const trimmed = line.trim();

        // Skip comments or invalid lines
        if (!trimmed || trimmed.startsWith('#')) {
          return acc;
        }

        const [key, ...valueParts] = trimmed.split('=');
        if (!key) {
          return acc;
        }

        const value = valueParts.join('=').trim();

        // Only set if not already set (allows overriding with system env vars)
        if (!process.env[key]) {
          process.env[key] = value;
        }

        return { ...acc, [key]: value };
      }, {});

    console.log(`Loaded environment variables from ${path.relative(process.cwd(), envPath)}`);
  } else {
    console.warn(`No .env file found at ${path.relative(process.cwd(), envPath)}. Relying on existing environment variables.`);
  }
} catch (error) {
  console.error('Failed to load .env file:', error.message);
}

// Verify required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  process.exit(1);
}

// Email configuration check
const hasSendGrid = !!process.env.SENDGRID_API_KEY;
const hasSMTP = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);

if (!hasSendGrid && !hasSMTP) {
  console.warn('⚠️  Email service not configured. OTP will be logged to console.');
  console.warn('   Configure either SENDGRID_API_KEY (recommended for Render) or EMAIL_USER/EMAIL_PASS');
}

console.log('✅ Environment variables loaded successfully');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('PORT:', process.env.PORT || '5000 (default)');
console.log('MongoDB URI:', process.env.MONGO_URI ? 'Configured' : 'Missing');
console.log('JWT Secret:', process.env.JWT_SECRET ? 'Configured' : 'Missing');
console.log('Email Service:', hasSendGrid ? 'SendGrid (API)' : hasSMTP ? 'SMTP (Gmail)' : 'Not configured');
console.log('SendGrid API Key:', hasSendGrid ? 'Configured' : 'Missing');
console.log('SMTP Credentials:', hasSMTP ? 'Configured' : 'Missing');
console.log('Stripe Key:', process.env.STRIPE_SECRET_KEY ? 'Configured' : 'Missing');
console.log('Client URL:', process.env.CLIENT_URL || 'Not set');

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  email: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.SENDGRID_FROM_EMAIL,
    fromName: process.env.SENDGRID_FROM_NAME
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY
  },
  clientUrl: process.env.CLIENT_URL,
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'dkq9qo8vf',
    apiKey: process.env.CLOUDINARY_API_KEY || '799582919956526',
    apiSecret: process.env.CLOUDINARY_API_SECRET
  }
};
