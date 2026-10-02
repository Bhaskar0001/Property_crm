const fs = require('fs');
const path = require('path');

const baseDir = 'c:\\Users\\BHASKAR JOSHI\\OneDrive\\Desktop\\RealEstate\\apps\\api';

const files = {
  'package.json': `{
  "name": "@repo/api",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "lint": "tsc --noEmit",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@aws-sdk/client-s3": "^3.600.0",
    "@aws-sdk/s3-request-presigner": "^3.600.0",
    "argon2": "^0.40.0",
    "bullmq": "^5.0.0",
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "dotenv": "^16.4.0",
    "express": "^4.21.0",
    "express-mongo-sanitize": "^2.2.0",
    "express-rate-limit": "^7.4.0",
    "helmet": "^7.1.0",
    "ioredis": "^5.4.0",
    "jsonwebtoken": "^9.0.0",
    "mongoose": "^8.6.0",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.1",
    "pino": "^9.0.0",
    "pino-pretty": "^11.0.0",
    "resend": "^4.0.0",
    "sharp": "^0.33.0",
    "socket.io": "^4.7.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/cookie-parser": "^1.4.7",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/morgan": "^1.9.9",
    "@types/multer": "^1.4.12",
    "@types/node": "^22.0.0",
    "tsx": "^4.19.0",
    "typescript": "^5.6.0"
  }
}`,
  'tsconfig.json': `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "module": "CommonJS",
    "moduleResolution": "node",
    "target": "ES2022",
    "lib": ["ES2022"],
    "types": ["node"],
    "paths": {
      "@repo/shared": ["../../packages/shared/src"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}`,
  'src/config/index.ts': `import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  apiUrl: process.env.API_URL || 'http://localhost:5000',

  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/realestate',
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me',
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
} as const;`,
  'src/config/database.ts': `import mongoose from 'mongoose';
import { config } from './index';
import { logger } from '../utils/logger';

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongodb.uri);
    logger.info('MongoDB connected successfully');

    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
};`,
  'src/config/redis.ts': `import Redis from 'ioredis';
import { config } from './index';
import { logger } from '../utils/logger';

let redisClient: Redis | null = null;

export const connectRedis = async (): Promise<Redis> => {
  if (redisClient) return redisClient;

  redisClient = new Redis(config.redis.url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    retryStrategy(times: number) {
      if (times > 3) {
        logger.error('Redis connection failed after 3 retries');
        return null;
      }
      return Math.min(times * 200, 2000);
    },
  });

  redisClient.on('connect', () => {
    logger.info('Redis connected successfully');
  });

  redisClient.on('error', (error) => {
    logger.error('Redis connection error:', error);
  });

  return redisClient;
};

export const getRedis = (): Redis => {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return redisClient;
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis disconnected');
  }
};`,
  'src/utils/logger.ts': `import pino from 'pino';

export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } }
    : undefined,
});`,
  'src/utils/errors.ts': `export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;
  public details?: Record<string, string[]>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: Record<string, string[]>,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(\`\${resource} not found\`, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: Record<string, string[]>) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409, 'CONFLICT');
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}`,
  'src/utils/response.ts': `import { Response } from 'express';

export const sendSuccess = <T>(res: Response, data: T, message?: string, statusCode: number = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

export const sendCreated = <T>(res: Response, data: T, message?: string) => {
  return sendSuccess(res, data, message, 201);
};

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
) => {
  const totalPages = Math.ceil(total / limit);
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
};

export const sendNoContent = (res: Response) => {
  return res.status(204).send();
};`,
  'src/middlewares/errorHandler.ts': `import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Zod validation errors
  if (err instanceof ZodError) {
    const details: Record<string, string[]> = {};
    err.errors.forEach((e) => {
      const path = e.path.join('.');
      if (!details[path]) details[path] = [];
      details[path].push(e.message);
    });

    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details,
      },
    });
    return;
  }

  // Known operational errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message,
      },
    });
    return;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ID',
        message: 'Invalid ID format',
      },
    });
    return;
  }

  // Mongoose duplicate key error
  if ('code' in err && (err as any).code === 11000) {
    res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_KEY',
        message: 'A record with this value already exists',
      },
    });
    return;
  }

  // Unknown errors
  logger.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
    },
  });
};`,
  'src/middlewares/auth.ts': `import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { UserModel } from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    _id: string;
    email: string;
    name: string;
    role: string;
    team?: string;
    permissions: string[];
    countryAccess: string[];
    propertyTypeAccess: string[];
    featureAccess: string[];
    propertyAccessScope: any;
  };
}

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token =
      req.cookies?.access_token ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedError('No authentication token provided');
    }

    const decoded = jwt.verify(token, config.jwt.secret) as {
      userId: string;
      role: string;
    };

    const user = await UserModel.findById(decoded.userId).select(
      '-passwordHash -__v',
    );

    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or inactive');
    }

    req.user = {
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      team: user.team,
      permissions: user.permissions,
      countryAccess: user.countryAccess.map((id: any) => id.toString()),
      propertyTypeAccess: user.propertyTypeAccess.map((id: any) => id.toString()),
      featureAccess: user.featureAccess,
      propertyAccessScope: user.propertyAccessScope,
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('Invalid or expired token'));
    }
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient role'));
    }
    next();
  };
};

export const requirePermission = (...permissions: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }
    // Admin has all permissions
    if (req.user.role === 'admin') {
      return next();
    }
    const hasPermission = permissions.every((p) =>
      req.user!.permissions.includes(p),
    );
    if (!hasPermission) {
      return next(new ForbiddenError('Insufficient permissions'));
    }
    next();
  };
};

export const requireFeature = (feature: string) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }
    // Admin has all features
    if (req.user.role === 'admin') {
      return next();
    }
    if (!req.user.featureAccess.includes(feature)) {
      return next(new ForbiddenError(\`Feature '\${feature}' is not enabled for your account\`));
    }
    next();
  };
};`,
  'src/middlewares/validate.ts': `import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const data = schema.parse(req[source]);
      req[source] = data;
      next();
    } catch (error) {
      next(error);
    }
  };
};`,
  'src/models/User.ts': `import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  phone?: string;
  role: 'admin' | 'staff';
  team?: 'sales' | 'telecaller' | 'marketing' | 'property_operations' | 'other';
  passwordHash: string;
  isActive: boolean;
  mustChangePassword: boolean;
  permissions: string[];
  countryAccess: mongoose.Types.ObjectId[];
  propertyTypeAccess: mongoose.Types.ObjectId[];
  featureAccess: string[];
  propertyAccessScope: {
    type: 'all' | 'countries' | 'cities' | 'property_types' | 'assigned';
    countries?: mongoose.Types.ObjectId[];
    cities?: string[];
    propertyTypes?: mongoose.Types.ObjectId[];
  };
  lastLogin?: Date;
  refreshToken?: string;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'staff'],
      required: true,
      default: 'staff',
    },
    team: {
      type: String,
      enum: ['sales', 'telecaller', 'marketing', 'property_operations', 'other'],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
    permissions: {
      type: [String],
      default: [],
    },
    countryAccess: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Country' }],
      default: [],
    },
    propertyTypeAccess: {
      type: [{ type: Schema.Types.ObjectId, ref: 'PropertyType' }],
      default: [],
    },
    featureAccess: {
      type: [String],
      default: [],
    },
    propertyAccessScope: {
      type: {
        type: String,
        enum: ['all', 'countries', 'cities', 'property_types', 'assigned'],
        default: 'all',
      },
      countries: [{ type: Schema.Types.ObjectId, ref: 'Country' }],
      cities: [String],
      propertyTypes: [{ type: Schema.Types.ObjectId, ref: 'PropertyType' }],
    },
    lastLogin: Date,
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ team: 1 });

export const UserModel = mongoose.model<IUser>('User', userSchema);`,
  'src/app.ts': `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { errorHandler } from './middlewares/errorHandler';
import { logger } from './utils/logger';
import { authRouter } from './routes/auth';
import { healthRouter } from './routes/health';

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: config.cors.origins,
  credentials: true,
}));
app.use(mongoSanitize());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' } },
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
if (config.env !== 'production') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/auth', authRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Route not found' },
  });
});

// Error handler
app.use(errorHandler);

// Start server
const start = async () => {
  try {
    await connectDatabase();
    await connectRedis();

    app.listen(config.port, () => {
      logger.info(\`API server running on port \${config.port} in \${config.env} mode\`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();

export default app;`,
  'src/routes/health.ts': `import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { getRedis } from '../config/redis';

export const healthRouter = Router();

healthRouter.get('/', async (_req: Request, res: Response) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  let redisStatus = 'disconnected';

  try {
    const redis = getRedis();
    await redis.ping();
    redisStatus = 'connected';
  } catch {
    redisStatus = 'disconnected';
  }

  const healthy = mongoStatus === 'connected' && redisStatus === 'connected';

  res.status(healthy ? 200 : 503).json({
    success: healthy,
    data: {
      status: healthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        mongodb: mongoStatus,
        redis: redisStatus,
      },
    },
  });
});`,
  'src/routes/auth.ts': `import { Router } from 'express';

export const authRouter = Router();

// Placeholder — will be implemented in Phase 1 with full auth controllers
authRouter.post('/login', (_req, res) => {
  res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Auth will be fully implemented in Phase 1' } });
});`,
  'src/routes/index.ts': `export { healthRouter } from './health';
export { authRouter } from './auth';`,
  'src/controllers/.gitkeep': '',
  'src/services/.gitkeep': '',
  'src/repositories/.gitkeep': '',
  'src/validators/.gitkeep': '',
  'src/jobs/.gitkeep': '',
  'src/integrations/.gitkeep': '',
  'src/types/.gitkeep': ''
};

