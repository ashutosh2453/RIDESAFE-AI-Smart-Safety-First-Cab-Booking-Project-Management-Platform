import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'ridesafe_super_secret_jwt_key_2026_dev_prod_hash_token',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173', 'http://localhost:3000'],
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  aiApiKey: process.env.AI_API_KEY || '',
  fareConfig: {
    baseFare: 80,
    perKmRate: 15,
    perMinuteRate: 2.5,
    multipliers: {
      MINI: 1.0,
      SEDAN: 1.25,
      SUV: 1.6,
    },
  },
};
