import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import notesRoutes from './routes/notes.js';
import userRoutes from './routes/users.js';
import chatRoutes from './routes/chatRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import smartFeaturesRoutes from './routes/smartFeaturesRoutes.js';
import socialRoutes from './routes/socialRoutes.js';
import notificationsEnhancedRoutes from './routes/notificationsEnhancedRoutes.js';
import quickWinsRoutes from './routes/quickWinsRoutes.js';
import studyScheduleRoutes from './routes/studyScheduleRoutes.js';
import collaborationRoutes from './routes/collaborationRoutes.js';
import inactivityRoutes from './routes/inactivityRoutes.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { authenticateToken } from './middleware/auth.js';
import { startKeepAlive } from './config/keepAlive.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: '*',
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint (root & /api prefix)
const healthHandler = (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'College Notes Exchange API',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
};
app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/smart', smartFeaturesRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/notifications-enhanced', notificationsEnhancedRoutes);
app.use('/api/quick-wins', quickWinsRoutes);
app.use('/api/study-schedule', studyScheduleRoutes);
app.use('/api/collaboration', collaborationRoutes);
app.use('/api/inactivity', inactivityRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested route ${req.method} ${req.originalUrl} does not exist.`,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 College Notes Exchange API ready!`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health or /api/health`);
  // Start cloud keep-alive timer for Render / deployment uptime
  startKeepAlive(PORT);
});

export default app;