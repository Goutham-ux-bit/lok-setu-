const db = require('../config/db');

const CATEGORIES = ['street_light', 'road_damage', 'water_supply', 'sewage', 'electricity', 'other'];

function serializeReport(row) {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    description: row.description,
    location: row.location,
    imageUrl: row.image_path ? `/uploads/${row.image_path}` : null,
    status: row.status,
    isPublic: !!row.is_public,
    reportedBy: row.user_id ? (row.reporter_name || 'Registered user') : 'Guest User',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function computeStats(rows) {
  const stats = { total: rows.length, pending: 0, in_progress: 0, resolved: 0 };
  for (const r of rows) stats[r.status] = (stats[r.status] || 0) + 1;
  return {
    total: stats.total,
    pending: stats.pending,
    inProgress: stats.in_progress,
    resolved: stats.resolved
  };
}

exports.create = (req, res) => {
  const { category, title, description, location, isPublic } = req.body;

  if (!category || !CATEGORIES.includes(category)) {
    return res.status(400).json({ error: `Category must be one of: ${CATEGORIES.join(', ')}` });
  }
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'A short title describing the issue is required.' });
  }

  const imagePath = req.file ? req.file.filename : null;
  const userId = req.user ? req.user.id : null;
  const guestId = req.user ? null : req.guestId || null;
  const publicFlag = isPublic === 'false' || isPublic === false ? 0 : 1;

  const result = db.prepare(
    `INSERT INTO reports (user_id, guest_id, category, title, description, location, image_path, is_public)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(userId, guestId, category, title.trim(), description || null, location || null, imagePath, publicFlag);

  const row = db.prepare('SELECT * FROM reports WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ report: serializeReport(row) });
};

exports.listMine = (req, res) => {
  let rows;
  if (req.user) {
    rows = db.prepare(
      `SELECT r.*, u.name AS reporter_name FROM reports r
       LEFT JOIN users u ON u.id = r.user_id
       WHERE r.user_id = ? ORDER BY r.created_at DESC`
    ).all(req.user.id);
  } else if (req.guestId) {
    rows = db.prepare(
      `SELECT * FROM reports WHERE guest_id = ? ORDER BY created_at DESC`
    ).all(req.guestId);
  } else {
    return res.status(400).json({ error: 'Log in or send an x-guest-id header to view your reports.' });
  }

  res.json({
    stats: computeStats(rows),
    reports: rows.slice(0, 20).map(serializeReport)
  });
};

exports.listPublic = (req, res) => {
  const { category, status } = req.query;
  let sql = `SELECT r.*, u.name AS reporter_name FROM reports r
             LEFT JOIN users u ON u.id = r.user_id
             WHERE r.is_public = 1`;
  const params = [];

  if (category && CATEGORIES.includes(category)) {
    sql += ' AND r.category = ?';
    params.push(category);
  }
  if (status && ['pending', 'in_progress', 'resolved'].includes(status)) {
    sql += ' AND r.status = ?';
    params.push(status);
  }
  sql += ' ORDER BY r.created_at DESC';

  const rows = db.prepare(sql).all(...params);
  res.json({
    stats: computeStats(rows),
    reports: rows.map(serializeReport)
  });
};

exports.getOne = (req, res) => {
  const row = db.prepare(
    `SELECT r.*, u.name AS reporter_name FROM reports r
     LEFT JOIN users u ON u.id = r.user_id WHERE r.id = ?`
  ).get(req.params.id);

  if (!row) return res.status(404).json({ error: 'Report not found.' });

  const owns = (req.user && req.user.id === row.user_id) || (req.guestId && req.guestId === row.guest_id);
  if (!row.is_public && !owns) return res.status(403).json({ error: 'This report is private.' });

  res.json({ report: serializeReport(row) });
};

exports.listAll = (req, res) => {
  const { category, status } = req.query;
  let sql = `SELECT r.*, u.name AS reporter_name FROM reports r
             LEFT JOIN users u ON u.id = r.user_id WHERE 1 = 1`;
  const params = [];

  if (category && CATEGORIES.includes(category)) {
    sql += ' AND r.category = ?';
    params.push(category);
  }
  if (status && ['pending', 'in_progress', 'resolved'].includes(status)) {
    sql += ' AND r.status = ?';
    params.push(status);
  }
  sql += ' ORDER BY r.created_at DESC';

  const rows = db.prepare(sql).all(...params);
  res.json({
    stats: computeStats(rows),
    reports: rows.map(serializeReport)
  });
};

exports.updateStatus = (req, res) => {
  const { status } = req.body;
  if (!['pending', 'in_progress', 'resolved'].includes(status)) {
    return res.status(400).json({ error: 'Status must be pending, in_progress or resolved.' });
  }

  const result = db.prepare(
    `UPDATE reports SET status = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(status, req.params.id);

  if (result.changes === 0) return res.status(404).json({ error: 'Report not found.' });

  const row = db.prepare('SELECT * FROM reports WHERE id = ?').get(req.params.id);
  res.json({ report: serializeReport(row) });
};

exports.categories = (req, res) => {
  res.json({
    categories: [
      { id: 'street_light', label: 'Street Light', icon: '💡' },
      { id: 'road_damage', label: 'Road Damage', icon: '🚧' },
      { id: 'water_supply', label: 'Water Supply', icon: '💧' },
      { id: 'sewage', label: 'Sewage', icon: '🚰' },
      { id: 'electricity', label: 'Electricity', icon: '⚡' },
      { id: 'other', label: 'Other', icon: '❓' }
    ]
  });
};
