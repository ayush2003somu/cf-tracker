import express from 'express';
import cors from 'cors';
import profileRoutes from './routes/profileRoutes.js';
import healthRoutes from './routes/healthRoutes.js';

const app = express();

// Middlewares
// CORS allows our upcoming React frontend (on any port) to call the backend
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Body parser
app.use(express.json());

// Mount API routes
app.use('/health', healthRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/profile', profileRoutes);

// Catch-all 404 handler for undefined endpoints
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint ${req.method} ${req.originalUrl} not found on this server.`
  });
});

// Centralized Global Error Handler
app.use((err, req, res, next) => {
  console.error('[GlobalError]', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

export default app;
