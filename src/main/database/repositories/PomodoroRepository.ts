/**
 * Pomodoro Repository
 * Handles CRUD operations for pomodoro sessions
 */

import Database from 'better-sqlite3';
import { PomodoroSession, PomodoroSessionRow, PomodoroType } from '../../../shared/types/database';

export class PomodoroRepository {
  constructor(private db: Database.Database) {}

  /**
   * Convert database row to PomodoroSession object
   */
  private rowToSession(row: PomodoroSessionRow): PomodoroSession {
    return {
      id: row.id,
      type: row.type as PomodoroType,
      durationMinutes: row.duration_minutes,
      completed: row.completed === 1,
      startedAt: row.started_at,
      endedAt: row.ended_at || undefined,
    };
  }

  /**
   * Convert PomodoroSession object to database row format
   */
  private sessionToRow(session: Partial<PomodoroSession>): Partial<PomodoroSessionRow> {
    const row: Partial<PomodoroSessionRow> = {};

    if (session.type !== undefined) row.type = session.type;
    if (session.durationMinutes !== undefined) row.duration_minutes = session.durationMinutes;
    if (session.completed !== undefined) row.completed = session.completed ? 1 : 0;
    if (session.startedAt !== undefined) row.started_at = session.startedAt;
    if (session.endedAt !== undefined) row.ended_at = session.endedAt || null;

    return row;
  }

  /**
   * Create a new pomodoro session
   */
  create(session: PomodoroSession): PomodoroSession {
    const row = this.sessionToRow(session);

    const stmt = this.db.prepare(`
      INSERT INTO pomodoro_sessions (
        id, type, duration_minutes, completed, started_at, ended_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      session.id,
      row.type,
      row.duration_minutes,
      row.completed,
      row.started_at,
      row.ended_at
    );

    return session;
  }

  /**
   * Get session by ID
   */
  getById(id: string): PomodoroSession | null {
    const stmt = this.db.prepare('SELECT * FROM pomodoro_sessions WHERE id = ?');
    const row = stmt.get(id) as PomodoroSessionRow | undefined;

    return row ? this.rowToSession(row) : null;
  }

  /**
   * Update a session
   */
  update(id: string, updates: Partial<Omit<PomodoroSession, 'id'>>): PomodoroSession | null {
    const existing = this.getById(id);
    if (!existing) {
      return null;
    }

    const row = this.sessionToRow(updates);

    const fields: string[] = [];
    const values: any[] = [];

    if (row.type !== undefined) {
      fields.push('type = ?');
      values.push(row.type);
    }
    if (row.duration_minutes !== undefined) {
      fields.push('duration_minutes = ?');
      values.push(row.duration_minutes);
    }
    if (row.completed !== undefined) {
      fields.push('completed = ?');
      values.push(row.completed);
    }
    if (row.started_at !== undefined) {
      fields.push('started_at = ?');
      values.push(row.started_at);
    }
    if (row.ended_at !== undefined) {
      fields.push('ended_at = ?');
      values.push(row.ended_at);
    }

    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE pomodoro_sessions
      SET ${fields.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);

    return this.getById(id);
  }

  /**
   * Complete a session
   */
  complete(id: string, endedAt?: string): PomodoroSession | null {
    const endTime = endedAt || new Date().toISOString();
    return this.update(id, { completed: true, endedAt: endTime });
  }

  /**
   * Get today's sessions
   */
  getToday(): PomodoroSession[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    const stmt = this.db.prepare(`
      SELECT * FROM pomodoro_sessions
      WHERE started_at >= ?
      ORDER BY started_at DESC
    `);

    const rows = stmt.all(todayStr) as PomodoroSessionRow[];
    return rows.map((row) => this.rowToSession(row));
  }

  /**
   * Get sessions by date range
   */
  getByDateRange(startDate: string, endDate: string): PomodoroSession[] {
    const stmt = this.db.prepare(`
      SELECT * FROM pomodoro_sessions
      WHERE started_at >= ? AND started_at <= ?
      ORDER BY started_at DESC
    `);

    const rows = stmt.all(startDate, endDate) as PomodoroSessionRow[];
    return rows.map((row) => this.rowToSession(row));
  }

  /**
   * Get sessions by type
   */
  getByType(type: PomodoroType, limit?: number): PomodoroSession[] {
    const stmt = this.db.prepare(`
      SELECT * FROM pomodoro_sessions
      WHERE type = ?
      ORDER BY started_at DESC
      ${limit ? 'LIMIT ?' : ''}
    `);

    const rows = limit 
      ? stmt.all(type, limit) as PomodoroSessionRow[]
      : stmt.all(type) as PomodoroSessionRow[];
    
    return rows.map((row) => this.rowToSession(row));
  }

  /**
   * Get completed sessions count for a date
   */
  getCompletedCount(date: string): number {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM pomodoro_sessions
      WHERE completed = 1
        AND started_at >= ?
        AND started_at < ?
    `);

    const result = stmt.get(date, nextDay.toISOString()) as { count: number };
    return result.count;
  }

