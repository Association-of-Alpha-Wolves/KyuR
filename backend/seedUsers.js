import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from './src/models/User.js';

dotenv.config();

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const passwordHash = await bcrypt.hash('password123', 10);

    const usersToCreate = [
      {
        name: 'Student One',
        email: 'student1@iskolarngbayan.pup.edu.ph',
        password: passwordHash,
        role: 'student',
      },
      {
        name: 'Student Two',
        email: 'student2@iskolarngbayan.pup.edu.ph',
        password: passwordHash,
        role: 'student',
      },
      {
        name: 'Admin User',
        email: 'admin@iskolarngbayan.pup.edu.ph',
        password: passwordHash,
        role: 'admin',
      }
    ];

    // Clear these users if they already exist to avoid duplicate key errors
    await User.deleteMany({ email: { $in: usersToCreate.map(u => u.email) } });

    const inserted = await User.insertMany(usersToCreate);
    console.log(`Successfully created ${inserted.length} users!`);
    console.log('Credentials for all accounts:');
    console.log('Password: password123');
    console.log('Emails:');
    inserted.forEach(u => console.log(`- ${u.email} (${u.role})`));

    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
}

seedUsers();
