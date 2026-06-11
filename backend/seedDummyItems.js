import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Item from './src/models/Item.js';
import User from './src/models/User.js';

dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get an existing user, or create a dummy one
    let user = await User.findOne();
    if (!user) {
      user = await User.create({
        name: 'Dummy KyuR User',
        email: 'dummy@kyur.app',
        password: 'password123', 
        role: 'student',
        studentId: '2023-00000-MN-0'
      });
      console.log('Created dummy user:', user.name);
    } else {
      console.log('Using existing user:', user.name);
    }

    const itemsToInsert = [
      {
        title: 'Lost Apple AirPods Pro',
        description: 'I lost my AirPods in their white charging case near the main gate. They have a small scratch on the front.',
        category: 'electronics',
        status: 'lost',
        locationId: 'QR-MAIN-S502',
        reportedBy: user._id
      },
      {
        title: 'Found Black Leather Wallet',
        description: 'Found a black leather wallet containing some IDs and cash at the library.',
        category: 'wallet',
        status: 'found',
        locationId: 'QR-LIB-01',
        reportedBy: user._id
      },
      {
        title: 'Claimed Student ID',
        description: 'PUP Student ID with college lanyard. Already returned to the owner at the cafe.',
        category: 'id',
        status: 'claimed',
        locationId: 'QR-CAFE-03',
        reportedBy: user._id,
        claimedBy: user._id
      }
    ];

    const inserted = await Item.insertMany(itemsToInsert);
    console.log(`Successfully inserted ${inserted.length} dummy items!`);
    console.log(inserted.map(i => `- ${i.title} [${i.status}]`).join('\n'));
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();
