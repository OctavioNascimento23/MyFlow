import { contextBridge, ipcRenderer } from 'electron';
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
} from '../shared/types/database';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App methods
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  getPath: (name: string) => ipcRenderer.invoke('app:getPath', name),

  // Workspace/Launcher methods (to be implemented)
  launchApp: (appPath: string) => ipcRenderer.invoke('workspace:launchApp', appPath),
  openUrl: (url: string) => ipcRenderer.invoke('workspace:openUrl', url),

  // System methods (to be implemented)
  setStartup: (enabled: boolean) => ipcRenderer.invoke('system:setStartup', enabled),
  getStartupStatus: () => ipcRenderer.invoke('system:getStartupStatus'),

  // Notification methods (to be implemented)
  showNotification: (title: string, body: string, options?: any) =>
    ipcRenderer.invoke('notification:show', title, body, options),

  // Launcher API
  launcher: {
    executeWorkspace: (id: string) => ipcRenderer.invoke('launcher:execute-workspace', id),
    testAction: (action: WorkspaceAction) => ipcRenderer.invoke('launcher:test-action', action),
    checkAppExists: (path: string) => ipcRenderer.invoke('launcher:check-app-exists', path),
    browseForApp: () => ipcRenderer.invoke('launcher:browse-for-app'),
    browseForFolder: () => ipcRenderer.invoke('launcher:browse-for-folder'),
    isAppRunning: (appName: string) => ipcRenderer.invoke('launcher:is-app-running', appName),
  },

  // Database API
  database: {
    // Workspaces
    workspaces: {
      getAll: () => ipcRenderer.invoke('db:workspaces:getAll'),
      getById: (id: string) => ipcRenderer.invoke('db:workspaces:getById', id),
      getEnabled: () => ipcRenderer.invoke('db:workspaces:getEnabled'),
      getStartup: () => ipcRenderer.invoke('db:workspaces:getStartup'),
      create: (workspace: Omit<Workspace, 'createdAt' | 'updatedAt'>) =>
        ipcRenderer.invoke('db:workspaces:create', workspace),
      update: (id: string, updates: Partial<Workspace>) =>
        ipcRenderer.invoke('db:workspaces:update', id, updates),
      delete: (id: string) => ipcRenderer.invoke('db:workspaces:delete', id),
      toggleEnabled: (id: string) => ipcRenderer.invoke('db:workspaces:toggleEnabled', id),
      search: (query: string) => ipcRenderer.invoke('db:workspaces:search', query),
    },

    // Tasks
    tasks: {
      getAll: () => ipcRenderer.invoke('db:tasks:getAll'),
      getById: (id: string) => ipcRenderer.invoke('db:tasks:getById', id),
      getCompleted: () => ipcRenderer.invoke('db:tasks:getCompleted'),
      getIncomplete: () => ipcRenderer.invoke('db:tasks:getIncomplete'),
      getUpcoming: (days: number) => ipcRenderer.invoke('db:tasks:getUpcoming', days),
      getOverdue: () => ipcRenderer.invoke('db:tasks:getOverdue'),
      create: (task: Omit<Task, 'createdAt' | 'updatedAt'>) =>
        ipcRenderer.invoke('db:tasks:create', task),
      update: (id: string, updates: Partial<Task>) =>
        ipcRenderer.invoke('db:tasks:update', id, updates),
      delete: (id: string) => ipcRenderer.invoke('db:tasks:delete', id),
      toggleComplete: (id: string) => ipcRenderer.invoke('db:tasks:toggleComplete', id),
      search: (query: string) => ipcRenderer.invoke('db:tasks:search', query),
      getStats: () => ipcRenderer.invoke('db:tasks:getStats'),
    },

    // Notes
    notes: {
      getAll: () => ipcRenderer.invoke('db:notes:getAll'),
      getById: (id: string) => ipcRenderer.invoke('db:notes:getById', id),
      getPinned: () => ipcRenderer.invoke('db:notes:getPinned'),
      getByCategory: (category: string) => ipcRenderer.invoke('db:notes:getByCategory', category),
      getCategories: () => ipcRenderer.invoke('db:notes:getCategories'),
      search: (query: string) => ipcRenderer.invoke('db:notes:search', query),
      create: (note: Omit<Note, 'createdAt' | 'updatedAt'>) =>
        ipcRenderer.invoke('db:notes:create', note),
      update: (id: string, updates: Partial<Note>) =>
        ipcRenderer.invoke('db:notes:update', id, updates),
      delete: (id: string) => ipcRenderer.invoke('db:notes:delete', id),
      togglePinned: (id: string) => ipcRenderer.invoke('db:notes:togglePinned', id),
      getAllTags: () => ipcRenderer.invoke('db:notes:getAllTags'),
    },

    // Reminders
    reminders: {
      getAll: () => ipcRenderer.invoke('db:reminders:getAll'),
      getById: (id: string) => ipcRenderer.invoke('db:reminders:getById', id),
      getEnabled: () => ipcRenderer.invoke('db:reminders:getEnabled'),
      create: (reminder: Omit<Reminder, 'createdAt' | 'updatedAt'>) =>
        ipcRenderer.invoke('db:reminders:create', reminder),
      update: (id: string, updates: Partial<Reminder>) =>
        ipcRenderer.invoke('db:reminders:update', id, updates),
      delete: (id: string) => ipcRenderer.invoke('db:reminders:delete', id),
      toggle: (id: string) => ipcRenderer.invoke('db:reminders:toggle', id),
      updateLastTriggered: (id: string, time?: string) =>
        ipcRenderer.invoke('db:reminders:updateLastTriggered', id, time),
    },

    // Alarms
    alarms: {
      getAll: () => ipcRenderer.invoke('db:alarms:getAll'),
      getById: (id: string) => ipcRenderer.invoke('db:alarms:getById', id),
      getEnabled: () => ipcRenderer.invoke('db:alarms:getEnabled'),
      getForToday: () => ipcRenderer.invoke('db:alarms:getForToday'),
      create: (alarm: Omit<Alarm, 'createdAt' | 'updatedAt'>) =>
        ipcRenderer.invoke('db:alarms:create', alarm),
      update: (id: string, updates: Partial<Alarm>) =>
        ipcRenderer.invoke('db:alarms:update', id, updates),
      delete: (id: string) => ipcRenderer.invoke('db:alarms:delete', id),
      toggle: (id: string) => ipcRenderer.invoke('db:alarms:toggle', id),
    },

    // Pomodoro
    pomodoro: {
      create: (session: PomodoroSession) => ipcRenderer.invoke('db:pomodoro:create', session),
      getById: (id: string) => ipcRenderer.invoke('db:pomodoro:getById', id),
      update: (id: string, updates: Partial<PomodoroSession>) =>
        ipcRenderer.invoke('db:pomodoro:update', id, updates),
      complete: (id: string, endedAt?: string) =>
        ipcRenderer.invoke('db:pomodoro:complete', id, endedAt),
      getToday: () => ipcRenderer.invoke('db:pomodoro:getToday'),
      getByDateRange: (startDate: string, endDate: string) =>
        ipcRenderer.invoke('db:pomodoro:getByDateRange', startDate, endDate),
      getTotalMinutesToday: () => ipcRenderer.invoke('db:pomodoro:getTotalMinutesToday'),
      getActive: () => ipcRenderer.invoke('db:pomodoro:getActive'),
      getStats: (startDate: string, endDate: string) =>
        ipcRenderer.invoke('db:pomodoro:getStats', startDate, endDate),
    },

    // Metrics
    metrics: {
      getByDate: (date: string) => ipcRenderer.invoke('db:metrics:getByDate', date),
      getToday: () => ipcRenderer.invoke('db:metrics:getToday'),
      getWeekly: () => ipcRenderer.invoke('db:metrics:getWeekly'),
      getMonthly: () => ipcRenderer.invoke('db:metrics:getMonthly'),
      upsert: (metrics: Omit<DailyMetrics, 'createdAt' | 'updatedAt'>) =>
        ipcRenderer.invoke('db:metrics:upsert', metrics),
      incrementWorkMinutes: (date: string, minutes: number) =>
        ipcRenderer.invoke('db:metrics:incrementWorkMinutes', date, minutes),
      incrementPomodoros: (date: string) =>
        ipcRenderer.invoke('db:metrics:incrementPomodoros', date),
      incrementTasksCompleted: (date: string) =>
        ipcRenderer.invoke('db:metrics:incrementTasksCompleted', date),
      getAggregateStats: (startDate: string, endDate: string) =>
        ipcRenderer.invoke('db:metrics:getAggregateStats', startDate, endDate),
      getCurrentStreak: () => ipcRenderer.invoke('db:metrics:getCurrentStreak'),
    },

    // Automation Logs
    automationLogs: {
      create: (log: AutomationLog) => ipcRenderer.invoke('db:automationLogs:create', log),
      getByWorkspace: (workspaceId: string, limit?: number) =>
        ipcRenderer.invoke('db:automationLogs:getByWorkspace', workspaceId, limit),
      getRecent: (limit: number) => ipcRenderer.invoke('db:automationLogs:getRecent', limit),
      getErrors: (limit?: number) => ipcRenderer.invoke('db:automationLogs:getErrors', limit),
      getWorkspaceStats: (workspaceId: string) =>
        ipcRenderer.invoke('db:automationLogs:getWorkspaceStats', workspaceId),
      getOverallStats: () => ipcRenderer.invoke('db:automationLogs:getOverallStats'),
    },

    // Settings
    settings: {
      get: (key: string) => ipcRenderer.invoke('db:settings:get', key),
      set: (key: string, value: string) => ipcRenderer.invoke('db:settings:set', key, value),
      getAll: () => ipcRenderer.invoke('db:settings:getAll'),
      setMultiple: (settings: Record<string, string>) =>
        ipcRenderer.invoke('db:settings:setMultiple', settings),
      getAppSettings: () => ipcRenderer.invoke('db:settings:getAppSettings'),
      updateAppSettings: (settings: Partial<AppSettings>) =>
        ipcRenderer.invoke('db:settings:updateAppSettings', settings),
      getBoolean: (key: string, defaultValue: boolean) =>
        ipcRenderer.invoke('db:settings:getBoolean', key, defaultValue),
      getNumber: (key: string, defaultValue: number) =>
        ipcRenderer.invoke('db:settings:getNumber', key, defaultValue),
    },
  },
});

// Type definitions for the exposed API
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

// Made with Bob
