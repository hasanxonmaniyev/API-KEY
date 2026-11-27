require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb, isFallback } = require('./config/db');

const usersRoute = require('./routes/users');
const templatesRoute = require('./routes/templates');
const dataRoute = require('./routes/data');
const statsRoute = require('./routes/stats');
const collectionsRoute = require('./routes/collections');

const app = express();
const PORT = process.env.PORT || 5001;

// Format JSON responses with 2 spaces indentation for clean readability in browsers
app.set('json spaces', 2);

// CORS setup - permit all frontend origins for educational Fetch API practice
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.options('*', cors());

// Increase limit to 25mb for image uploads & rich data
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Educational Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Image Upload Directory & Static Serving
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!require('fs').existsSync(uploadsDir)) {
  require('fs').mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Image Upload Endpoint (accepts base64 or returns hosted image URL)
app.post('/api/upload', (req, res) => {
  try {
    const { image, filename = 'image.png' } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, message: 'No image data provided' });
    }

    // Extract base64
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer;
    let ext = 'png';

    if (matches && matches.length === 3) {
      const mime = matches[1];
      if (mime.includes('jpeg') || mime.includes('jpg')) ext = 'jpg';
      else if (mime.includes('gif')) ext = 'gif';
      else if (mime.includes('webp')) ext = 'webp';
      else if (mime.includes('svg')) ext = 'svg';
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(image, 'base64');
    }

    const uniqueName = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = path.join(uploadsDir, uniqueName);
    require('fs').writeFileSync(filePath, buffer);

    const host = req.get('host');
    const protocol = req.protocol;
    const imageUrl = `${protocol}://${host}/uploads/${uniqueName}`;

    return res.status(201).json({
      success: true,
      url: `/uploads/${uniqueName}`,
      fullUrl: imageUrl,
      filename: uniqueName
    });
  } catch (err) {
    console.error('Image upload error:', err);
    return res.status(500).json({ success: false, message: 'Image upload failed', error: err.message });
  }
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
app.use('/api/collections', collectionsRoute);

// Unknown API routes (any method) -> JSON 404 instead of Express' HTML page
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: `Endpoint ${req.method} ${req.originalUrl} not found` });
});

// Serve frontend build if present (for single Railway service deployments)
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
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

