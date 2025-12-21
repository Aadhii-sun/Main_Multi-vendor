require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('Environment Variables:');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not Set');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not Set');

// Create a test account (ethereal.email)
async function testEmail() {
  try {
    // Create a test account
    const testAccount = await nodemailer.createTestAccount();
    
    // Create a transporter using the test account
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    // Send a test email
    const info = await transporter.sendMail({
      from: '"Test Sender" <sender@example.com>',
      to: 'recipient@example.com',
      subject: 'Test Email',
      text: 'This is a test email from Nodemailer',
      html: '<b>This is a test email from Nodemailer</b>'
    });

    console.log('Test email sent!');
    console.log('Message ID:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending test email:');
    console.error(error);
  }
}

testEmail();
