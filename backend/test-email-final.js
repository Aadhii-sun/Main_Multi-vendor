require('dotenv').config({ path: '.env' });
const nodemailer = require('nodemailer');
const config = require('./config/env');
const { sendEmail, emailTemplates } = require('./config/emailService');

console.log('Testing email configuration...');
console.log('Environment:', config.nodeEnv);
console.log('Email User:', config.email.user);
console.log('Email Pass:', config.email.pass ? '***' : 'Not set');

async function testEmail() {
  try {
    console.log('\nSending test email...');
    
    const result = await sendEmail(
      config.email.user, // Send to yourself
      'welcome',
      {
        userData: {
          name: 'Test User',
          email: config.email.user
        }
      },
      {
        subject: '🚀 Test Email from E-commerce Backend',
        from: config.email.from
      }
    );
    
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(result) : 'Not available');
  } catch (error) {
    console.error('❌ Error sending test email:');
    console.error(error);
    
    if (error.response) {
      console.error('SMTP Response:', error.response);
    }
    if (error.code) {
      console.error('Error Code:', error.code);
    }
  }
}

// Run the test
testEmail();
