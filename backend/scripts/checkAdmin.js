require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');

(async () => {
  try {
    await connectDB();
    const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    if (!email) throw new Error('ADMIN_EMAIL missing in .env');
    const plain = process.env.ADMIN_PASSWORD;
    if (!plain) throw new Error('ADMIN_PASSWORD missing in .env');

    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ No user found with email:', email);
      process.exit(1);
    }

    const match = await bcrypt.compare(plain, user.password || '');
    console.log('ℹ️  User:', { email: user.email, role: user.role, id: user._id.toString() });
    console.log('ℹ️  Password hash present:', Boolean(user.password));
    console.log('ℹ️  Bcrypt compare result:', match);

    if (!match) {
      console.log('\nAttempting to re-hash and update password from ADMIN_PASSWORD...');
      const hash = await bcrypt.hash(plain, 12);
      user.password = hash;
      await user.save();
      console.log('✅ Password updated for', email);
    }

    if (user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
      console.log('✅ Role set to admin for', email);
    }

    console.log('\nDone. Try logging in again on /admin/login.');
    process.exit(0);
  } catch (err) {
    console.error('❌ checkAdmin failed:', err.message);
    process.exit(1);
  }
})();


