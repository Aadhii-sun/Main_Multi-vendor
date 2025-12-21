require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');

(async () => {
  try {
    await connectDB();

    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const name = process.env.ADMIN_NAME || 'Admin';

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await User.findOneAndUpdate(
      { email },
      { name, email, password: passwordHash, role: 'admin', isActive: true },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    console.log('✅ Admin user ensured:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role:  ${admin.role}`);
    console.log('\nYou can now log in at /admin/login with the email above and the password you set in .env (ADMIN_PASSWORD).');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to seed admin:', err.message);
    process.exit(1);
  }
})();


