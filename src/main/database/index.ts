/**
 * Database Service
 * Main entry point for database operations
 * Exports singleton database instance and all repositories
 */

import { initializeDatabase, getDatabase, closeDatabase, backupDatabase, getDatabaseStats } from './setup';
import { WorkspaceRepository } from './repositories/WorkspaceRepository';
import { TaskRepository } from './repositories/TaskRepository';
import { NoteRepository } from './repositories/NoteRepository';
import { ReminderRepository } from './repositories/ReminderRepository';
import { AlarmRepository } from './repositories/AlarmRepository';
import { PomodoroRepository } from './repositories/PomodoroRepository';
import { MetricsRepository } from './repositories/MetricsRepository';
import { AutomationLogRepository } from './repositories/AutomationLogRepository';
import { SettingsRepository } from './repositories/SettingsRepository';

// Repository instances
let workspaceRepo: WorkspaceRepository | null = null;
let taskRepo: TaskRepository | null = null;
let noteRepo: NoteRepository | null = null;
let reminderRepo: ReminderRepository | null = null;
let alarmRepo: AlarmRepository | null = null;
let pomodoroRepo: PomodoroRepository | null = null;
let metricsRepo: MetricsRepository | null = null;
let automationLogRepo: AutomationLogRepository | null = null;
let settingsRepo: SettingsRepository | null = null;

/**
 * Initialize database and all repositories
 */
export function initDatabase(): void {
  console.log('[Database Service] Initializing database...');
  
  const db = initializeDatabase();

  // Initialize all repositories
  workspaceRepo = new WorkspaceRepository(db);
  taskRepo = new TaskRepository(db);
  noteRepo = new NoteRepository(db);
  reminderRepo = new ReminderRepository(db);
  alarmRepo = new AlarmRepository(db);
  pomodoroRepo = new PomodoroRepository(db);
  metricsRepo = new MetricsRepository(db);
  automationLogRepo = new AutomationLogRepository(db);
  settingsRepo = new SettingsRepository(db);

  console.log('[Database Service] All repositories initialized');
}

/**
 * Get workspace repository
 */
export function getWorkspaceRepository(): WorkspaceRepository {
  if (!workspaceRepo) {
    initDatabase();
  }
  return workspaceRepo!;
}

/**
 * Get task repository
 */
export function getTaskRepository(): TaskRepository {
  if (!taskRepo) {
    initDatabase();
  }
  return taskRepo!;
}

/**
 * Get note repository
 */
export function getNoteRepository(): NoteRepository {
  if (!noteRepo) {
    initDatabase();
  }
  return noteRepo!;
}

/**
 * Get reminder repository
 */
export function getReminderRepository(): ReminderRepository {
  if (!reminderRepo) {
    initDatabase();
  }
  return reminderRepo!;
}

/**
 * Get alarm repository
 */
export function getAlarmRepository(): AlarmRepository {
  if (!alarmRepo) {
    initDatabase();
  }
  return alarmRepo!;
}

/**
 * Get pomodoro repository
 */
export function getPomodoroRepository(): PomodoroRepository {
  if (!pomodoroRepo) {
    initDatabase();
  }
  return pomodoroRepo!;
}

/**
 * Get metrics repository
 */
export function getMetricsRepository(): MetricsRepository {
  if (!metricsRepo) {
    initDatabase();
  }
  return metricsRepo!;
}

/**
 * Get automation log repository
 */
export function getAutomationLogRepository(): AutomationLogRepository {
  if (!automationLogRepo) {
    initDatabase();
  }
  return automationLogRepo!;
}

/**
 * Get settings repository
 */
export function getSettingsRepository(): SettingsRepository {
  if (!settingsRepo) {
    initDatabase();
  }
  return settingsRepo!;
}

/**
 * Close database connection and cleanup
 */
export function closeDb(): void {
  console.log('[Database Service] Closing database...');
  
  workspaceRepo = null;
  taskRepo = null;
  noteRepo = null;
  reminderRepo = null;
  alarmRepo = null;
  pomodoroRepo = null;
  metricsRepo = null;
  automationLogRepo = null;
  settingsRepo = null;

  closeDatabase();
  console.log('[Database Service] Database closed');
}

/**
 * Create a database backup
 */
export function createBackup(): string {
  console.log('[Database Service] Creating backup...');
  const backupPath = backupDatabase();
  console.log(`[Database Service] Backup created at: ${backupPath}`);
  return backupPath;
}

/**
 * Get database statistics
 */
export function getStats(): {
  path: string;
  size: number;
  tables: string[];
} {
  return getDatabaseStats();
}

/**
 * Export all repositories for direct access
 */
export const repositories = {
  get workspaces() {
    return getWorkspaceRepository();
  },
  get tasks() {
    return getTaskRepository();
  },
  get notes() {
    return getNoteRepository();
  },
  get reminders() {
    return getReminderRepository();
  },
  get alarms() {
    return getAlarmRepository();
  },
  get pomodoro() {
    return getPomodoroRepository();
  },
  get metrics() {
    return getMetricsRepository();
  },
  get automationLogs() {
    return getAutomationLogRepository();
  },
  get settings() {
    return getSettingsRepository();
  },
};

// Export types
export * from '../../shared/types/database';

// Export setup functions
export { getDatabase };

// Made with Bob
