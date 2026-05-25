const mongoose = require('mongoose');
const { env } = require('./env');

const connectDB = async () => {
  if (!env.mongoUri) {
    if (env.nodeEnv === 'production') {
      throw new Error('MONGODB_URI is required in production');
    }

    console.warn('MONGODB_URI is not set. Database-backed routes will require a MongoDB Atlas connection.');
    return null;
  }

  mongoose.set('strictQuery', true);

  try {
    const connection = await mongoose.connect(env.mongoUri, {
      autoIndex: env.nodeEnv !== 'production',
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB connected: ${connection.connection.host}`);
    return connection;
  } catch (error) {
    if (env.nodeEnv === 'production') {
      throw error;
    }

    console.warn(`MongoDB connection unavailable: ${error.message}`);
    console.warn('FINORA API started without database access. Configure MONGODB_URI for auth, portfolio, trading, watchlists, and settings.');
    return null;
  }
};

const disconnectDB = async () => {
  await mongoose.connection.close();
};

module.exports = { connectDB, disconnectDB };
