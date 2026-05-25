import mongoose from 'mongoose';

/**
 * globalTeardown — runs once after all test suites complete.
 * Disconnects Mongoose and stops the in-memory MongoDB server.
 */
export default async function globalTeardown() {
  await mongoose.disconnect();
  if (global.__MONGOD__) {
    await global.__MONGOD__.stop();
  }
}
