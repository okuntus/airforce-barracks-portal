require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const supabase = require('./config/supabase');

const authRoutes = require('./routes/auth');
const alertRoutes = require('./routes/alerts');
const eventRoutes = require('./routes/events');
const announcementRoutes = require('./routes/announcements');
const statsRoutes = require('./routes/stats');
const userRoutes = require('./routes/users');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
  ],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { message: 'Too many requests, please try again after 15 minutes.' },
  skip: (req) => req.path === '/api/health'
});
app.use('/api/', limiter);

// Body parser
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/users', userRoutes);

// Health check — ping Supabase to verify connectivity
app.get('/api/health', async (req, res) => {
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    const connected = !error;
    res.status(connected ? 200 : 503).json({
      status: connected ? 'ok' : 'degraded',
      db: connected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch {
    res.status(503).json({ status: 'degraded', db: 'disconnected', timestamp: new Date().toISOString() });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  // Supabase/PostgREST duplicate key
  if (err?.code === '23505') {
    return res.status(409).json({ message: 'Resource already exists' });
  }
  // Supabase/PostgREST invalid UUID
  if (err?.code === '22P02') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  const status = err.status || 500;
  if (status === 500) console.error(err.stack || err);
  res.status(status).json({ message: status === 500 ? 'Internal server error' : err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
