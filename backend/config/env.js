const requiredInProduction = ['MONGODB_URI', 'JWT_SECRET', 'CLIENT_URL'];

const validateEnv = () => {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  const missing = requiredInProduction.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required production environment variables: ${missing.join(', ')}`);
  }
};

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI || process.env.MONGO_URI || '',
  jwtSecret: process.env.JWT_SECRET || 'local-finora-development-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtCookieExpiresIn: Number(process.env.JWT_COOKIE_EXPIRES_IN) || 7,
  clientUrl: process.env.CLIENT_URL || process.env.VITE_API_URL || 'http://localhost:5173',
  useMockData: process.env.USE_MOCK_DATA !== 'false',
};

module.exports = { env, validateEnv };
