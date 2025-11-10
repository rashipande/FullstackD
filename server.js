require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// optional DB connect (only if MONGO_URI set)
if (process.env.MONGO_URI) {
  try {
    const db = require('./config/db');
    db.connect(process.env.MONGO_URI).catch(err => console.error('DB connect error:', err));
  } catch (err) {
    console.error('DB module load failed:', err);
  }
} else {
  console.log('MONGO_URI not set — skipping MongoDB connect (use USE_MOCK=true for mock auth)');
}

// helper to normalize CommonJS / ESM interop
function normalizeRouter(mod) {
  if (!mod) return null;
  // prefer exported router directly
  if (typeof mod === 'function') return mod;
  // commonjs: module.exports = router => object is function-like handled above
  // ESM transpiled to { default: router }
  if (mod.default) return mod.default;
  // sometimes modules export { router } or other shapes
  if (mod.router) return mod.router;
  return null;
}

// choose routes (mock or real) and normalize
let routeModulePath = './routes/authRoutes';
if (process.env.USE_MOCK === 'true') {
  routeModulePath = './routes/authRoutesMock';
  console.log('Using mock auth routes (routes/authRoutesMock)');
}

let authRoutes;
try {
  const loaded = require(routeModulePath);
  authRoutes = normalizeRouter(loaded);
  if (!authRoutes) {
    console.error(`Loaded ${routeModulePath} but could not find a router export. Falling back to ./routes/authRoutes`);
    const fallback = require('./routes/authRoutes');
    authRoutes = normalizeRouter(fallback);
  }
} catch (err) {
  console.error('Error loading auth routes:', err);
  try {
    const fallback = require('./routes/authRoutes');
    authRoutes = normalizeRouter(fallback);
  } catch (e) {
    console.error('Failed to load fallback routes:', e);
  }
}

if (!authRoutes) {
  console.error('No usable auth routes found. /api/auth will not be available.');
} else {
  app.use('/api/auth', authRoutes);
}

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));