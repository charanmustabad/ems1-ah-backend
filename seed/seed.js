const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { seedDefaultData } = require('../src/config/defaultData');

dotenv.config({ path: '../.env' });

const seed = async () => {
  try {
    let uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fittrack_pro';

    try {
      await mongoose.connect(uri);
    } catch (error) {
      const mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      process.env.MONGODB_URI = uri;
      await mongoose.connect(uri);
    }

    console.log('Connected to MongoDB for seeding');
    await seedDefaultData();
    console.log('Database seeded with default admin and demo data.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
