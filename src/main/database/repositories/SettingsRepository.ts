/**
 * Settings Repository
 * Handles key-value storage for application settings
 */

import Database from 'better-sqlite3';
import { SettingRow, AppSettings } from '../../../shared/types/database';

export class SettingsRepository {
  constructor(private db: Database.Database) {}

  /**
   * Get a setting value by key
   */
  get(key: string): string | null {
    const stmt = this.db.prepare('SELECT value FROM settings WHERE key = ?');
    const row = stmt.get(key) as SettingRow | undefined;

    return row ? row.value : null;
  }

  /**
   * Get a setting value with a default fallback
   */
  getWithDefault(key: string, defaultValue: string): string {
    const value = this.get(key);
    return value !== null ? value : defaultValue;
  }

  /**
   * Set a setting value
   */
  set(key: string, value: string): void {
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO settings (key, value, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = excluded.updated_at
    `);

    stmt.run(key, value, now);
  }

  /**
   * Set multiple settings at once
   */
  setMultiple(settings: Record<string, string>): void {
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO settings (key, value, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = excluded.updated_at
    `);

    const transaction = this.db.transaction((entries: Array<[string, string]>) => {
      for (const [key, value] of entries) {
        stmt.run(key, value, now);
      }
    });

    transaction(Object.entries(settings));
  }

  /**
   * Delete a setting
   */
  delete(key: string): boolean {
    const stmt = this.db.prepare('DELETE FROM settings WHERE key = ?');
    const result = stmt.run(key);

    return result.changes > 0;
  }

  /**
   * Get all settings as key-value pairs
   */
  getAll(): Record<string, string> {
    const stmt = this.db.prepare('SELECT key, value FROM settings');
    const rows = stmt.all() as SettingRow[];

    const settings: Record<string, string> = {};
    rows.forEach((row) => {
      settings[row.key] = row.value;
    });

    return settings;
  }

  /**
   * Get settings by prefix
   */
  getByPrefix(prefix: string): Record<string, string> {
    const stmt = this.db.prepare('SELECT key, value FROM settings WHERE key LIKE ?');
    const rows = stmt.all(`${prefix}%`) as SettingRow[];

    const settings: Record<string, string> = {};
    rows.forEach((row) => {
      settings[row.key] = row.value;
    });

    return settings;
  }

  /**
   * Check if a setting exists
   */
  exists(key: string): boolean {
    const stmt = this.db.prepare('SELECT 1 FROM settings WHERE key = ? LIMIT 1');
    const result = stmt.get(key);

    return result !== undefined;
  }

  /**
   * Get setting as boolean
   */
  getBoolean(key: string, defaultValue: boolean = false): boolean {
    const value = this.get(key);
    if (value === null) return defaultValue;
    return value === 'true' || value === '1';
  }

  /**
   * Set boolean setting
   */
  setBoolean(key: string, value: boolean): void {
    this.set(key, value ? 'true' : 'false');
  }

