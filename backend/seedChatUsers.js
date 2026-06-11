import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Item from './src/models/Item.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const passwordHash = await bcrypt.hash('password123', 10);

    // Create or get student 1
    let student1 = await User.findOne({ email: 'student1@iskolarngbayan.pup.edu.ph' });
    if (!student1) {
      student1 = await User.create({
        name: 'Student One',
        email: 'student1@iskolarngbayan.pup.edu.ph',
        password: passwordHash,
        role: 'student'
      });
      console.log('Created Student 1');
    } else {
      console.log('Student 1 already exists');
    }

    // Create or get student 2
    let student2 = await User.findOne({ email: 'student2@iskolarngbayan.pup.edu.ph' });
    if (!student2) {
      student2 = await User.create({
        name: 'Student Two',
        email: 'student2@iskolarngbayan.pup.edu.ph',
        password: passwordHash,
        role: 'student'
      });
      console.log('Created Student 2');
    } else {
      console.log('Student 2 already exists');
    }

    // Delete existing dummy items for this test just to be clean
    await Item.deleteMany({ title: 'Dummy Item for Chat Test' });

    // Create an item for student 1
    const item = await Item.create({
        title: 'Dummy Item for Chat Test',
        description: 'This is a test item uploaded by Student 1 so Student 2 can chat with them.',
        category: 'electronics',
        status: 'lost',
        locationId: 'LOC-TEST-001',
        reportedBy: student1._id
    });
    console.log(`Created Item with ID: ${item._id}`);
    
    console.log('Seeding complete! Log in as student2@iskolarngbayan.pup.edu.ph (password: password123) and check the catalog for the item.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seed();
