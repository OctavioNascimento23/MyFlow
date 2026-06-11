/**
 * Database Setup and Schema Management
 * Initializes SQLite database with complete schema
 */

import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';

const DB_VERSION = 1;
const DB_NAME = 'myflow.db';

let db: Database.Database | null = null;

/**
 * Get the database file path in user data directory
 */
function getDatabasePath(): string {
  const userDataPath = app.getPath('userData');
  
  // Ensure the directory exists
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }
  
  return path.join(userDataPath, DB_NAME);
}

/**
 * Create all database tables according to schema
 */
function createTables(database: Database.Database): void {
  console.log('[Database] Creating tables...');

  // Workspaces/Automations table
  database.exec(`
    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT,
      enabled INTEGER DEFAULT 1,
      actions TEXT NOT NULL,
      trigger_on_startup INTEGER DEFAULT 0,
      trigger_hotkey TEXT,
      trigger_scheduled_time TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Tasks table
  database.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT NOT NULL,
      deadline TEXT,
      estimated_minutes INTEGER,
      tags TEXT,
      subtasks TEXT,
      completed INTEGER DEFAULT 0,
      completed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Notes table
  database.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT,
      tags TEXT,
      pinned INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Reminders table
  database.exec(`
    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      enabled INTEGER DEFAULT 1,
      time TEXT,
      interval_minutes INTEGER,
      recurrence TEXT,
      working_hours_only INTEGER DEFAULT 0,
      sound TEXT,
      last_triggered_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Alarms table
  database.exec(`
    CREATE TABLE IF NOT EXISTS alarms (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      time TEXT NOT NULL,
      enabled INTEGER DEFAULT 1,
      recurring_days TEXT,
      sound TEXT,
      snooze_minutes INTEGER DEFAULT 5,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Pomodoro Sessions table
  database.exec(`
    CREATE TABLE IF NOT EXISTS pomodoro_sessions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      completed INTEGER DEFAULT 0,
      started_at TEXT NOT NULL,
      ended_at TEXT
    );
  `);

  // Daily Metrics table
  database.exec(`
    CREATE TABLE IF NOT EXISTS daily_metrics (
      date TEXT PRIMARY KEY,
      work_minutes INTEGER DEFAULT 0,
      pomodoros_completed INTEGER DEFAULT 0,
      tasks_completed INTEGER DEFAULT 0,
      tasks_created INTEGER DEFAULT 0,
      focus_score REAL DEFAULT 0.0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Automation Logs table
  database.exec(`
    CREATE TABLE IF NOT EXISTS automation_logs (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      status TEXT NOT NULL,
      error_message TEXT,
      executed_at TEXT NOT NULL,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
    );
  `);

  // Settings table
  database.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  console.log('[Database] Tables created successfully');
}

/**
 * Create indexes for performance optimization
 */
function createIndexes(database: Database.Database): void {
  console.log('[Database] Creating indexes...');

  // Task indexes
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
    CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
    CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);
  `);

  // Note indexes
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_notes_pinned ON notes(pinned);
    CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category);
  `);

  // Reminder indexes
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_reminders_enabled ON reminders(enabled);
    CREATE INDEX IF NOT EXISTS idx_reminders_type ON reminders(type);
  `);

  // Alarm indexes
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_alarms_enabled ON alarms(enabled);
  `);

  // Pomodoro indexes
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_pomodoro_started ON pomodoro_sessions(started_at);
    CREATE INDEX IF NOT EXISTS idx_pomodoro_completed ON pomodoro_sessions(completed);
  `);

  // Metrics indexes
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_metrics_date ON daily_metrics(date);
  `);

  // Automation log indexes
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_logs_workspace ON automation_logs(workspace_id);
    CREATE INDEX IF NOT EXISTS idx_logs_executed ON automation_logs(executed_at);
  `);

  console.log('[Database] Indexes created successfully');
}

/**
 * Create full-text search virtual table for notes
 */
function createFullTextSearch(database: Database.Database): void {
  console.log('[Database] Creating full-text search...');

  try {
    // Check if FTS table already exists
    const tableExists = database
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='notes_fts'")
      .get();

    if (!tableExists) {
      database.exec(`
        CREATE VIRTUAL TABLE notes_fts USING fts5(
          title,
          content,
          content=notes,
          content_rowid=rowid
        );
      `);

      // Create triggers to keep FTS table in sync
      database.exec(`
        CREATE TRIGGER IF NOT EXISTS notes_fts_insert AFTER INSERT ON notes BEGIN
          INSERT INTO notes_fts(rowid, title, content)
          VALUES (new.rowid, new.title, new.content);
        END;
      `);

      database.exec(`
        CREATE TRIGGER IF NOT EXISTS notes_fts_delete AFTER DELETE ON notes BEGIN
          DELETE FROM notes_fts WHERE rowid = old.rowid;
        END;
      `);

      database.exec(`
        CREATE TRIGGER IF NOT EXISTS notes_fts_update AFTER UPDATE ON notes BEGIN
          DELETE FROM notes_fts WHERE rowid = old.rowid;
          INSERT INTO notes_fts(rowid, title, content)
          VALUES (new.rowid, new.title, new.content);
        END;
      `);

      console.log('[Database] Full-text search created successfully');
    } else {
      console.log('[Database] Full-text search already exists');
    }
  } catch (error) {
    console.error('[Database] Error creating full-text search:', error);
    // Non-critical error, continue without FTS
  }
}

/**
 * Initialize database version tracking
 */
function initializeVersioning(database: Database.Database): void {
  // Create version table if it doesn't exist
  database.exec(`
    CREATE TABLE IF NOT EXISTS db_version (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);

  // Check current version
  const currentVersion = database
    .prepare('SELECT version FROM db_version ORDER BY version DESC LIMIT 1')
    .get() as { version: number } | undefined;

  if (!currentVersion) {
    // First time setup
    database
      .prepare('INSERT INTO db_version (version, applied_at) VALUES (?, ?)')
      .run(DB_VERSION, new Date().toISOString());
    console.log(`[Database] Initialized at version ${DB_VERSION}`);
  } else if (currentVersion.version < DB_VERSION) {
    // Run migrations
    runMigrations(database, currentVersion.version, DB_VERSION);
  }
}