// --- Models ---
files['src/models/Country.ts'] = `import mongoose, { Schema, Document } from 'mongoose';
export interface ICountry extends Document { name: string; isoCode: string; currency: mongoose.Types.ObjectId; timezone: string; phoneCode: string; isActive: boolean; }
const schema = new Schema<ICountry>({
  name: { type: String, required: true },
  isoCode: { type: String, required: true, unique: true },
  currency: { type: Schema.Types.ObjectId, ref: 'Currency' },
  timezone: { type: String },
  phoneCode: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
export const CountryModel = mongoose.model<ICountry>('Country', schema);`;

files['src/models/Currency.ts'] = `import mongoose, { Schema, Document } from 'mongoose';
export interface ICurrency extends Document { code: string; symbol: string; name: string; isActive: boolean; isDefault: boolean; }
const schema = new Schema<ICurrency>({
  code: { type: String, required: true, unique: true },
  symbol: { type: String },
  name: { type: String },
  isActive: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });
export const CurrencyModel = mongoose.model<ICurrency>('Currency', schema);`;

files['src/models/PropertyType.ts'] = `import mongoose, { Schema, Document } from 'mongoose';
export interface IPropertyType extends Document { name: string; slug: string; icon: string; description: string; isActive: boolean; sortOrder: number; }
const schema = new Schema<IPropertyType>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  icon: { type: String },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });
export const PropertyTypeModel = mongoose.model<IPropertyType>('PropertyType', schema);`;

