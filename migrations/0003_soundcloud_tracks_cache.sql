CREATE TABLE soundcloud_tracks_cache (
  soundcloud_user TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