  /**
   * Get setting as number
   */
  getNumber(key: string, defaultValue: number = 0): number {
    const value = this.get(key);
    if (value === null) return defaultValue;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * Set number setting
   */
  setNumber(key: string, value: number): void {
    this.set(key, value.toString());
  }

  /**
   * Get setting as JSON object
   */
  getJSON<T>(key: string, defaultValue: T): T {
    const value = this.get(key);
    if (value === null) return defaultValue;

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`[SettingsRepository] Failed to parse JSON for key "${key}":`, error);
      return defaultValue;
    }
  }

  /**
   * Set JSON object setting
   */
  setJSON<T>(key: string, value: T): void {
    this.set(key, JSON.stringify(value));
  }

  /**
   * Get complete app settings object
   */
  getAppSettings(): Partial<AppSettings> {
    const all = this.getAll();
    
    // Parse nested settings
    const settings: Partial<AppSettings> = {
      theme: all.theme as any,
      accentColor: all.accentColor,
      fontSize: all.fontSize as any,
      startWithWindows: all.startWithWindows === 'true',
      startMinimized: all.startMinimized === 'true',
      minimizeToTray: all.minimizeToTray === 'true',
      clockFormat: all.clockFormat as any,
      showSeconds: all.showSeconds === 'true',
      timezones: all.timezones ? JSON.parse(all.timezones) : [],
      language: all.language as any,
    };

    // Parse pomodoro settings
    if (Object.keys(all).some(k => k.startsWith('pomodoro.'))) {
      settings.pomodoro = {
        focusMinutes: parseInt(all['pomodoro.focusMinutes'] || '25'),
        shortBreakMinutes: parseInt(all['pomodoro.shortBreakMinutes'] || '5'),
        longBreakMinutes: parseInt(all['pomodoro.longBreakMinutes'] || '15'),
        longBreakAfter: parseInt(all['pomodoro.longBreakAfter'] || '4'),
        dailyGoal: parseInt(all['pomodoro.dailyGoal'] || '8'),
        autoStartBreaks: all['pomodoro.autoStartBreaks'] === 'true',
        autoStartFocus: all['pomodoro.autoStartFocus'] === 'true',
        sound: all['pomodoro.sound'] || 'default',
        volume: parseFloat(all['pomodoro.volume'] || '0.5'),
      };
    }

    // Parse reminders settings
    if (Object.keys(all).some(k => k.startsWith('reminders.'))) {
      settings.reminders = {
        enabled: all['reminders.enabled'] === 'true',
        workingHours: {
          start: all['reminders.workingHours.start'] || '09:00',
          end: all['reminders.workingHours.end'] || '18:00',
        },
        workingDays: all['reminders.workingDays'] ? JSON.parse(all['reminders.workingDays']) : [1, 2, 3, 4, 5],
        sound: all['reminders.sound'] || 'default',
        volume: parseFloat(all['reminders.volume'] || '0.5'),
      };
    }

    // Parse automations settings
    if (Object.keys(all).some(k => k.startsWith('automations.'))) {
      settings.automations = {
        defaultDelay: parseInt(all['automations.defaultDelay'] || '1000'),
        showExecutionLogs: all['automations.showExecutionLogs'] === 'true',
        confirmBeforeExecute: all['automations.confirmBeforeExecute'] === 'false',
      };
    }

    // Parse dashboard settings
    if (Object.keys(all).some(k => k.startsWith('dashboard.'))) {
      settings.dashboard = {
        dailyWorkGoalMinutes: parseInt(all['dashboard.dailyWorkGoalMinutes'] || '480'),
        defaultPeriod: all['dashboard.defaultPeriod'] as any || 'week',
        visibleMetrics: all['dashboard.visibleMetrics'] ? JSON.parse(all['dashboard.visibleMetrics']) : [],
      };
    }

    // Parse tasks settings
    if (Object.keys(all).some(k => k.startsWith('tasks.'))) {
      settings.tasks = {
        defaultSort: all['tasks.defaultSort'] as any || 'priority',
        showCompleted: all['tasks.showCompleted'] === 'true',
        autoArchiveAfterDays: parseInt(all['tasks.autoArchiveAfterDays'] || '30'),
      };
    }

    return settings;
  }

  /**
   * Update app settings (partial update)
   */
  updateAppSettings(settings: Partial<AppSettings>): void {
    const updates: Record<string, string> = {};

    // Flatten settings object
    if (settings.theme !== undefined) updates.theme = settings.theme;
    if (settings.accentColor !== undefined) updates.accentColor = settings.accentColor;
    if (settings.fontSize !== undefined) updates.fontSize = settings.fontSize;
    if (settings.startWithWindows !== undefined) updates.startWithWindows = settings.startWithWindows.toString();
    if (settings.startMinimized !== undefined) updates.startMinimized = settings.startMinimized.toString();
    if (settings.minimizeToTray !== undefined) updates.minimizeToTray = settings.minimizeToTray.toString();
    if (settings.clockFormat !== undefined) updates.clockFormat = settings.clockFormat;
    if (settings.showSeconds !== undefined) updates.showSeconds = settings.showSeconds.toString();
    if (settings.timezones !== undefined) updates.timezones = JSON.stringify(settings.timezones);
    if (settings.language !== undefined) updates.language = settings.language;

    // Flatten pomodoro settings
    if (settings.pomodoro) {
      const p = settings.pomodoro;
      if (p.focusMinutes !== undefined) updates['pomodoro.focusMinutes'] = p.focusMinutes.toString();
      if (p.shortBreakMinutes !== undefined) updates['pomodoro.shortBreakMinutes'] = p.shortBreakMinutes.toString();
      if (p.longBreakMinutes !== undefined) updates['pomodoro.longBreakMinutes'] = p.longBreakMinutes.toString();
      if (p.longBreakAfter !== undefined) updates['pomodoro.longBreakAfter'] = p.longBreakAfter.toString();
      if (p.dailyGoal !== undefined) updates['pomodoro.dailyGoal'] = p.dailyGoal.toString();
      if (p.autoStartBreaks !== undefined) updates['pomodoro.autoStartBreaks'] = p.autoStartBreaks.toString();
      if (p.autoStartFocus !== undefined) updates['pomodoro.autoStartFocus'] = p.autoStartFocus.toString();
      if (p.sound !== undefined) updates['pomodoro.sound'] = p.sound;
      if (p.volume !== undefined) updates['pomodoro.volume'] = p.volume.toString();
    }

    // Flatten reminders settings
    if (settings.reminders) {
      const r = settings.reminders;
      if (r.enabled !== undefined) updates['reminders.enabled'] = r.enabled.toString();
      if (r.workingHours) {
        if (r.workingHours.start !== undefined) updates['reminders.workingHours.start'] = r.workingHours.start;
        if (r.workingHours.end !== undefined) updates['reminders.workingHours.end'] = r.workingHours.end;
      }
      if (r.workingDays !== undefined) updates['reminders.workingDays'] = JSON.stringify(r.workingDays);
      if (r.sound !== undefined) updates['reminders.sound'] = r.sound;
      if (r.volume !== undefined) updates['reminders.volume'] = r.volume.toString();
    }

    // Flatten automations settings
    if (settings.automations) {
      const a = settings.automations;
      if (a.defaultDelay !== undefined) updates['automations.defaultDelay'] = a.defaultDelay.toString();
      if (a.showExecutionLogs !== undefined) updates['automations.showExecutionLogs'] = a.showExecutionLogs.toString();
      if (a.confirmBeforeExecute !== undefined) updates['automations.confirmBeforeExecute'] = a.confirmBeforeExecute.toString();
    }

    // Flatten dashboard settings
    if (settings.dashboard) {
      const d = settings.dashboard;
      if (d.dailyWorkGoalMinutes !== undefined) updates['dashboard.dailyWorkGoalMinutes'] = d.dailyWorkGoalMinutes.toString();
      if (d.defaultPeriod !== undefined) updates['dashboard.defaultPeriod'] = d.defaultPeriod;
      if (d.visibleMetrics !== undefined) updates['dashboard.visibleMetrics'] = JSON.stringify(d.visibleMetrics);
    }

    // Flatten tasks settings
    if (settings.tasks) {
      const t = settings.tasks;
      if (t.defaultSort !== undefined) updates['tasks.defaultSort'] = t.defaultSort;
      if (t.showCompleted !== undefined) updates['tasks.showCompleted'] = t.showCompleted.toString();
      if (t.autoArchiveAfterDays !== undefined) updates['tasks.autoArchiveAfterDays'] = t.autoArchiveAfterDays.toString();
    }

    this.setMultiple(updates);
  }

  /**
   * Reset all settings to defaults
   */
  resetToDefaults(): void {
    // Delete all settings
    this.db.prepare('DELETE FROM settings').run();

    // Re-insert defaults (this will be done by setup.ts on next init)
  }

  /**
   * Export settings as JSON
   */
  exportSettings(): string {
    const settings = this.getAll();
    return JSON.stringify(settings, null, 2);
  }

  /**
   * Import settings from JSON
   */
  importSettings(json: string): boolean {
    try {
      const settings = JSON.parse(json) as Record<string, string>;
      this.setMultiple(settings);
      return true;
    } catch (error) {
      console.error('[SettingsRepository] Failed to import settings:', error);
      return false;
    }
  }
}

// Made with Bob
