import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod;

/**
 * globalSetup — runs once before all test suites.
 * Spins up an in-memory MongoDB instance and connects Mongoose to it.
 * The URI is stored in process.env so individual test files can access it.
 */
export default async function globalSetup() {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  process.env.MONGO_URI = uri;
  process.env.JWT_SECRET = 'test-jwt-secret-kyur';
  process.env.JWT_EXPIRES_IN = '1d';
  process.env.NODE_ENV = 'test';

  // Store the instance reference so teardown can stop it
  global.__MONGOD__ = mongod;
}