files['src/models/ListingType.ts'] = `import mongoose, { Schema, Document } from 'mongoose';
export interface IListingType extends Document { name: string; slug: string; isActive: boolean; sortOrder: number; }
const schema = new Schema<IListingType>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });
export const ListingTypeModel = mongoose.model<IListingType>('ListingType', schema);`;

files['src/models/TenureType.ts'] = `import mongoose, { Schema, Document } from 'mongoose';
export interface ITenureType extends Document { name: string; slug: string; isActive: boolean; sortOrder: number; }
const schema = new Schema<ITenureType>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });
export const TenureTypeModel = mongoose.model<ITenureType>('TenureType', schema);`;

files['src/models/PropertyStatus.ts'] = `import mongoose, { Schema, Document } from 'mongoose';
export interface IPropertyStatus extends Document { name: string; code: string; color: string; isActive: boolean; sortOrder: number; }
const schema = new Schema<IPropertyStatus>({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  color: { type: String },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });
export const PropertyStatusModel = mongoose.model<IPropertyStatus>('PropertyStatus', schema);`;

files['src/models/PropertyFeature.ts'] = `import mongoose, { Schema, Document } from 'mongoose';
export interface IPropertyFeature extends Document { name: string; slug: string; icon: string; isActive: boolean; sortOrder: number; }
const schema = new Schema<IPropertyFeature>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  icon: { type: String },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });
export const PropertyFeatureModel = mongoose.model<IPropertyFeature>('PropertyFeature', schema);`;

