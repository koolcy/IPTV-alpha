-- IPTV-alpha v3.0-beta.1 database schema

CREATE TABLE IF NOT EXISTS sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    update_time INTEGER
);

CREATE TABLE IF NOT EXISTS channels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    group_name TEXT,
    url TEXT NOT NULL,
    logo TEXT,
    source TEXT,
    status TEXT DEFAULT 'active',
    latency INTEGER DEFAULT 0,
    last_check INTEGER DEFAULT 0,
    check_status TEXT DEFAULT 'unknown'
);

CREATE INDEX IF NOT EXISTS idx_channels_name ON channels(name);
CREATE INDEX IF NOT EXISTS idx_channels_group ON channels(group_name);
CREATE INDEX IF NOT EXISTS idx_channels_status ON channels(status);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    token TEXT UNIQUE,
    expire INTEGER,
    status TEXT DEFAULT 'active',
    plan_id INTEGER,
    created_at INTEGER
);

CREATE TABLE IF NOT EXISTS plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    channels_limit INTEGER DEFAULT 0,
    daily_limit INTEGER DEFAULT 0,
    epg_enable INTEGER DEFAULT 1,
    created_at INTEGER
);

CREATE TABLE IF NOT EXISTS programs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_time INTEGER NOT NULL,
    end_time INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_programs_channel_time ON programs(channel_id, start_time);

CREATE TABLE IF NOT EXISTS access_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    ip TEXT,
    api TEXT,
    time INTEGER
);

CREATE TABLE IF NOT EXISTS operation_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user TEXT,
    action TEXT,
    ip TEXT,
    time INTEGER
);

CREATE TABLE IF NOT EXISTS api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    key TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'active',
    created_at INTEGER
);
