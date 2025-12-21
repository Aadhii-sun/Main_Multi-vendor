require('dotenv').config();
const { sendEmail, emailTemplates } = require('./config/emailService');

async function testEmail() {
  try {
    console.log('Sending test email...');
    
    await sendEmail(
      process.env.EMAIL_USER, // Send to yourself
      'welcome',
      { 
        name: 'Test User',
        email: process.env.EMAIL_USER
      },
      {
        subject: 'Test Email from E-commerce Backend',
        from: `"E-commerce Team" <${process.env.EMAIL_USER}>`
      }
    );
    
    console.log('✅ Test email sent successfully!');
  } catch (error) {
    console.error('❌ Error sending test email:');
    console.error(error);
    
    // More detailed error logging
    if (error.response) {
      console.error('SMTP Response:', error.response);
    }
    if (error.code) {
      console.error('Error Code:', error.code);
    }
  }
}

testEmail();
