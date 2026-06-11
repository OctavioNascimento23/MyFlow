// Type definitions for Electron API exposed via preload script

import type {
  Workspace,
  WorkspaceAction,
  Task,
  Note,
  Reminder,
  Alarm,
  PomodoroSession,
  DailyMetrics,
  AutomationLog,
  AppSettings,
  DatabaseResult,
} from '../../shared/types/database';

export interface ElectronAPI {
  getVersion: () => Promise<string>;
  getPath: (name: string) => Promise<string>;
  launchApp: (appPath: string) => Promise<void>;
  openUrl: (url: string) => Promise<void>;
  setStartup: (enabled: boolean) => Promise<void>;
  getStartupStatus: () => Promise<boolean>;
  showNotification: (title: string, body: string, options?: any) => Promise<void>;

  launcher: {
    executeWorkspace: (id: string) => Promise<DatabaseResult<void>>;
    testAction: (action: WorkspaceAction) => Promise<DatabaseResult<void>>;
    checkAppExists: (path: string) => Promise<boolean>;
    browseForApp: () => Promise<string | null>;
    browseForFolder: () => Promise<string | null>;
    isAppRunning: (appName: string) => Promise<boolean>;
  };

  database: {
    workspaces: {
      getAll: () => Promise<DatabaseResult<Workspace[]>>;
      getById: (id: string) => Promise<DatabaseResult<Workspace | null>>;
      getEnabled: () => Promise<DatabaseResult<Workspace[]>>;
      getStartup: () => Promise<DatabaseResult<Workspace[]>>;
      create: (workspace: Omit<Workspace, 'createdAt' | 'updatedAt'>) => Promise<DatabaseResult<Workspace>>;
      update: (id: string, updates: Partial<Workspace>) => Promise<DatabaseResult<Workspace | null>>;
      delete: (id: string) => Promise<DatabaseResult<boolean>>;
      toggleEnabled: (id: string) => Promise<DatabaseResult<Workspace | null>>;
      search: (query: string) => Promise<DatabaseResult<Workspace[]>>;
    };
    tasks: {
      getAll: () => Promise<DatabaseResult<Task[]>>;
      getById: (id: string) => Promise<DatabaseResult<Task | null>>;
      getCompleted: () => Promise<DatabaseResult<Task[]>>;
      getIncomplete: () => Promise<DatabaseResult<Task[]>>;
      getUpcoming: (days: number) => Promise<DatabaseResult<Task[]>>;
      getOverdue: () => Promise<DatabaseResult<Task[]>>;
      create: (task: Omit<Task, 'createdAt' | 'updatedAt'>) => Promise<DatabaseResult<Task>>;
      update: (id: string, updates: Partial<Task>) => Promise<DatabaseResult<Task | null>>;
      delete: (id: string) => Promise<DatabaseResult<boolean>>;
      toggleComplete: (id: string) => Promise<DatabaseResult<Task | null>>;
      search: (query: string) => Promise<DatabaseResult<Task[]>>;
      getStats: () => Promise<DatabaseResult<any>>;
    };
    notes: {
      getAll: () => Promise<DatabaseResult<Note[]>>;
      getById: (id: string) => Promise<DatabaseResult<Note | null>>;
      getPinned: () => Promise<DatabaseResult<Note[]>>;
      getByCategory: (category: string) => Promise<DatabaseResult<Note[]>>;
      getCategories: () => Promise<DatabaseResult<string[]>>;
      search: (query: string) => Promise<DatabaseResult<Note[]>>;
      create: (note: Omit<Note, 'createdAt' | 'updatedAt'>) => Promise<DatabaseResult<Note>>;
      update: (id: string, updates: Partial<Note>) => Promise<DatabaseResult<Note | null>>;
      delete: (id: string) => Promise<DatabaseResult<boolean>>;
      togglePinned: (id: string) => Promise<DatabaseResult<Note | null>>;
      getAllTags: () => Promise<DatabaseResult<string[]>>;
    };
    reminders: {
      getAll: () => Promise<DatabaseResult<Reminder[]>>;
      getById: (id: string) => Promise<DatabaseResult<Reminder | null>>;
      getEnabled: () => Promise<DatabaseResult<Reminder[]>>;
      create: (reminder: Omit<Reminder, 'createdAt' | 'updatedAt'>) => Promise<DatabaseResult<Reminder>>;
      update: (id: string, updates: Partial<Reminder>) => Promise<DatabaseResult<Reminder | null>>;
      delete: (id: string) => Promise<DatabaseResult<boolean>>;
      toggle: (id: string) => Promise<DatabaseResult<Reminder | null>>;
      updateLastTriggered: (id: string, time?: string) => Promise<DatabaseResult<Reminder | null>>;
    };
    alarms: {
      getAll: () => Promise<DatabaseResult<Alarm[]>>;
      getById: (id: string) => Promise<DatabaseResult<Alarm | null>>;
      getEnabled: () => Promise<DatabaseResult<Alarm[]>>;
      getForToday: () => Promise<DatabaseResult<Alarm[]>>;
      create: (alarm: Omit<Alarm, 'createdAt' | 'updatedAt'>) => Promise<DatabaseResult<Alarm>>;
      update: (id: string, updates: Partial<Alarm>) => Promise<DatabaseResult<Alarm | null>>;
      delete: (id: string) => Promise<DatabaseResult<boolean>>;
      toggle: (id: string) => Promise<DatabaseResult<Alarm | null>>;
    };
    pomodoro: {
      create: (session: PomodoroSession) => Promise<DatabaseResult<PomodoroSession>>;
      getById: (id: string) => Promise<DatabaseResult<PomodoroSession | null>>;
      update: (id: string, updates: Partial<PomodoroSession>) => Promise<DatabaseResult<PomodoroSession | null>>;
      complete: (id: string, endedAt?: string) => Promise<DatabaseResult<PomodoroSession | null>>;
      getToday: () => Promise<DatabaseResult<PomodoroSession[]>>;
      getByDateRange: (startDate: string, endDate: string) => Promise<DatabaseResult<PomodoroSession[]>>;
      getTotalMinutesToday: () => Promise<DatabaseResult<number>>;
      getActive: () => Promise<DatabaseResult<PomodoroSession | null>>;
      getStats: (startDate: string, endDate: string) => Promise<DatabaseResult<any>>;
    };
    metrics: {
      getByDate: (date: string) => Promise<DatabaseResult<DailyMetrics | null>>;
      getToday: () => Promise<DatabaseResult<DailyMetrics | null>>;
      getWeekly: () => Promise<DatabaseResult<DailyMetrics[]>>;
      getMonthly: () => Promise<DatabaseResult<DailyMetrics[]>>;
      upsert: (metrics: Omit<DailyMetrics, 'createdAt' | 'updatedAt'>) => Promise<DatabaseResult<DailyMetrics>>;
      incrementWorkMinutes: (date: string, minutes: number) => Promise<DatabaseResult<DailyMetrics>>;
      incrementPomodoros: (date: string) => Promise<DatabaseResult<DailyMetrics>>;
      incrementTasksCompleted: (date: string) => Promise<DatabaseResult<DailyMetrics>>;
      getAggregateStats: (startDate: string, endDate: string) => Promise<DatabaseResult<any>>;
      getCurrentStreak: () => Promise<DatabaseResult<number>>;
    };
    automationLogs: {
      create: (log: AutomationLog) => Promise<DatabaseResult<AutomationLog>>;
      getByWorkspace: (workspaceId: string, limit?: number) => Promise<DatabaseResult<AutomationLog[]>>;
      getRecent: (limit: number) => Promise<DatabaseResult<AutomationLog[]>>;
      getErrors: (limit?: number) => Promise<DatabaseResult<AutomationLog[]>>;
      getWorkspaceStats: (workspaceId: string) => Promise<DatabaseResult<any>>;
      getOverallStats: () => Promise<DatabaseResult<any>>;
    };
    settings: {
      get: (key: string) => Promise<DatabaseResult<string | null>>;
      set: (key: string, value: string) => Promise<DatabaseResult<null>>;
      getAll: () => Promise<DatabaseResult<Record<string, string>>>;
      setMultiple: (settings: Record<string, string>) => Promise<DatabaseResult<null>>;
      getAppSettings: () => Promise<DatabaseResult<Partial<AppSettings>>>;
      updateAppSettings: (settings: Partial<AppSettings>) => Promise<DatabaseResult<null>>;
      getBoolean: (key: string, defaultValue: boolean) => Promise<DatabaseResult<boolean>>;
      getNumber: (key: string, defaultValue: number) => Promise<DatabaseResult<number>>;
    };
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};

// Made with Bob
