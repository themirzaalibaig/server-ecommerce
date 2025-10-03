import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
dotenv.config();
// Load environment variables
import { logger } from './utils/logger';
import { rateLimitConfig } from './middleware';
import { connectDB } from './config/database';
import { authRoutes, categoryRoutes, imageRoutes, productRoutes } from './routes';

const app: Application = express();
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const API_VERSION = process.env.API_VERSION || 'v1';
const API_PREFIX = `/api/${API_VERSION}`;
const PROJECT_NAME = process.env.PROJECT_NAME || 'E-commerce Backend';

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimitConfig.general);

// Routes
app.use(API_PREFIX, authRoutes);
app.use(`${API_PREFIX}/image`, imageRoutes);
app.use(`${API_PREFIX}/categories`, categoryRoutes);
app.use(`${API_PREFIX}/products`, productRoutes);
// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: `${PROJECT_NAME} is running`,
    version: API_VERSION,
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, async () => {
  await connectDB();
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`API Version: ${API_VERSION}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
});
//
