/**
 * Database Type Definitions for MyFlow Application
 * Based on the schema defined in TECHNICAL_ARCHITECTURE.md
 */

// ============================================================================
// Workspace/Automation Types
// ============================================================================

export interface WorkspaceAction {
  type: 'open_app' | 'open_url' | 'close_app' | 'wait' | 'notification' | 'open_folder';
  path?: string;
  url?: string;
  browser?: 'default' | 'chrome' | 'firefox' | 'edge';
  appName?: string;
  delay?: number;
  message?: string;
}

export interface WorkspaceTrigger {
  onStartup: boolean;
  hotkey?: string;
  scheduledTime?: string;
}

export interface Workspace {
  id: string;
  name: string;
  icon?: string;
  enabled: boolean;
  actions: WorkspaceAction[];
  trigger: WorkspaceTrigger;
  createdAt: string;
  updatedAt: string;
}

// Database row format (with JSON as strings)
export interface WorkspaceRow {
  id: string;
  name: string;
  icon: string | null;
  enabled: number;
  actions: string; // JSON
  trigger_on_startup: number;
  trigger_hotkey: string | null;
  trigger_scheduled_time: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Task Types
// ============================================================================

export type TaskPriority = 
  | 'urgent_important' 
  | 'not_urgent_important' 
  | 'urgent_not_important' 
  | 'not_urgent_not_important';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  deadline?: string;
  estimatedMinutes?: number;
  tags: string[];
  subtasks: Subtask[];
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  deadline: string | null;
  estimated_minutes: number | null;
  tags: string | null; // JSON
  subtasks: string | null; // JSON
  completed: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Note Types
// ============================================================================

export interface Note {
  id: string;
  title: string;
  content: string;
  category?: string;
  tags: string[];
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoteRow {
  id: string;
  title: string;
  content: string;
  category: string | null;
  tags: string | null; // JSON
  pinned: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Reminder Types
// ============================================================================

export type ReminderType = 'time' | 'interval' | 'recurring' | 'health';

export interface ReminderRecurrence {
  days: number[]; // 0-6 (Sunday-Saturday)
  time: string; // HH:mm format
}

export interface Reminder {
  id: string;
  type: ReminderType;
  title: string;
  enabled: boolean;
  time?: string;
  intervalMinutes?: number;
  recurrence?: ReminderRecurrence;
  workingHoursOnly: boolean;
  sound: string;
  lastTriggeredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderRow {
  id: string;
  type: string;
  title: string;
  enabled: number;
  time: string | null;
  interval_minutes: number | null;
  recurrence: string | null; // JSON
  working_hours_only: number;
  sound: string;
  last_triggered_at: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Alarm Types
// ============================================================================

export interface Alarm {
  id: string;
  title: string;
  time: string; // HH:mm format
  enabled: boolean;
  recurringDays?: number[]; // 0-6 (Sunday-Saturday)
  sound: string;
  snoozeMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface AlarmRow {
  id: string;
  title: string;
  time: string;
  enabled: number;
  recurring_days: string | null; // JSON
  sound: string;
  snooze_minutes: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Pomodoro Types
// ============================================================================

export type PomodoroType = 'focus' | 'short_break' | 'long_break';

export interface PomodoroSession {
  id: string;
  type: PomodoroType;
  durationMinutes: number;
  completed: boolean;
  startedAt: string;
  endedAt?: string;
}

export interface PomodoroSessionRow {
  id: string;
  type: string;
  duration_minutes: number;
  completed: number;
  started_at: string;
  ended_at: string | null;
}

// ============================================================================
// Metrics Types
// ============================================================================

export interface DailyMetrics {
  date: string; // YYYY-MM-DD format
  workMinutes: number;
  pomodorosCompleted: number;
  tasksCompleted: number;
  tasksCreated: number;
  focusScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface DailyMetricsRow {
  date: string;
  work_minutes: number;
  pomodoros_completed: number;
  tasks_completed: number;
  tasks_created: number;
  focus_score: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Automation Log Types
// ============================================================================

export type AutomationStatus = 'success' | 'error' | 'partial';

export interface AutomationLog {
  id: string;
  workspaceId: string;
  status: AutomationStatus;
  errorMessage?: string;
  executedAt: string;
}

export interface AutomationLogRow {
  id: string;
  workspace_id: string;
  status: string;
  error_message: string | null;
  executed_at: string;
}

// ============================================================================
// Settings Types
// ============================================================================

export interface PomodoroSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakAfter: number;
  dailyGoal: number;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  sound: string;
  volume: number;
}

export interface ReminderSettings {
  enabled: boolean;
  workingHours: {
    start: string;
    end: string;
  };
  workingDays: number[];
  sound: string;
  volume: number;
}

export interface AutomationSettings {
  defaultDelay: number;
  showExecutionLogs: boolean;
  confirmBeforeExecute: boolean;
}

export interface DashboardSettings {
  dailyWorkGoalMinutes: number;
  defaultPeriod: 'day' | 'week' | 'month';
  visibleMetrics: string[];
}

export interface TaskSettings {
  defaultSort: 'priority' | 'deadline' | 'created';
  showCompleted: boolean;
  autoArchiveAfterDays: number;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  startWithWindows: boolean;
  startMinimized: boolean;
  minimizeToTray: boolean;
  
  clockFormat: '12h' | '24h';
  showSeconds: boolean;
  timezones: string[];
  
  pomodoro: PomodoroSettings;
  reminders: ReminderSettings;
  automations: AutomationSettings;
  dashboard: DashboardSettings;
  tasks: TaskSettings;
  
  language: 'en' | 'pt-BR';
}

export interface SettingRow {
  key: string;
  value: string;
  updated_at: string;
}

// ============================================================================
// Helper Types
// ============================================================================

export type DatabaseResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
};

export interface DateRange {
  start: string;
  end: string;
}

// Made with Bob
