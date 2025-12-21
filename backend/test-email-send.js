// Load environment configuration
const config = require('./config/env');
const nodemailer = require('nodemailer');

console.log('Testing email configuration...');
console.log('Email User:', config.email.user);
console.log('Email Pass:', config.email.pass ? '***' : 'Not set');

// Create a test transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.email.user,
    pass: config.email.pass
  },
  tls: {
    rejectUnauthorized: false // Only for testing
  }
});

// Email options
const mailOptions = {
  from: `"E-commerce Test" <${config.email.user}>`,
  to: config.email.user, // Sending to yourself for testing
  subject: '✅ Test Email from E-commerce Backend',
  text: 'This is a test email from your e-commerce backend.',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4a86e8;">Test Email from E-commerce Backend</h2>
      <p>Hello,</p>
      <p>This is a test email sent from your e-commerce backend application.</p>
      <p>If you're seeing this, your email configuration is working correctly! 🎉</p>
      <p style="margin-top: 30px; color: #666; font-size: 12px;">
        This is an automated message. Please do not reply to this email.
      </p>
    </div>
  `
};

// Send the email
console.log('Sending test email to:', config.email.user);
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('❌ Error sending email:');
    console.error(error);
    
    // More detailed error information
    if (error.responseCode) {
      console.error('Response Code:', error.responseCode);
    }
    if (error.response) {
      console.error('Response:', error.response);
    }
    
    // Common Gmail errors
    if (error.code === 'EAUTH') {
      console.log('\n🔑 Authentication failed. Please check:');
      console.log('1. Your Google Account has 2FA enabled');
      console.log('2. You\'ve generated an App Password for this app');
      console.log('3. The App Password is correctly set in your .env file');
    }
    
    process.exit(1);
  } else {
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : 'Not available in production');
    process.exit(0);
  }
});