files['src/models/Property.ts'] = `import mongoose, { Schema, Document } from 'mongoose';
export interface IProperty extends Document {
  title: string; slug: string; description: string;
  country: mongoose.Types.ObjectId; propertyType: mongoose.Types.ObjectId;
  listingType: mongoose.Types.ObjectId; tenureType: mongoose.Types.ObjectId;
  status: mongoose.Types.ObjectId; currency: mongoose.Types.ObjectId;
  price: number; features: mongoose.Types.ObjectId[]; isPublished: boolean;
  createdBy: mongoose.Types.ObjectId; updatedBy: mongoose.Types.ObjectId;
}
const schema = new Schema<IProperty>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  country: { type: Schema.Types.ObjectId, ref: 'Country' },
  propertyType: { type: Schema.Types.ObjectId, ref: 'PropertyType' },
  listingType: { type: Schema.Types.ObjectId, ref: 'ListingType' },
  tenureType: { type: Schema.Types.ObjectId, ref: 'TenureType' },
  status: { type: Schema.Types.ObjectId, ref: 'PropertyStatus' },
  currency: { type: Schema.Types.ObjectId, ref: 'Currency' },
  price: { type: Number },
  features: [{ type: Schema.Types.ObjectId, ref: 'PropertyFeature' }],
  isPublished: { type: Boolean, default: false },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
schema.index({ slug: 1 }); schema.index({ country: 1 }); schema.index({ propertyType: 1 }); schema.index({ status: 1 }); schema.index({ isPublished: 1 }); schema.index({ price: 1 });
export const PropertyModel = mongoose.model<IProperty>('Property', schema);`;

files['src/models/Media.ts'] = `import mongoose, { Schema, Document } from 'mongoose';
export interface IMedia extends Document { property: mongoose.Types.ObjectId; type: string; originalUrl: string; thumbnailUrl: string; webUrl: string; fileName: string; fileSize: number; mimeType: string; width: number; height: number; sortOrder: number; isCover: boolean; altText: string; uploadedBy: mongoose.Types.ObjectId; }
const schema = new Schema<IMedia>({
  property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
  type: { type: String, enum: ['image', 'video', 'document'] },
  originalUrl: { type: String, required: true },
  thumbnailUrl: { type: String },
  webUrl: { type: String },
  fileName: { type: String },
  fileSize: { type: Number },
  mimeType: { type: String },
  width: { type: Number },
  height: { type: Number },
  sortOrder: { type: Number, default: 0 },
  isCover: { type: Boolean, default: false },
  altText: { type: String },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
schema.index({ property: 1, type: 1, sortOrder: 1 });
export const MediaModel = mongoose.model<IMedia>('Media', schema);`;

