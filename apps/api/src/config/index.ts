import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  apiUrl: process.env.API_URL || 'http://localhost:5000',

  mongodb: {
    uri: (() => {
      const uri = process.env.MONGODB_URI;
      if (process.env.NODE_ENV === 'production' && !uri) {
        throw new Error('FATAL SECURITY ERROR: MONGODB_URI must be provided in production!');
      }
      return uri || 'mongodb://localhost:27017/realestate';
    })(),
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  jwt: {
    secret: (() => {
      const sec = process.env.JWT_SECRET;
      if (process.env.NODE_ENV === 'production' && (!sec || sec === 'dev-secret-change-me')) {
        throw new Error('FATAL SECURITY ERROR: JWT_SECRET must be set to a secure key in production!');
      }
      return sec || 'dev-secret-change-me';
    })(),
    refreshSecret: (() => {
      const sec = process.env.JWT_REFRESH_SECRET;
      if (process.env.NODE_ENV === 'production' && (!sec || sec === 'dev-refresh-secret-change-me')) {
        throw new Error('FATAL SECURITY ERROR: JWT_REFRESH_SECRET must be set to a secure key in production!');
      }
      return sec || 'dev-refresh-secret-change-me';
    })(),
    expiry: process.env.JWT_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  initialAdmin: {
    email: process.env.INITIAL_ADMIN_EMAIL || '',
    password: process.env.INITIAL_ADMIN_PASSWORD || '',
  },

  r2: {
    accountId: process.env.R2_ACCOUNT_ID || '',
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    bucketName: process.env.R2_BUCKET_NAME || 'realestate-media',
    publicUrl: process.env.R2_PUBLIC_URL || '',
  },

  resend: {
    apiKey: process.env.RESEND_API_KEY || '',
    mailFrom: process.env.MAIL_FROM || 'noreply@example.com',
  },

  whatsapp: {
    token: process.env.WHATSAPP_TOKEN || '',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || '',
    appSecret: process.env.WHATSAPP_APP_SECRET || '',
  },

  exchangeRate: {
    apiKey: process.env.EXCHANGE_RATE_API_KEY || '',
    apiUrl: process.env.EXCHANGE_RATE_API_URL || 'https://api.exchangerate-api.com/v4',
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
  },

  googleMaps: {
    apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  },

  sentry: {
    dsn: process.env.SENTRY_DSN || '',
  },

  cors: {
    origins: [
      process.env.PUBLIC_WEBSITE_URL || 'http://localhost:3000',
      process.env.ADMIN_URL || 'http://localhost:3001',
    ].filter(Boolean),
  },
  agency: {
    name: process.env.AGENCY_NAME || '',
    phone: process.env.AGENCY_PHONE || '',
    whatsapp: process.env.AGENCY_WHATSAPP || '',
    email: process.env.AGENCY_EMAIL || '',
    address: process.env.AGENCY_ADDRESS || '',
    officeHours: process.env.AGENCY_OFFICE_HOURS || '',
    videoConsultationUrl: process.env.AGENCY_VIDEO_URL || '',
  },
} as const;
