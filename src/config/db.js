const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { seedDefaultData } = require('./defaultData');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fittrack_pro';
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    try {
      console.warn('External MongoDB unavailable, starting in-memory MongoDB instance...');
      const mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      process.env.MONGODB_URI = uri;
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`MongoDB connected via in-memory server: ${conn.connection.host}`);
    } catch (memoryError) {
      console.error('MongoDB connection failed:', memoryError.message);
      process.exit(1);
    }
  }

  await seedDefaultData();
};

module.exports = connectDB;