files['src/models/PropertyDocument.ts'] = `import mongoose, { Schema, Document } from 'mongoose';
export interface IPropertyDocument extends Document { property: mongoose.Types.ObjectId; name: string; type: string; fileUrl: string; fileName: string; fileSize: number; mimeType: string; visibility: string; version: string; expiryDate: Date; uploadedBy: mongoose.Types.ObjectId; }
const schema = new Schema<IPropertyDocument>({
  property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['brochure', 'floor_plan', 'legal', 'other'] },
  fileUrl: { type: String, required: true },
  fileName: { type: String },
  fileSize: { type: Number },
  mimeType: { type: String },
  visibility: { type: String, enum: ['public', 'private', 'staff'] },
  version: { type: String },
  expiryDate: { type: Date },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
schema.index({ property: 1, visibility: 1 });
export const PropertyDocumentModel = mongoose.model<IPropertyDocument>('PropertyDocument', schema);`;

files['src/models/Customer.ts'] = `import mongoose, { Schema, Document } from 'mongoose';
export interface ICustomer extends Document { name: string; email: string; phone: string; country: string; preferences: any; consentGiven: boolean; consentDate: Date; isActive: boolean; lastLoginAt: Date; }
const schema = new Schema<ICustomer>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  country: { type: String },
  preferences: { type: Schema.Types.Mixed },
  consentGiven: { type: Boolean, default: false },
  consentDate: { type: Date },
  isActive: { type: Boolean, default: true },
  lastLoginAt: { type: Date }
}, { timestamps: true });
schema.index({ email: 1 });
export const CustomerModel = mongoose.model<ICustomer>('Customer', schema);`;

files['src/models/Lead.ts'] = `import mongoose, { Schema, Document } from 'mongoose';
export interface ILead extends Document { customer: mongoose.Types.ObjectId; property: mongoose.Types.ObjectId; source: mongoose.Types.ObjectId; stage: mongoose.Types.ObjectId; assignedTo: mongoose.Types.ObjectId; priority: string; requirements: any; interestedProperties: mongoose.Types.ObjectId[]; matchedProperties: mongoose.Types.ObjectId[]; notes: string; lastContactedAt: Date; convertedAt: Date; lostReason: string; }
const schema = new Schema<ILead>({
  customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
  property: { type: Schema.Types.ObjectId, ref: 'Property' },
  source: { type: Schema.Types.ObjectId, ref: 'LeadSource' },
  stage: { type: Schema.Types.ObjectId, ref: 'LeadStage' },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  priority: { type: String, enum: ['low', 'medium', 'high'] },
  requirements: { type: Schema.Types.Mixed },
  interestedProperties: [{ type: Schema.Types.ObjectId, ref: 'Property' }],
  matchedProperties: [{ type: Schema.Types.ObjectId, ref: 'Property' }],
  notes: { type: String },
  lastContactedAt: { type: Date },
  convertedAt: { type: Date },
  lostReason: { type: String }
}, { timestamps: true });
schema.index({ customer: 1 }); schema.index({ property: 1 }); schema.index({ assignedTo: 1 }); schema.index({ stage: 1 }); schema.index({ source: 1 }); schema.index({ priority: 1 });
export const LeadModel = mongoose.model<ILead>('Lead', schema);`;

files['src/models/LeadSource.ts'] = `import mongoose, { Schema, Document } from 'mongoose';
export interface ILeadSource extends Document { name: string; slug: string; isActive: boolean; sortOrder: number; }
const schema = new Schema<ILeadSource>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });
export const LeadSourceModel = mongoose.model<ILeadSource>('LeadSource', schema);`;

files['src/models/LeadStage.ts'] = `import mongoose, { Schema, Document } from 'mongoose';
export interface ILeadStage extends Document { name: string; code: string; color: string; isActive: boolean; sortOrder: number; isFinal: boolean; }
const schema = new Schema<ILeadStage>({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  color: { type: String },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  isFinal: { type: Boolean, default: false }
}, { timestamps: true });
export const LeadStageModel = mongoose.model<ILeadStage>('LeadStage', schema);`;

