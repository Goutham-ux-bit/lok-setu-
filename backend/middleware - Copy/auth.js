const jwt = require('jsonwebtoken');
const db = require('../config/db');

/**
 * Reads a "Bearer <token>" Authorization header if present and, when valid,
 * attaches the matching user row to req.user. Also reads the "x-guest-id"
 * header so anonymous reporting works. Never blocks the request - routes
 * decide for themselves whether a user or guest id is required.
 */
function identify(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(payload.id);
      if (user) req.user = user;
    } catch (err) {
      // Invalid/expired token - treat the request as unauthenticated rather than failing it.
    }
  }

  const guestId = req.headers['x-guest-id'];
  if (guestId && typeof guestId === 'string') {
    req.guestId = guestId;
    // Upsert a lightweight guest record so reports can reference it.
    db.prepare(
      `INSERT INTO guests (id) VALUES (?)
       ON CONFLICT(id) DO NOTHING`
    ).run(guestId);
  }

  next();
}

/** Requires either a logged-in user or a guest id - used by report creation. */
function requireIdentity(req, res, next) {
  if (!req.user && !req.guestId) {
    return res.status(400).json({
      error: 'Missing identity. Send an Authorization bearer token or an x-guest-id header.'
    });
  }
  next();
}

/** Requires a logged-in user - used by account-only routes. */
function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Please log in to continue.' });
  next();
}

/** Requires the shared admin key - used by the status-update endpoint. */
function requireAdmin(req, res, next) {
  const key = req.headers['x-admin-key'];
  if (!key || key !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: 'Invalid or missing admin key.' });
  }
  next();
}

module.exports = { identify, requireIdentity, requireAuth, requireAdmin };
