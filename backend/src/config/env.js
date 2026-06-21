import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',

  DATABASE_URL: process.env.DATABASE_URL,

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_TEMP_SECRET: process.env.JWT_TEMP_SECRET,

JWT_ACCESS_EXPIRES: '7d',  JWT_REFRESH_EXPIRES_DAYS: 7,
  JWT_TEMP_EXPIRES: '10m',

  PASSWORD_RESET_EXPIRES_MIN: 15,

  BCRYPT_COST: 12,
  
  MAIL: {
    HOST: process.env.MAIL_HOST,
    PORT: parseInt(process.env.MAIL_PORT || '587', 10),
    USER: process.env.MAIL_USER,
    PASSWORD: process.env.MAIL_PASSWORD,
    FROM_NAME: process.env.MAIL_FROM_NAME || 'LaporKu',
  },

  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  COOKIE_SECURE: process.env.NODE_ENV === 'production',

  REDIS_HOST: process.env.REDIS_HOST || '127.0.0.1',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
};