files['src/models/LeadActivity.ts'] = `import mongoose, { Schema, Document } from 'mongoose';
export interface ILeadActivity extends Document { lead: mongoose.Types.ObjectId; type: string; description: string; metadata: any; performedBy: mongoose.Types.ObjectId; }
const schema = new Schema<ILeadActivity>({
  lead: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
  type: { type: String, enum: ['note', 'call', 'email', 'meeting', 'status_change'] },
  description: { type: String },
  metadata: { type: Schema.Types.Mixed },
  performedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
schema.index({ lead: 1, createdAt: 1 });
export const LeadActivityModel = mongoose.model<ILeadActivity>('LeadActivity', schema);`;

files['src/models/Task.ts'] = `import mongoose, { Schema, Document } from 'mongoose';
export interface ITask extends Document { lead: mongoose.Types.ObjectId; title: string; description: string; dueDate: Date; dueTime: string; priority: string; status: string; assignedTo: mongoose.Types.ObjectId; completedAt: Date; completedBy: mongoose.Types.ObjectId; }
const schema = new Schema<ITask>({
  lead: { type: Schema.Types.ObjectId, ref: 'Lead' },
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date },
  dueTime: { type: String },
  priority: { type: String, enum: ['low', 'normal', 'high'] },
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'cancelled'] },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  completedAt: { type: Date },
  completedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
schema.index({ lead: 1 }); schema.index({ assignedTo: 1 }); schema.index({ dueDate: 1 }); schema.index({ status: 1 });
export const TaskModel = mongoose.model<ITask>('Task', schema);`;

files['src/models/Viewing.ts'] = `import mongoose, { Schema, Document } from 'mongoose';
export interface IViewing extends Document { property: mongoose.Types.ObjectId; lead: mongoose.Types.ObjectId; customer: mongoose.Types.ObjectId; scheduledDate: Date; scheduledTime: string; duration: number; status: string; assignedTo: mongoose.Types.ObjectId; notes: string; feedback: string; cancelReason: string; rescheduledFrom: mongoose.Types.ObjectId; confirmedAt: Date; completedAt: Date; }
const schema = new Schema<IViewing>({
  property: { type: Schema.Types.ObjectId, ref: 'Property' },
  lead: { type: Schema.Types.ObjectId, ref: 'Lead' },
  customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
  scheduledDate: { type: Date },
  scheduledTime: { type: String },
  duration: { type: Number },
  status: { type: String, enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled'] },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
  feedback: { type: String },
  cancelReason: { type: String },
  rescheduledFrom: { type: Schema.Types.ObjectId, ref: 'Viewing' },
  confirmedAt: { type: Date },
  completedAt: { type: Date }
}, { timestamps: true });
schema.index({ property: 1 }); schema.index({ lead: 1 }); schema.index({ assignedTo: 1 }); schema.index({ scheduledDate: 1 }); schema.index({ status: 1 });
export const ViewingModel = mongoose.model<IViewing>('Viewing', schema);`;

files['src/models/Offer.ts'] = `import mongoose, { Schema, Document } from 'mongoose';
export interface IOffer extends Document { property: mongoose.Types.ObjectId; lead: mongoose.Types.ObjectId; amount: number; currency: mongoose.Types.ObjectId; status: string; submittedBy: mongoose.Types.ObjectId; notes: string; counterAmount: number; respondedAt: Date; respondedBy: mongoose.Types.ObjectId; }
const schema = new Schema<IOffer>({
  property: { type: Schema.Types.ObjectId, ref: 'Property' },
  lead: { type: Schema.Types.ObjectId, ref: 'Lead' },
  amount: { type: Number },
  currency: { type: Schema.Types.ObjectId, ref: 'Currency' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'countered'] },
  submittedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
  counterAmount: { type: Number },
  respondedAt: { type: Date },
  respondedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
schema.index({ property: 1 }); schema.index({ lead: 1 }); schema.index({ status: 1 });
export const OfferModel = mongoose.model<IOffer>('Offer', schema);`;

