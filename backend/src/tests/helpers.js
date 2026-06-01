import mongoose from 'mongoose';

/**
 * connectTestDB
 * Each test file calls this in beforeAll to connect to the shared
 * in-memory MongoDB URI set by globalSetup.
 */
export const connectTestDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }
};

/**
 * clearCollections
 * Wipes all collections between tests so each test starts with a clean slate.
 */
export const clearCollections = async () => {
  const collections = mongoose.connection.collections;
  await Promise.all(
    Object.values(collections).map((col) => col.deleteMany({}))
  );
};
