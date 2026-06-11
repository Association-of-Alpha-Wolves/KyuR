import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Item from './src/models/Item.js';

dotenv.config();

async function revert() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const result = await Item.deleteMany({
      title: { $in: ['Lost Apple AirPods Pro', 'Found Black Leather Wallet', 'Claimed Student ID'] }
    });

    console.log(`Successfully removed ${result.deletedCount} dummy items!`);
    process.exit(0);
  } catch (error) {
    console.error('Error removing data:', error);
    process.exit(1);
  }
}

revert();