files['src/models/Conversation.ts'] = `import mongoose, { Schema, Document } from 'mongoose';
export interface IConversation extends Document { lead: mongoose.Types.ObjectId; customer: mongoose.Types.ObjectId; phoneNumber: string; lastMessageAt: Date; lastMessagePreview: string; unreadCount: number; assignedTo: mongoose.Types.ObjectId; isOptedOut: boolean; }
const schema = new Schema<IConversation>({
  lead: { type: Schema.Types.ObjectId, ref: 'Lead' },
  customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
  phoneNumber: { type: String },
  lastMessageAt: { type: Date },
  lastMessagePreview: { type: String },
  unreadCount: { type: Number, default: 0 },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  isOptedOut: { type: Boolean, default: false }
}, { timestamps: true });
schema.index({ customer: 1 }); schema.index({ lead: 1 }); schema.index({ assignedTo: 1 });
export const ConversationModel = mongoose.model<IConversation>('Conversation', schema);`;

files['src/models/Message.ts'] = `import mongoose, { Schema, Document } from 'mongoose';
export interface IMessage extends Document { conversation: mongoose.Types.ObjectId; direction: string; type: string; content: string; mediaUrl: string; templateName: string; templateParams: any; whatsappMessageId: string; status: string; sentBy: mongoose.Types.ObjectId; deliveredAt: Date; readAt: Date; failedReason: string; }
const schema = new Schema<IMessage>({
  conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  direction: { type: String, enum: ['inbound', 'outbound'] },
  type: { type: String, enum: ['text', 'image', 'document', 'template'] },
  content: { type: String },
  mediaUrl: { type: String },
  templateName: { type: String },
  templateParams: { type: Schema.Types.Mixed },
  whatsappMessageId: { type: String, sparse: true, unique: true },
  status: { type: String, enum: ['pending', 'sent', 'delivered', 'read', 'failed'] },
  sentBy: { type: Schema.Types.ObjectId, ref: 'User' },
  deliveredAt: { type: Date },
  readAt: { type: Date },
  failedReason: { type: String }
}, { timestamps: true });
schema.index({ conversation: 1, createdAt: 1 });
export const MessageModel = mongoose.model<IMessage>('Message', schema);`;

files['src/models/MessageTemplate.ts'] = `import mongoose, { Schema, Document } from 'mongoose';
export interface IMessageTemplate extends Document { name: string; language: string; category: string; body: string; headerType: string; headerContent: string; footerText: string; buttons: any[]; whatsappTemplateId: string; isApproved: boolean; isActive: boolean; }
const schema = new Schema<IMessageTemplate>({
  name: { type: String, required: true, unique: true },
  language: { type: String },
  category: { type: String },
  body: { type: String },
  headerType: { type: String },
  headerContent: { type: String },
  footerText: { type: String },
  buttons: [{ type: Schema.Types.Mixed }],
  whatsappTemplateId: { type: String },
  isApproved: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
export const MessageTemplateModel = mongoose.model<IMessageTemplate>('MessageTemplate', schema);`;

files['src/models/Campaign.ts'] = `import mongoose, { Schema, Document } from 'mongoose';
export interface ICampaign extends Document { name: string; template: mongoose.Types.ObjectId; status: string; audience: any; totalRecipients: number; sentCount: number; deliveredCount: number; readCount: number; failedCount: number; scheduledAt: Date; startedAt: Date; completedAt: Date; createdBy: mongoose.Types.ObjectId; }
const schema = new Schema<ICampaign>({
  name: { type: String, required: true },
  template: { type: Schema.Types.ObjectId, ref: 'MessageTemplate' },
  status: { type: String, enum: ['draft', 'scheduled', 'running', 'completed', 'failed'] },
  audience: { type: Schema.Types.Mixed },
  totalRecipients: { type: Number, default: 0 },
  sentCount: { type: Number, default: 0 },
  deliveredCount: { type: Number, default: 0 },
  readCount: { type: Number, default: 0 },
  failedCount: { type: Number, default: 0 },
  scheduledAt: { type: Date },
  startedAt: { type: Date },
  completedAt: { type: Date },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
schema.index({ status: 1 }); schema.index({ createdBy: 1 });
export const CampaignModel = mongoose.model<ICampaign>('Campaign', schema);`;

