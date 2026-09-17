const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart-lost-found';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return;
  } catch (err) {
    console.warn(`Local MongoDB connection failed (${err.message}).`);
    console.log('Attempting in-memory MongoDB fallback for instant zero-config setup...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`In-Memory MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (memErr) {
      console.error(`MongoDB In-Memory fallback failed: ${memErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
