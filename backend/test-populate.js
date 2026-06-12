import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Message from './src/models/Message.js';
import User from './src/models/User.js';
import Item from './src/models/Item.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB");
    
    // Pick any user who has messages
    const msg = await Message.findOne();
    if (!msg) {
        console.log("No messages found");
        process.exit(0);
    }
    const userId = msg.sender;
    
    const conversations = await Message.aggregate([
      { $match: { $or: [{ sender: userId }, { receiver: userId }] } },
      { $sort: { createdAt: -1 } },
      { $group: {
          _id: "$item",
          latestMessage: { $first: "$$ROOT" }
        }
      },
      { $sort: { "latestMessage.createdAt": -1 } }
    ]);

    await Message.populate(conversations, [
      { path: "latestMessage.sender", select: "name _id", model: User },
      { path: "latestMessage.receiver", select: "name _id", model: User },
      { path: "latestMessage.item", select: "title", model: Item }
    ]);

    console.log(JSON.stringify(conversations.map(c => c.latestMessage), null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