files['src/models/Notification.ts'] = `import mongoose, { Schema, Document } from 'mongoose';
export interface INotification extends Document { recipient: mongoose.Types.ObjectId; type: string; title: string; message: string; data: any; isRead: boolean; readAt: Date; }
const schema = new Schema<INotification>({
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['alert', 'reminder', 'message'] },
  title: { type: String },
  message: { type: String },
  data: { type: Schema.Types.Mixed },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date }
}, { timestamps: true });
schema.index({ recipient: 1 }); schema.index({ isRead: 1 }); schema.index({ createdAt: 1 });
export const NotificationModel = mongoose.model<INotification>('Notification', schema);`;

files['src/models/AuditLog.ts'] = `import mongoose, { Schema, Document } from 'mongoose';
export interface IAuditLog extends Document { user: mongoose.Types.ObjectId; userName: string; action: string; entity: string; entityId: string; ip: string; before: any; after: any; createdAt: Date; }
const schema = new Schema<IAuditLog>({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String },
  action: { type: String },
  entity: { type: String },
  entityId: { type: String },
  ip: { type: String },
  before: { type: Schema.Types.Mixed },
  after: { type: Schema.Types.Mixed }
}, { timestamps: false });
schema.index({ user: 1 }); schema.index({ entity: 1 }); schema.index({ entityId: 1 }); schema.index({ createdAt: 1 });
export const AuditLogModel = mongoose.model<IAuditLog>('AuditLog', schema);`;

files['src/models/OtpRecord.ts'] = `import mongoose, { Schema, Document } from 'mongoose';
export interface IOtpRecord extends Document { email: string; otpHash: string; expiresAt: Date; attempts: number; maxAttempts: number; isUsed: boolean; usedAt: Date; }
const schema = new Schema<IOtpRecord>({
  email: { type: String, required: true },
  otpHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  maxAttempts: { type: Number, default: 3 },
  isUsed: { type: Boolean, default: false },
  usedAt: { type: Date }
}, { timestamps: true });
schema.index({ email: 1 }); schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const OtpRecordModel = mongoose.model<IOtpRecord>('OtpRecord', schema);`;

files['src/models/Favorite.ts'] = `import mongoose, { Schema, Document } from 'mongoose';
export interface IFavorite extends Document { customer: mongoose.Types.ObjectId; property: mongoose.Types.ObjectId; }
const schema = new Schema<IFavorite>({
  customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  property: { type: Schema.Types.ObjectId, ref: 'Property', required: true }
}, { timestamps: true });
schema.index({ customer: 1, property: 1 }, { unique: true });
export const FavoriteModel = mongoose.model<IFavorite>('Favorite', schema);`;

files['src/models/Setting.ts'] = `import mongoose, { Schema, Document } from 'mongoose';
export interface ISetting extends Document { key: string; value: any; group: string; description: string; }
const schema = new Schema<ISetting>({
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed },
  group: { type: String },
  description: { type: String }
}, { timestamps: true });
export const SettingModel = mongoose.model<ISetting>('Setting', schema);`;

files['src/models/index.ts'] = \`
export * from './User';
export * from './Country';
export * from './Currency';
export * from './PropertyType';
export * from './ListingType';
export * from './TenureType';
export * from './PropertyStatus';
export * from './PropertyFeature';
export * from './Property';
export * from './Media';
export * from './PropertyDocument';
export * from './Customer';
export * from './Lead';
export * from './LeadSource';
export * from './LeadStage';
export * from './LeadActivity';
export * from './Task';
export * from './Viewing';
export * from './Offer';
export * from './Conversation';
export * from './Message';
export * from './MessageTemplate';
export * from './Campaign';
export * from './Notification';
export * from './AuditLog';
export * from './OtpRecord';
export * from './Favorite';
export * from './Setting';
\`;

for (const [relPath, content] of Object.entries(files)) {
  const fullPath = path.join(baseDir, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim());
}
console.log('Done creating files.');
