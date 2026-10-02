import express from 'express';
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
import {
  healthRouter,
  authRouter,
  staffRouter,
  auditRouter,
  notificationRouter,
  adminConfigRouter,
  propertyRouter,
  mediaRouter,
  documentRouter,
  publicRouter,
  customerRouter,
  leadRouter,
  telecallerRouter,
  viewingRouter,
  offerRouter,
  whatsappRouter,
  webhookRouter,
  analyticsRouter,
  aiRouter,
} from './routes';
import { authService } from './services/auth.service';
import { initializeSocket } from './config/socket';
import { initializeQueues, closeAllQueues } from './config/queue';

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
app.use('/api/v1/admin', adminConfigRouter);
app.use('/api/v1/properties', propertyRouter);
app.use('/api/v1/media', mediaRouter);
app.use('/api/v1/documents', documentRouter);
app.use('/api/v1/staff', staffRouter);
app.use('/api/v1/audit', auditRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/public', publicRouter);
app.use('/api/v1/customer', customerRouter);
app.use('/api/v1/leads', leadRouter);
app.use('/api/v1/telecaller', telecallerRouter);
app.use('/api/v1/viewings', viewingRouter);
app.use('/api/v1/offers', offerRouter);
app.use('/api/v1/whatsapp', whatsappRouter);
app.use('/api/v1/webhooks', webhookRouter);
app.use('/api/v1/analytics', analyticsRouter);
app.use('/api/v1/ai', aiRouter);

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
    await authService.bootstrapAdmin();
    await connectRedis();

    const server = app.listen(config.port, () => {
      logger.info(`🚀 API server running on port ${config.port} in ${config.env} mode`);
      logger.info(`Health check available at http://localhost:${config.port}/api/v1/health`);
    });

    // Real-time socket & BullMQ queues
    initializeSocket(server);
    initializeQueues();

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      await closeAllQueues();
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });

      // Force close if it takes too long
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
};

start();

export default app;
