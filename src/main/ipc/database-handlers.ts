/**
 * IPC Handlers for Database Operations
 * Exposes database operations to the renderer process
 */

import { ipcMain } from 'electron';
import { repositories } from '../database';
import type {
  Workspace,
  Task,
  Note,
  Reminder,
  Alarm,
  PomodoroSession,
  DailyMetrics,
  AutomationLog,
  AppSettings,
} from '../../shared/types/database';

/**
 * Register all database IPC handlers
 */
export function registerDatabaseHandlers(): void {
  console.log('[IPC] Registering database handlers...');

  // Workspace handlers
  registerWorkspaceHandlers();
  
  // Task handlers
  registerTaskHandlers();
  
  // Note handlers
  registerNoteHandlers();
  
  // Reminder handlers
  registerReminderHandlers();
  
  // Alarm handlers
  registerAlarmHandlers();
  
  // Pomodoro handlers
  registerPomodoroHandlers();
  
  // Metrics handlers
  registerMetricsHandlers();
  
  // Automation log handlers
  registerAutomationLogHandlers();
  
  // Settings handlers
  registerSettingsHandlers();

  console.log('[IPC] Database handlers registered');
}

// ============================================================================
// Workspace Handlers
// ============================================================================

function registerWorkspaceHandlers(): void {
  ipcMain.handle('db:workspaces:getAll', async () => {
    try {
      return { success: true, data: repositories.workspaces.getAll() };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:workspaces:getById', async (_, id: string) => {
    try {
      return { success: true, data: repositories.workspaces.getById(id) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:workspaces:getEnabled', async () => {
    try {
      return { success: true, data: repositories.workspaces.getEnabled() };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:workspaces:getStartup', async () => {
    try {
      return { success: true, data: repositories.workspaces.getStartupWorkspaces() };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:workspaces:create', async (_, workspace: Omit<Workspace, 'createdAt' | 'updatedAt'>) => {
    try {
      return { success: true, data: repositories.workspaces.create(workspace) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:workspaces:update', async (_, id: string, updates: Partial<Workspace>) => {
    try {
      return { success: true, data: repositories.workspaces.update(id, updates) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:workspaces:delete', async (_, id: string) => {
    try {
      return { success: true, data: repositories.workspaces.delete(id) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:workspaces:toggleEnabled', async (_, id: string) => {
    try {
      return { success: true, data: repositories.workspaces.toggleEnabled(id) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:workspaces:search', async (_, query: string) => {
    try {
      return { success: true, data: repositories.workspaces.search(query) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
}

// ============================================================================
// Task Handlers
// ============================================================================

function registerTaskHandlers(): void {
  ipcMain.handle('db:tasks:getAll', async () => {
    try {
      return { success: true, data: repositories.tasks.getAll() };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:tasks:getById', async (_, id: string) => {
    try {
      return { success: true, data: repositories.tasks.getById(id) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:tasks:getCompleted', async () => {
    try {
      return { success: true, data: repositories.tasks.getCompleted() };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:tasks:getIncomplete', async () => {
    try {
      return { success: true, data: repositories.tasks.getIncomplete() };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:tasks:getUpcoming', async (_, days: number) => {
    try {
      return { success: true, data: repositories.tasks.getUpcoming(days) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:tasks:getOverdue', async () => {
    try {
      return { success: true, data: repositories.tasks.getOverdue() };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:tasks:create', async (_, task: Omit<Task, 'createdAt' | 'updatedAt'>) => {
    try {
      return { success: true, data: repositories.tasks.create(task) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:tasks:update', async (_, id: string, updates: Partial<Task>) => {
    try {
      return { success: true, data: repositories.tasks.update(id, updates) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:tasks:delete', async (_, id: string) => {
    try {
      return { success: true, data: repositories.tasks.delete(id) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:tasks:toggleComplete', async (_, id: string) => {
    try {
      return { success: true, data: repositories.tasks.toggleComplete(id) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:tasks:search', async (_, query: string) => {
    try {
      return { success: true, data: repositories.tasks.search(query) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:tasks:getStats', async () => {
    try {
      return { success: true, data: repositories.tasks.getStats() };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
}

// ============================================================================
// Note Handlers
// ============================================================================

function registerNoteHandlers(): void {
  ipcMain.handle('db:notes:getAll', async () => {
    try {
      return { success: true, data: repositories.notes.getAll() };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:notes:getById', async (_, id: string) => {
    try {
      return { success: true, data: repositories.notes.getById(id) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:notes:getPinned', async () => {
    try {
      return { success: true, data: repositories.notes.getPinned() };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:notes:getByCategory', async (_, category: string) => {
    try {
      return { success: true, data: repositories.notes.getByCategory(category) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:notes:getCategories', async () => {
    try {
      return { success: true, data: repositories.notes.getCategories() };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:notes:search', async (_, query: string) => {
    try {
      return { success: true, data: repositories.notes.search(query) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:notes:create', async (_, note: Omit<Note, 'createdAt' | 'updatedAt'>) => {
    try {
      return { success: true, data: repositories.notes.create(note) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:notes:update', async (_, id: string, updates: Partial<Note>) => {
    try {
      return { success: true, data: repositories.notes.update(id, updates) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:notes:delete', async (_, id: string) => {
    try {
      return { success: true, data: repositories.notes.delete(id) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:notes:togglePinned', async (_, id: string) => {
    try {
      return { success: true, data: repositories.notes.togglePinned(id) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:notes:getAllTags', async () => {
    try {
      return { success: true, data: repositories.notes.getAllTags() };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
}

// ============================================================================
// Reminder Handlers
// ============================================================================

function registerReminderHandlers(): void {
  ipcMain.handle('db:reminders:getAll', async () => {
    try {
      return { success: true, data: repositories.reminders.getAll() };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:reminders:getById', async (_, id: string) => {
    try {
      return { success: true, data: repositories.reminders.getById(id) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:reminders:getEnabled', async () => {
    try {
      return { success: true, data: repositories.reminders.getEnabled() };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:reminders:create', async (_, reminder: Omit<Reminder, 'createdAt' | 'updatedAt'>) => {
    try {
      return { success: true, data: repositories.reminders.create(reminder) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:reminders:update', async (_, id: string, updates: Partial<Reminder>) => {
    try {
      return { success: true, data: repositories.reminders.update(id, updates) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:reminders:delete', async (_, id: string) => {
    try {
      return { success: true, data: repositories.reminders.delete(id) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:reminders:toggle', async (_, id: string) => {
    try {
      return { success: true, data: repositories.reminders.toggle(id) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:reminders:updateLastTriggered', async (_, id: string, time?: string) => {
    try {
      return { success: true, data: repositories.reminders.updateLastTriggered(id, time) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
}

// ============================================================================
// Alarm Handlers
// ============================================================================

function registerAlarmHandlers(): void {
  ipcMain.handle('db:alarms:getAll', async () => {
    try {
      return { success: true, data: repositories.alarms.getAll() };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:alarms:getById', async (_, id: string) => {
    try {
      return { success: true, data: repositories.alarms.getById(id) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:alarms:getEnabled', async () => {
    try {
      return { success: true, data: repositories.alarms.getEnabled() };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:alarms:getForToday', async () => {
    try {
      return { success: true, data: repositories.alarms.getForToday() };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:alarms:create', async (_, alarm: Omit<Alarm, 'createdAt' | 'updatedAt'>) => {
    try {
      return { success: true, data: repositories.alarms.create(alarm) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:alarms:update', async (_, id: string, updates: Partial<Alarm>) => {
    try {
      return { success: true, data: repositories.alarms.update(id, updates) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:alarms:delete', async (_, id: string) => {
    try {
      return { success: true, data: repositories.alarms.delete(id) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:alarms:toggle', async (_, id: string) => {
    try {
      return { success: true, data: repositories.alarms.toggle(id) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
}

// ============================================================================
// Pomodoro Handlers
// ============================================================================

function registerPomodoroHandlers(): void {
  ipcMain.handle('db:pomodoro:create', async (_, session: PomodoroSession) => {
    try {
      return { success: true, data: repositories.pomodoro.create(session) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:pomodoro:getById', async (_, id: string) => {
    try {
      return { success: true, data: repositories.pomodoro.getById(id) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:pomodoro:update', async (_, id: string, updates: Partial<PomodoroSession>) => {
    try {
      return { success: true, data: repositories.pomodoro.update(id, updates) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:pomodoro:complete', async (_, id: string, endedAt?: string) => {
    try {
      return { success: true, data: repositories.pomodoro.complete(id, endedAt) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:pomodoro:getToday', async () => {
    try {
      return { success: true, data: repositories.pomodoro.getToday() };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:pomodoro:getByDateRange', async (_, startDate: string, endDate: string) => {
    try {
      return { success: true, data: repositories.pomodoro.getByDateRange(startDate, endDate) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:pomodoro:getTotalMinutesToday', async () => {
    try {
      return { success: true, data: repositories.pomodoro.getTotalMinutesToday() };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:pomodoro:getActive', async () => {
    try {
      return { success: true, data: repositories.pomodoro.getActive() };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:pomodoro:getStats', async (_, startDate: string, endDate: string) => {
    try {
      return { success: true, data: repositories.pomodoro.getStats(startDate, endDate) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
}

// ============================================================================
// Metrics Handlers
// ============================================================================

function registerMetricsHandlers(): void {
  ipcMain.handle('db:metrics:getByDate', async (_, date: string) => {
    try {
      return { success: true, data: repositories.metrics.getByDate(date) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:metrics:getToday', async () => {
    try {
      return { success: true, data: repositories.metrics.getToday() };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:metrics:getWeekly', async () => {
    try {
      return { success: true, data: repositories.metrics.getWeekly() };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:metrics:getMonthly', async () => {
    try {
      return { success: true, data: repositories.metrics.getMonthly() };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:metrics:upsert', async (_, metrics: Omit<DailyMetrics, 'createdAt' | 'updatedAt'>) => {
    try {
      return { success: true, data: repositories.metrics.upsert(metrics) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:metrics:incrementWorkMinutes', async (_, date: string, minutes: number) => {
    try {
      return { success: true, data: repositories.metrics.incrementWorkMinutes(date, minutes) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:metrics:incrementPomodoros', async (_, date: string) => {
    try {
      return { success: true, data: repositories.metrics.incrementPomodoros(date) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:metrics:incrementTasksCompleted', async (_, date: string) => {
    try {
      return { success: true, data: repositories.metrics.incrementTasksCompleted(date) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:metrics:getAggregateStats', async (_, startDate: string, endDate: string) => {
    try {
      return { success: true, data: repositories.metrics.getAggregateStats(startDate, endDate) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:metrics:getCurrentStreak', async () => {
    try {
      return { success: true, data: repositories.metrics.getCurrentStreak() };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
}

// ============================================================================
// Automation Log Handlers
// ============================================================================

function registerAutomationLogHandlers(): void {
  ipcMain.handle('db:automationLogs:create', async (_, log: AutomationLog) => {
    try {
      return { success: true, data: repositories.automationLogs.create(log) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:automationLogs:getByWorkspace', async (_, workspaceId: string, limit?: number) => {
    try {
      return { success: true, data: repositories.automationLogs.getByWorkspace(workspaceId, limit) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:automationLogs:getRecent', async (_, limit: number) => {
    try {
      return { success: true, data: repositories.automationLogs.getRecent(limit) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:automationLogs:getErrors', async (_, limit?: number) => {
    try {
      return { success: true, data: repositories.automationLogs.getErrors(limit) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:automationLogs:getWorkspaceStats', async (_, workspaceId: string) => {
    try {
      return { success: true, data: repositories.automationLogs.getWorkspaceStats(workspaceId) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:automationLogs:getOverallStats', async () => {
    try {
      return { success: true, data: repositories.automationLogs.getOverallStats() };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
}

// ============================================================================
// Settings Handlers
// ============================================================================

function registerSettingsHandlers(): void {
  ipcMain.handle('db:settings:get', async (_, key: string) => {
    try {
      return { success: true, data: repositories.settings.get(key) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:settings:set', async (_, key: string, value: string) => {
    try {
      repositories.settings.set(key, value);
      return { success: true, data: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:settings:getAll', async () => {
    try {
      return { success: true, data: repositories.settings.getAll() };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:settings:setMultiple', async (_, settings: Record<string, string>) => {
    try {
      repositories.settings.setMultiple(settings);
      return { success: true, data: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:settings:getAppSettings', async () => {
    try {
      return { success: true, data: repositories.settings.getAppSettings() };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:settings:updateAppSettings', async (_, settings: Partial<AppSettings>) => {
    try {
      repositories.settings.updateAppSettings(settings);
      return { success: true, data: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:settings:getBoolean', async (_, key: string, defaultValue: boolean) => {
    try {
      return { success: true, data: repositories.settings.getBoolean(key, defaultValue) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:settings:getNumber', async (_, key: string, defaultValue: number) => {
    try {
      return { success: true, data: repositories.settings.getNumber(key, defaultValue) };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
}

// Made with Bob
