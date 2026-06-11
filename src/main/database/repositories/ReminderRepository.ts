/**
 * Reminder Repository
 * Handles CRUD operations for reminders
 */

import Database from 'better-sqlite3';
import { Reminder, ReminderRow, ReminderType, ReminderRecurrence } from '../../../shared/types/database';

export class ReminderRepository {
  constructor(private db: Database.Database) {}

  /**
   * Convert database row to Reminder object
   */
  private rowToReminder(row: ReminderRow): Reminder {
    return {
      id: row.id,
      type: row.type as ReminderType,
      title: row.title,
      enabled: row.enabled === 1,
      time: row.time || undefined,
      intervalMinutes: row.interval_minutes || undefined,
      recurrence: row.recurrence ? JSON.parse(row.recurrence) : undefined,
      workingHoursOnly: row.working_hours_only === 1,
      sound: row.sound,
      lastTriggeredAt: row.last_triggered_at || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Convert Reminder object to database row format
   */
  private reminderToRow(reminder: Partial<Reminder>): Partial<ReminderRow> {
    const row: Partial<ReminderRow> = {};

    if (reminder.type !== undefined) row.type = reminder.type;
    if (reminder.title !== undefined) row.title = reminder.title;
    if (reminder.enabled !== undefined) row.enabled = reminder.enabled ? 1 : 0;
    if (reminder.time !== undefined) row.time = reminder.time || null;
    if (reminder.intervalMinutes !== undefined) row.interval_minutes = reminder.intervalMinutes || null;
    if (reminder.recurrence !== undefined) row.recurrence = reminder.recurrence ? JSON.stringify(reminder.recurrence) : null;
    if (reminder.workingHoursOnly !== undefined) row.working_hours_only = reminder.workingHoursOnly ? 1 : 0;
    if (reminder.sound !== undefined) row.sound = reminder.sound;
    if (reminder.lastTriggeredAt !== undefined) row.last_triggered_at = reminder.lastTriggeredAt || null;

    return row;
  }

  /**
   * Get all reminders
   */
  getAll(): Reminder[] {
    const stmt = this.db.prepare(`
      SELECT * FROM reminders
      ORDER BY created_at DESC
    `);

    const rows = stmt.all() as ReminderRow[];
    return rows.map((row) => this.rowToReminder(row));
  }

  /**
   * Get reminder by ID
   */
  getById(id: string): Reminder | null {
    const stmt = this.db.prepare('SELECT * FROM reminders WHERE id = ?');
    const row = stmt.get(id) as ReminderRow | undefined;

    return row ? this.rowToReminder(row) : null;
  }

  /**
   * Get all enabled reminders
   */
  getEnabled(): Reminder[] {
    const stmt = this.db.prepare(`
      SELECT * FROM reminders
      WHERE enabled = 1
      ORDER BY created_at DESC
    `);

    const rows = stmt.all() as ReminderRow[];
    return rows.map((row) => this.rowToReminder(row));
  }

  /**
   * Get reminders by type
   */
  getByType(type: ReminderType): Reminder[] {
    const stmt = this.db.prepare(`
      SELECT * FROM reminders
      WHERE type = ?
      ORDER BY created_at DESC
    `);

    const rows = stmt.all(type) as ReminderRow[];
    return rows.map((row) => this.rowToReminder(row));
  }

  /**
   * Get interval reminders that need to be triggered
   */
  getIntervalRemindersToTrigger(currentTime: string): Reminder[] {
    const stmt = this.db.prepare(`
      SELECT * FROM reminders
      WHERE enabled = 1
        AND type = 'interval'
        AND (
          last_triggered_at IS NULL
          OR datetime(last_triggered_at, '+' || interval_minutes || ' minutes') <= datetime(?)
        )
      ORDER BY last_triggered_at ASC
    `);

    const rows = stmt.all(currentTime) as ReminderRow[];
    return rows.map((row) => this.rowToReminder(row));
  }

  /**
   * Get time-based reminders for a specific time
   */
  getTimeReminders(time: string): Reminder[] {
    const stmt = this.db.prepare(`
      SELECT * FROM reminders
      WHERE enabled = 1
        AND type = 'time'
        AND time = ?
    `);

    const rows = stmt.all(time) as ReminderRow[];
    return rows.map((row) => this.rowToReminder(row));
  }

  /**
   * Get recurring reminders for a specific day and time
   */
  getRecurringReminders(dayOfWeek: number, time: string): Reminder[] {
    const stmt = this.db.prepare(`
      SELECT * FROM reminders
      WHERE enabled = 1
        AND type = 'recurring'
        AND recurrence IS NOT NULL
    `);

    const rows = stmt.all() as ReminderRow[];
    const reminders = rows.map((row) => this.rowToReminder(row));

    // Filter by day and time
    return reminders.filter((reminder) => {
      if (!reminder.recurrence) return false;
      return (
        reminder.recurrence.days.includes(dayOfWeek) &&
        reminder.recurrence.time === time
      );
    });
  }

  /**
   * Create a new reminder
   */
  create(reminder: Omit<Reminder, 'createdAt' | 'updatedAt'>): Reminder {
    const now = new Date().toISOString();
    const row = this.reminderToRow(reminder);

    const stmt = this.db.prepare(`
      INSERT INTO reminders (
        id, type, title, enabled, time, interval_minutes,
        recurrence, working_hours_only, sound, last_triggered_at,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      reminder.id,
      row.type,
      row.title,
      row.enabled,
      row.time,
      row.interval_minutes,
      row.recurrence,
      row.working_hours_only,
      row.sound,
      row.last_triggered_at,
      now,
      now
    );

    return {
      ...reminder,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Update a reminder
   */
  update(id: string, updates: Partial<Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>>): Reminder | null {
    const existing = this.getById(id);
    if (!existing) {
      return null;
    }

    const now = new Date().toISOString();
    const row = this.reminderToRow(updates);

    const fields: string[] = [];
    const values: any[] = [];

    if (row.type !== undefined) {
      fields.push('type = ?');
      values.push(row.type);
    }
    if (row.title !== undefined) {
      fields.push('title = ?');
      values.push(row.title);
    }
    if (row.enabled !== undefined) {
      fields.push('enabled = ?');
      values.push(row.enabled);
    }
    if (row.time !== undefined) {
      fields.push('time = ?');
      values.push(row.time);
    }
    if (row.interval_minutes !== undefined) {
      fields.push('interval_minutes = ?');
      values.push(row.interval_minutes);
    }
    if (row.recurrence !== undefined) {
      fields.push('recurrence = ?');
      values.push(row.recurrence);
    }
    if (row.working_hours_only !== undefined) {
      fields.push('working_hours_only = ?');
      values.push(row.working_hours_only);
    }
    if (row.sound !== undefined) {
      fields.push('sound = ?');
      values.push(row.sound);
    }
    if (row.last_triggered_at !== undefined) {
      fields.push('last_triggered_at = ?');
      values.push(row.last_triggered_at);
    }

    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE reminders
      SET ${fields.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);

    return this.getById(id);
  }

  /**
   * Delete a reminder
   */
  delete(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM reminders WHERE id = ?');
    const result = stmt.run(id);

    return result.changes > 0;
  }

  /**
   * Toggle reminder enabled status
   */
  toggle(id: string): Reminder | null {
    const reminder = this.getById(id);
    if (!reminder) {
      return null;
    }

    return this.update(id, { enabled: !reminder.enabled });
  }

  /**
   * Update last triggered time
   */
  updateLastTriggered(id: string, time?: string): Reminder | null {
    const triggeredAt = time || new Date().toISOString();
    return this.update(id, { lastTriggeredAt: triggeredAt });
  }

  /**
   * Get health reminders (special type)
   */
  getHealthReminders(): Reminder[] {
    return this.getByType('health');
  }

  /**
   * Get reminder statistics
   */
  getStats(): {
    total: number;
    enabled: number;
    byType: Record<ReminderType, number>;
  } {
    const total = this.db.prepare('SELECT COUNT(*) as count FROM reminders').get() as { count: number };
    const enabled = this.db.prepare('SELECT COUNT(*) as count FROM reminders WHERE enabled = 1').get() as { count: number };
    
    const typeStmt = this.db.prepare(`
      SELECT type, COUNT(*) as count
      FROM reminders
      GROUP BY type
    `);
    const typeRows = typeStmt.all() as { type: ReminderType; count: number }[];
    
    const byType: Record<string, number> = {};
    typeRows.forEach((row) => {
      byType[row.type] = row.count;
    });

    return {
      total: total.count,
      enabled: enabled.count,
      byType: byType as Record<ReminderType, number>,
    };
  }
}

// Made with Bob
