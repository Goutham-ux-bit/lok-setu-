const bcrypt = require('bcryptjs');
const db = require('../config/db');

console.log('🌱 Seeding LOK SETU database...');

// 1. Create a demo user if not exists
const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get('citizen@loksetu.in');
let userId;

if (!existingUser) {
  const hash = bcrypt.hashSync('password123', 10);
  const userRes = db.prepare(
    'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)'
  ).run('Aarav Sharma', 'citizen@loksetu.in', hash);
  userId = userRes.lastInsertRowid;
  console.log('✓ Created demo user: citizen@loksetu.in (password: password123)');
} else {
  userId = existingUser.id;
}

// 2. Create demo guest user
const guestId = 'guest-demo-user-1234';
db.prepare('INSERT INTO guests (id, display_name) VALUES (?, ?) ON CONFLICT(id) DO NOTHING')
  .run(guestId, 'Rohit Verma');

// 3. Clear existing demo reports if you want or add sample reports
const count = db.prepare('SELECT COUNT(*) as count FROM reports').get().count;

if (count === 0) {
  const sampleReports = [
    {
      userId: userId,
      guestId: null,
      category: 'street_light',
      title: 'Broken streetlight on Sector 14 Main Road',
      description: 'The street light pole #42 has been non-functional for the past 4 nights. Road is pitch dark and unsafe for pedestrians.',
      location: 'Sector 14 Main Road, near Mother Dairy booth',
      status: 'in_progress',
      isPublic: 1
    },
    {
      userId: userId,
      guestId: null,
      category: 'road_damage',
      title: 'Severe pothole cluster after recent rains',
      description: 'Multiple deep potholes right at the roundabout junction causing vehicular slowdown and near-skid accidents for two-wheelers.',
      location: 'Nehru Chowk junction, MG Road',
      status: 'pending',
      isPublic: 1
    },
    {
      userId: null,
      guestId: guestId,
      category: 'water_supply',
      title: 'Contaminated yellow water in municipal pipeline',
      description: 'Since yesterday morning, tap water has foul odor and mud sediment. Over 30 households in Block C are affected.',
      location: 'Block C, Shiv Vihar',
      status: 'pending',
      isPublic: 1
    },
    {
      userId: userId,
      guestId: null,
      category: 'sewage',
      title: 'Overflowing sewage drain near Primary School',
      description: 'Sewage drain is choked with plastic and overflowing into the pedestrian walkway. Foul smell and health hazard.',
      location: 'Lane 3, Opposite Govt Primary School',
      status: 'resolved',
      isPublic: 1
    },
    {
      userId: null,
      guestId: guestId,
      category: 'electricity',
      title: 'Open transformer wire sparking near bus stand',
      description: 'A loose insulated cable dangling low from transformer. Sparks seen during evening wind.',
      location: 'Central Bus Terminal, Gate 2',
      status: 'resolved',
      isPublic: 1
    },
    {
      userId: userId,
      guestId: null,
      category: 'other',
      title: 'Uncollected community waste accumulating for a week',
      description: 'Garbage collection van has skipped this street since Monday. Stray animals are scattering waste everywhere.',
      location: 'Street 7, Shanti Nagar',
      status: 'in_progress',
      isPublic: 1
    }
  ];

  const insertStmt = db.prepare(`
    INSERT INTO reports (user_id, guest_id, category, title, description, location, status, is_public)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const r of sampleReports) {
    insertStmt.run(r.userId, r.guestId, r.category, r.title, r.description, r.location, r.status, r.isPublic);
  }
  console.log(`✓ Inserted ${sampleReports.length} sample reports!`);
} else {
  console.log(`ℹ Database already has ${count} reports.`);
}

console.log('✅ Seeding complete!');
