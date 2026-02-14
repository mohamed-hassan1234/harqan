require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');

const seed = async () => {
  try {
    await connectDB();

    const email = process.env.SEED_ADMIN_EMAIL || 'admin@dukaanka.com';
    const password = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    await User.create({
      fullName: 'System Admin',
      email: email.toLowerCase(),
      password,
      role: 'Admin'
    });

    console.log('Admin user created');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
