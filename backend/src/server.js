require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

const connectDB = require('./config/database');
const logger = require('./utils/logger');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { initCronJobs } = require('./jobs/cronJobs');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const activityRoutes = require('./routes/activityRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const sleepRoutes = require('./routes/sleepRoutes');
const waterRoutes = require('./routes/waterRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const studyRoutes = require('./routes/studyRoutes');
const weightRoutes = require('./routes/weightRoutes');
const mealRoutes = require('./routes/mealRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const aiCoachRoutes = require('./routes/aiCoachRoutes');

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// CORS
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:19006',
    'http://localhost:8081',
    'exp://localhost:8081',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
  }));
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0',
    app: 'LifeOS API',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/sleep', sleepRoutes);
app.use('/api/water', waterRoutes);
app.use('/api/workout', workoutRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/weight', weightRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai-coach', aiCoachRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      logger.info(`
╔════════════════════════════════════╗
║      LifeOS API Server             ║
║      Port: ${PORT}                    ║
║      Env: ${process.env.NODE_ENV || 'development'}             ║
╚════════════════════════════════════╝
      `);
    });

    // Start cron jobs
    if (process.env.NODE_ENV !== 'test') {
      initCronJobs();
    }

  } catch (error) {
    logger.error(`Server startup failed: ${error.message}`);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

startServer();

module.exports = app;
