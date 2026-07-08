import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import examRoutes from './routes/examRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

// Connect to MongoDB Database
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup ESM paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Host uploads folder statically for diagrams
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', examRoutes);
app.use('/api', adminRoutes);

// Base Check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Fallback OCR route placeholders (to be populated in Phase 4)
app.use('/api/ocr', (req, res, next) => {
  // Pass to real OCR router once generated, or return placeholder
  try {
    import('./routes/ocrRoutes.js').then((module) => {
      module.default(req, res, next);
    }).catch(() => {
      res.status(501).json({ message: 'OCR Engine routes not initialized yet' });
    });
  } catch (error) {
    res.status(501).json({ message: 'OCR Engine routes not initialized yet' });
  }
});

// Global Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`ExamForge AI server running on port ${PORT}`);
});
