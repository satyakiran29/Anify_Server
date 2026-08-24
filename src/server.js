import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { initDatabase } from './utils/db.js';
import { initLiveDatabase } from './utils/liveDb.js';
import { initRingtoneDatabase } from './utils/ringtoneDb.js';
import { initKwgtDatabase } from './utils/kwgtDb.js';
import { initStickerDatabase } from './utils/stickerDb.js';
import { initBannerDatabase } from './utils/bannerDb.js';
import { initRelayServer, getRelayStats } from './utils/relayServer.js';

import wallpaperRouter from './routes/wallpaperRoutes.js';
import livewallRouter from './routes/livewallRoutes.js';
import ringtoneRouter from './routes/ringtoneRoutes.js';
import kwgtRouter from './routes/kwgtRoutes.js';
import stickerRouter from './routes/stickerRoutes.js';
import bannerRouter from './routes/bannerRoutes.js';
import relayRouter from './routes/relayRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

// Determine directory name in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize databases
initDatabase();
initLiveDatabase();
initRingtoneDatabase();
initKwgtDatabase();
initStickerDatabase();
initBannerDatabase();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// Security Headers & CORS
app.use(helmet({
  contentSecurityPolicy: false,
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

// Top-level Health Check (used by Render & uptime monitors)
app.get('/health', (req, res) => {
  const relayStats = getRelayStats();
  res.status(200).json({
    status: 'online',
    service: 'Anify Unified API & Cloud Relay',
    uptimeSeconds: Math.floor(process.uptime()),
    relay: relayStats,
    timestamp: new Date().toISOString()
  });
});

// Register REST API routes
app.use(`${API_PREFIX}/wallpapers`, wallpaperRouter);
app.use(`${API_PREFIX}/livewalls`, livewallRouter);
app.use(`${API_PREFIX}/ringtones`, ringtoneRouter);
app.use(`${API_PREFIX}/kwgts`, kwgtRouter);
app.use(`${API_PREFIX}/stickers`, stickerRouter);
app.use(`${API_PREFIX}/banners`, bannerRouter);
app.use(`${API_PREFIX}/relay`, relayRouter);

// Initialize WebSocket Cloud Relay Server on the same HTTP server
initRelayServer(server);

// Handles undefined route requests
app.all('*', notFoundHandler);

// Centralized error handling
app.use(errorHandler);

// Launch unified HTTP and WebSocket server
server.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(` ✨ Anify Server & Cloud Relay is active!`);
  console.log(` Port: ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(` API Endpoint: http://localhost:${PORT}${API_PREFIX}/wallpapers`);
  console.log(` Banners API: http://localhost:${PORT}${API_PREFIX}/banners`);
  console.log(` Stickers API: http://localhost:${PORT}${API_PREFIX}/stickers`);
  console.log(` Relay Stats: http://localhost:${PORT}${API_PREFIX}/relay/stats`);
  console.log(` WebSocket Relay: ws://localhost:${PORT}/ws?room=<ROOM_CODE>`);
  console.log(` Explorer Dashboard: http://localhost:${PORT}`);
  console.log(`===================================================`);

  // Self-ping to prevent Render spin-down
  const RENDER_EXTERNAL_URL = process.env.RENDER_EXTERNAL_URL;
  if (RENDER_EXTERNAL_URL) {
    const pingUrl = `${RENDER_EXTERNAL_URL.replace(/\/$/, '')}${API_PREFIX}/wallpapers/stats`;
    const pingInterval = 10 * 60 * 1000;

    console.log(`[Keep-Alive] Self-ping active. Target: ${pingUrl}`);

    setInterval(async () => {
      try {
        const response = await fetch(pingUrl);
        console.log(`[Keep-Alive] Self-ping status: ${response.status}`);
      } catch (error) {
        console.error(`[Keep-Alive] Self-ping failed:`, error.message);
      }
    }, pingInterval);
  }
});
