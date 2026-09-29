-- LOK SETU database schema (SQLite)

CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- guests: lets a person report issues before creating an account.
-- The frontend generates a guest_id (UUID) and stores it in localStorage.
CREATE TABLE IF NOT EXISTS guests (
    id            TEXT PRIMARY KEY,
    display_name  TEXT NOT NULL DEFAULT 'Guest User',
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reports (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id      INTEGER REFERENCES users(id) ON DELETE SET NULL,
    guest_id     TEXT REFERENCES guests(id) ON DELETE SET NULL,
    category     TEXT NOT NULL CHECK (category IN (
                    'street_light', 'road_damage', 'water_supply',
                    'sewage', 'electricity', 'other'
                 )),
    title        TEXT NOT NULL,
    description  TEXT,
    location     TEXT,
    image_path   TEXT,
    status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
                    'pending', 'in_progress', 'resolved'
                 )),
    is_public    INTEGER NOT NULL DEFAULT 1,
    created_at   TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at   TEXT NOT NULL DEFAULT (datetime('now')),
    CHECK ( (user_id IS NOT NULL) OR (guest_id IS NOT NULL) )
);

CREATE INDEX IF NOT EXISTS idx_reports_user_id  ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_guest_id ON reports(guest_id);
CREATE INDEX IF NOT EXISTS idx_reports_status    ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_category  ON reports(category);
