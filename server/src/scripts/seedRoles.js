require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');

const seedRoles = async () => {
  try {
    await connectDB();

    const users = [
      {
        fullName: 'Manager User',
        email: 'manager@dukaanka.com',
        password: 'Manager123!',
        role: 'Manager'
      },
      {
        fullName: 'Tailor User',
        email: 'tailor@dukaanka.com',
        password: 'Tailor123!',
        role: 'Tailor'
      },
      {
        fullName: 'Cashier User',
        email: 'cashier@dukaanka.com',
        password: 'Cashier123!',
        role: 'Cashier'
      }
    ];

    for (const user of users) {
      const existing = await User.findOne({ email: user.email.toLowerCase() });
      if (!existing) {
        await User.create({
          fullName: user.fullName,
          email: user.email.toLowerCase(),
          password: user.password,
          role: user.role
        });
        console.log(`Created ${user.role} (${user.email})`);
      } else {
        console.log(`Skipped ${user.role} (${user.email}) - already exists`);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedRoles();
