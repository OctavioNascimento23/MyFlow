/**
 * Alarm Repository
 * Handles CRUD operations for alarms
 */

import Database from 'better-sqlite3';
import { Alarm, AlarmRow } from '../../../shared/types/database';

export class AlarmRepository {
  constructor(private db: Database.Database) {}

  /**
   * Convert database row to Alarm object
   */
  private rowToAlarm(row: AlarmRow): Alarm {
    return {
      id: row.id,
      title: row.title,
      time: row.time,
      enabled: row.enabled === 1,
      recurringDays: row.recurring_days ? JSON.parse(row.recurring_days) : undefined,
      sound: row.sound,
      snoozeMinutes: row.snooze_minutes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Convert Alarm object to database row format
   */
  private alarmToRow(alarm: Partial<Alarm>): Partial<AlarmRow> {
    const row: Partial<AlarmRow> = {};

    if (alarm.title !== undefined) row.title = alarm.title;
    if (alarm.time !== undefined) row.time = alarm.time;
    if (alarm.enabled !== undefined) row.enabled = alarm.enabled ? 1 : 0;
    if (alarm.recurringDays !== undefined) row.recurring_days = alarm.recurringDays ? JSON.stringify(alarm.recurringDays) : null;
    if (alarm.sound !== undefined) row.sound = alarm.sound;
    if (alarm.snoozeMinutes !== undefined) row.snooze_minutes = alarm.snoozeMinutes;

    return row;
  }

  /**
   * Get all alarms
   */
  getAll(): Alarm[] {
    const stmt = this.db.prepare(`
      SELECT * FROM alarms
      ORDER BY time ASC
    `);

    const rows = stmt.all() as AlarmRow[];
    return rows.map((row) => this.rowToAlarm(row));
  }

  /**
   * Get alarm by ID
   */
  getById(id: string): Alarm | null {
    const stmt = this.db.prepare('SELECT * FROM alarms WHERE id = ?');
    const row = stmt.get(id) as AlarmRow | undefined;

    return row ? this.rowToAlarm(row) : null;
  }

  /**
   * Get all enabled alarms
   */
  getEnabled(): Alarm[] {
    const stmt = this.db.prepare(`
      SELECT * FROM alarms
      WHERE enabled = 1
      ORDER BY time ASC
    `);

    const rows = stmt.all() as AlarmRow[];
    return rows.map((row) => this.rowToAlarm(row));
  }

  /**
   * Get alarms for today (considering recurring days)
   */
  getForToday(): Alarm[] {
    const today = new Date().getDay(); // 0-6 (Sunday-Saturday)
    const allEnabled = this.getEnabled();

    return allEnabled.filter((alarm) => {
      // If no recurring days, alarm is for every day
      if (!alarm.recurringDays || alarm.recurringDays.length === 0) {
        return true;
      }
      // Check if today is in recurring days
      return alarm.recurringDays.includes(today);
    });
  }

  /**
   * Get alarms for a specific time
   */
  getByTime(time: string): Alarm[] {
    const stmt = this.db.prepare(`
      SELECT * FROM alarms
      WHERE enabled = 1 AND time = ?
    `);

    const rows = stmt.all(time) as AlarmRow[];
    return rows.map((row) => this.rowToAlarm(row));
  }

  /**
   * Get upcoming alarms (next 24 hours)
   */
  getUpcoming(): Alarm[] {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const currentDay = now.getDay();

    const allEnabled = this.getEnabled();

    return allEnabled.filter((alarm) => {
      // Check if alarm is for today and time hasn't passed
      if (!alarm.recurringDays || alarm.recurringDays.length === 0) {
        return alarm.time >= currentTime;
      }

      // Check if alarm is for today
      if (alarm.recurringDays.includes(currentDay)) {
        return alarm.time >= currentTime;
      }

      // Check if alarm is for tomorrow
      const tomorrow = (currentDay + 1) % 7;
      return alarm.recurringDays.includes(tomorrow);
    });
  }

  /**
   * Create a new alarm
   */
  create(alarm: Omit<Alarm, 'createdAt' | 'updatedAt'>): Alarm {
    const now = new Date().toISOString();
    const row = this.alarmToRow(alarm);

    const stmt = this.db.prepare(`
      INSERT INTO alarms (
        id, title, time, enabled, recurring_days, sound,
        snooze_minutes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      alarm.id,
      row.title,
      row.time,
      row.enabled,
      row.recurring_days,
      row.sound,
      row.snooze_minutes,
      now,
      now
    );

    return {
      ...alarm,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Update an alarm
   */
  update(id: string, updates: Partial<Omit<Alarm, 'id' | 'createdAt' | 'updatedAt'>>): Alarm | null {
    const existing = this.getById(id);
    if (!existing) {
      return null;
    }

    const now = new Date().toISOString();
    const row = this.alarmToRow(updates);

    const fields: string[] = [];
    const values: any[] = [];

    if (row.title !== undefined) {
      fields.push('title = ?');
      values.push(row.title);
    }
    if (row.time !== undefined) {
      fields.push('time = ?');
      values.push(row.time);
    }
    if (row.enabled !== undefined) {
      fields.push('enabled = ?');
      values.push(row.enabled);
    }
    if (row.recurring_days !== undefined) {
      fields.push('recurring_days = ?');
      values.push(row.recurring_days);
    }
    if (row.sound !== undefined) {
      fields.push('sound = ?');
      values.push(row.sound);
    }
    if (row.snooze_minutes !== undefined) {
      fields.push('snooze_minutes = ?');
      values.push(row.snooze_minutes);
    }

    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE alarms
      SET ${fields.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);

    return this.getById(id);
  }

  /**
   * Delete an alarm
   */
  delete(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM alarms WHERE id = ?');
    const result = stmt.run(id);

    return result.changes > 0;
  }

  /**
   * Toggle alarm enabled status
   */
  toggle(id: string): Alarm | null {
    const alarm = this.getById(id);
    if (!alarm) {
      return null;
    }

    return this.update(id, { enabled: !alarm.enabled });
  }

  /**
   * Update alarm time
   */
  updateTime(id: string, time: string): Alarm | null {
    return this.update(id, { time });
  }

  /**
   * Update recurring days
   */
  updateRecurringDays(id: string, days: number[]): Alarm | null {
    return this.update(id, { recurringDays: days });
  }

  /**
   * Get alarm statistics
   */
  getStats(): {
    total: number;
    enabled: number;
    recurring: number;
    oneTime: number;
  } {
    const total = this.db.prepare('SELECT COUNT(*) as count FROM alarms').get() as { count: number };
    const enabled = this.db.prepare('SELECT COUNT(*) as count FROM alarms WHERE enabled = 1').get() as { count: number };
    const recurring = this.db.prepare('SELECT COUNT(*) as count FROM alarms WHERE recurring_days IS NOT NULL').get() as { count: number };
    const oneTime = this.db.prepare('SELECT COUNT(*) as count FROM alarms WHERE recurring_days IS NULL').get() as { count: number };

    return {
      total: total.count,
      enabled: enabled.count,
      recurring: recurring.count,
      oneTime: oneTime.count,
    };
  }

  /**
   * Check if an alarm should trigger at current time
   */
  shouldTrigger(id: string, currentTime: string, currentDay: number): boolean {
    const alarm = this.getById(id);
    if (!alarm || !alarm.enabled) {
      return false;
    }

    // Check time match
    if (alarm.time !== currentTime) {
      return false;
    }

    // Check day match
    if (!alarm.recurringDays || alarm.recurringDays.length === 0) {
      return true; // Every day
    }

    return alarm.recurringDays.includes(currentDay);
  }
}

// Made with Bob