/**
 * Run database migrations
 */
function runMigrations(
  database: Database.Database,
  fromVersion: number,
  toVersion: number
): void {
  console.log(`[Database] Running migrations from v${fromVersion} to v${toVersion}`);

  // Future migrations will be added here
  // Example:
  // if (fromVersion < 2) {
  //   database.exec('ALTER TABLE tasks ADD COLUMN new_field TEXT');
  //   database.prepare('INSERT INTO db_version (version, applied_at) VALUES (?, ?)')
  //     .run(2, new Date().toISOString());
  // }

  console.log('[Database] Migrations completed');
}

/**
 * Insert default settings
 */
function insertDefaultSettings(database: Database.Database): void {
  const settingsCount = database
    .prepare('SELECT COUNT(*) as count FROM settings')
    .get() as { count: number };

  if (settingsCount.count === 0) {
    console.log('[Database] Inserting default settings...');

    const now = new Date().toISOString();
    const defaultSettings = {
      theme: 'auto',
      accentColor: '#3b82f6',
      fontSize: 'medium',
      startWithWindows: false,
      startMinimized: false,
      minimizeToTray: true,
      clockFormat: '24h',
      showSeconds: true,
      timezones: JSON.stringify(['America/Sao_Paulo']),
      language: 'en',
      'pomodoro.focusMinutes': '25',
      'pomodoro.shortBreakMinutes': '5',
      'pomodoro.longBreakMinutes': '15',
      'pomodoro.longBreakAfter': '4',
      'pomodoro.dailyGoal': '8',
      'pomodoro.autoStartBreaks': 'false',
      'pomodoro.autoStartFocus': 'false',
      'pomodoro.sound': 'default',
      'pomodoro.volume': '0.5',
      'reminders.enabled': 'true',
      'reminders.workingHours.start': '09:00',
      'reminders.workingHours.end': '18:00',
      'reminders.workingDays': JSON.stringify([1, 2, 3, 4, 5]),
      'reminders.sound': 'default',
      'reminders.volume': '0.5',
      'automations.defaultDelay': '1000',
      'automations.showExecutionLogs': 'true',
      'automations.confirmBeforeExecute': 'false',
      'dashboard.dailyWorkGoalMinutes': '480',
      'dashboard.defaultPeriod': 'week',
      'dashboard.visibleMetrics': JSON.stringify(['work_minutes', 'pomodoros', 'tasks']),
      'tasks.defaultSort': 'priority',
      'tasks.showCompleted': 'true',
      'tasks.autoArchiveAfterDays': '30',
    };

    const insertStmt = database.prepare(
      'INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)'
    );

    const insertMany = database.transaction((settings: Record<string, string>) => {
      for (const [key, value] of Object.entries(settings)) {
        insertStmt.run(key, value, now);
      }
    });

    insertMany(defaultSettings);
    console.log('[Database] Default settings inserted');
  }
}

/**
 * Initialize the database
 */
export function initializeDatabase(): Database.Database {
  if (db) {
    return db;
  }

  try {
    const dbPath = getDatabasePath();
    console.log(`[Database] Initializing database at: ${dbPath}`);

    // Create database connection
    db = new Database(dbPath, {
      verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
    });

    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    // Set journal mode to WAL for better concurrency
    db.pragma('journal_mode = WAL');

    // Create tables
    createTables(db);

    // Create indexes
    createIndexes(db);

    // Create full-text search
    createFullTextSearch(db);

    // Initialize versioning
    initializeVersioning(db);

    // Insert default settings
    insertDefaultSettings(db);

    console.log('[Database] Database initialized successfully');

    return db;
  } catch (error) {
    console.error('[Database] Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Get the database instance
 */
export function getDatabase(): Database.Database {
  if (!db) {
    return initializeDatabase();
  }
  return db;
}

/**
 * Close the database connection
 */
export function closeDatabase(): void {
  if (db) {
    console.log('[Database] Closing database connection');
    db.close();
    db = null;
  }
}

/**
 * Create a database backup
 */
export function backupDatabase(): string {
  const database = getDatabase();
  const backupPath = path.join(
    app.getPath('userData'),
    `myflow_backup_${Date.now()}.db`
  );

  database.backup(backupPath);
  console.log(`[Database] Backup created at: ${backupPath}`);

  return backupPath;
}

/**
 * Get database statistics
 */
export function getDatabaseStats(): {
  path: string;
  size: number;
  tables: string[];
} {
  const database = getDatabase();
  const dbPath = getDatabasePath();
  const stats = fs.statSync(dbPath);

  const tables = database
    .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    .all() as { name: string }[];

  return {
    path: dbPath,
    size: stats.size,
    tables: tables.map((t) => t.name),
  };
}

// Made with Bob
