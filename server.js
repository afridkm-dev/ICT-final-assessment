/**
 * ExpenSync Express Server Entry Point
 * High-performance Node.js / Express backend with MongoDB Atlas
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDatabase = require('./config/db');
const expenseRoutes = require('./routes/expenseRoutes');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
connectDatabase();

// Standard middleware
app.use(cors({
  origin: '*', // Allow frontend development requests
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Root Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    appName: 'ExpenSync API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// RESTful Route Handlers
app.use('/api/expenses', expenseRoutes);

// Serve frontend static files in production if available
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

app.get('*', (req, res, next) => {
  // If requesting an API route that was not handled, return 404
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      message: `API route '${req.originalUrl}' not found.`,
    });
  }
  // Otherwise serve React index.html
  const indexPath = path.join(frontendDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      next();
    }
  });
});

// Centralized error handler
app.use(errorHandler);

// Start server listener
const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  ExpenSync Backend Server running on port ${PORT}`);
  console.log(`  REST API Base URL: http://localhost:${PORT}/api/expenses`);
  console.log(`  Health Status:     http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});

// Handle unhandled Promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
});

module.exports = app;
