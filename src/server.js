import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { initDatabase } from './utils/db.js';
import wallpaperRouter from './routes/wallpaperRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

// Determine directory name in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database
initDatabase();

const app = express();
const PORT = process.env.PORT || 3000;
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// Security Headers & CORS
app.use(helmet({
  contentSecurityPolicy: false, // Disabled to allow loading external images easily in preview UI
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());

// HTTP request logger
app.use(morgan('dev'));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets & uploaded wallpapers
app.use(express.static('public'));

// Register REST API routes
app.use(`${API_PREFIX}/wallpapers`, wallpaperRouter);

// Handles undefined route requests
app.all('*', notFoundHandler);

// Centralized error handling
app.use(errorHandler);

// Launch server
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(` Anify Wallpaper API Server is active!`);
  console.log(` Port: ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(` API Endpoint: http://localhost:${PORT}${API_PREFIX}/wallpapers`);
  console.log(` Explorer Dashboard: http://localhost:${PORT}`);
  console.log(`===================================================`);
});
