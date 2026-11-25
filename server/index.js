require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb, isFallback } = require('./config/db');

const usersRoute = require('./routes/users');
const templatesRoute = require('./routes/templates');
const dataRoute = require('./routes/data');
const statsRoute = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 5001;

// CORS setup - permit all frontend origins for educational Fetch API practice
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Educational Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Root Health & API Info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Educational API Generator Backend',
    database: isFallback() ? 'local_fallback_store' : 'connected_postgresql',
    time: new Date().toISOString()
  });
});

// REST API Endpoints
app.use('/api/users', usersRoute);
app.use('/api/templates', templatesRoute);
app.use('/api/data', dataRoute);
app.use('/api/stats', statsRoute);

// Serve frontend build if present (for single Railway service deployments)
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ success: false, message: `Endpoint ${req.originalUrl} not found` });
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, err => {
    if (err) next();
  });
});

// Start Server and initialize DB if run directly
async function startServer() {
  await initDb();
  return app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 API Generator Backend running on http://0.0.0.0:${PORT}`);
    console.log(`📚 API Docs & Endpoints:`);
    console.log(`   - Users API:   http://localhost:${PORT}/api/users`);
    console.log(`   - Dynamic API: http://localhost:${PORT}/api/data`);
    console.log(`   - Templates:   http://localhost:${PORT}/api/templates`);
    console.log(`   - Stats:       http://localhost:${PORT}/api/stats`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = app;