  /**
   * Get total work minutes for today
   */
  getTotalMinutesToday(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    const stmt = this.db.prepare(`
      SELECT SUM(duration_minutes) as total
      FROM pomodoro_sessions
      WHERE completed = 1
        AND type = 'focus'
        AND started_at >= ?
    `);

    const result = stmt.get(todayStr) as { total: number | null };
    return result.total || 0;
  }

  /**
   * Get total work minutes for a date range
   */
  getTotalMinutesByDateRange(startDate: string, endDate: string): number {
    const stmt = this.db.prepare(`
      SELECT SUM(duration_minutes) as total
      FROM pomodoro_sessions
      WHERE completed = 1
        AND type = 'focus'
        AND started_at >= ?
        AND started_at <= ?
    `);

    const result = stmt.get(startDate, endDate) as { total: number | null };
    return result.total || 0;
  }

  /**
   * Get active (incomplete) session
   */
  getActive(): PomodoroSession | null {
    const stmt = this.db.prepare(`
      SELECT * FROM pomodoro_sessions
      WHERE completed = 0
      ORDER BY started_at DESC
      LIMIT 1
    `);

    const row = stmt.get() as PomodoroSessionRow | undefined;
    return row ? this.rowToSession(row) : null;
  }

  /**
   * Get recent sessions
   */
  getRecent(limit: number = 10): PomodoroSession[] {
    const stmt = this.db.prepare(`
      SELECT * FROM pomodoro_sessions
      ORDER BY started_at DESC
      LIMIT ?
    `);

    const rows = stmt.all(limit) as PomodoroSessionRow[];
    return rows.map((row) => this.rowToSession(row));
  }

  /**
   * Get session statistics for a date range
   */
  getStats(startDate: string, endDate: string): {
    totalSessions: number;
    completedSessions: number;
    focusSessions: number;
    totalFocusMinutes: number;
    averageSessionLength: number;
  } {
    const stmt = this.db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN type = 'focus' THEN 1 ELSE 0 END) as focus,
        SUM(CASE WHEN type = 'focus' AND completed = 1 THEN duration_minutes ELSE 0 END) as focus_minutes,
        AVG(CASE WHEN completed = 1 THEN duration_minutes ELSE NULL END) as avg_duration
      FROM pomodoro_sessions
      WHERE started_at >= ? AND started_at <= ?
    `);

    const result = stmt.get(startDate, endDate) as {
      total: number;
      completed: number;
      focus: number;
      focus_minutes: number;
      avg_duration: number | null;
    };

    return {
      totalSessions: result.total,
      completedSessions: result.completed,
      focusSessions: result.focus,
      totalFocusMinutes: result.focus_minutes,
      averageSessionLength: result.avg_duration || 0,
    };
  }

  /**
   * Get daily statistics for the last N days
   */
  getDailyStats(days: number = 7): Array<{
    date: string;
    sessions: number;
    focusMinutes: number;
  }> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stmt = this.db.prepare(`
      SELECT 
        DATE(started_at) as date,
        COUNT(*) as sessions,
        SUM(CASE WHEN type = 'focus' AND completed = 1 THEN duration_minutes ELSE 0 END) as focus_minutes
      FROM pomodoro_sessions
      WHERE started_at >= ? AND started_at <= ?
      GROUP BY DATE(started_at)
      ORDER BY date DESC
    `);

    const rows = stmt.all(startDate.toISOString(), endDate.toISOString()) as Array<{
      date: string;
      sessions: number;
      focus_minutes: number;
    }>;

    return rows.map((row) => ({
      date: row.date,
      sessions: row.sessions,
      focusMinutes: row.focus_minutes,
    }));
  }

  /**
   * Delete old sessions (cleanup)
   */
  deleteOlderThan(date: string): number {
    const stmt = this.db.prepare('DELETE FROM pomodoro_sessions WHERE started_at < ?');
    const result = stmt.run(date);

    return result.changes;
  }
}

// Made with Bob
