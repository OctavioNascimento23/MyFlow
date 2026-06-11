/**
 * Metrics Repository
 * Handles CRUD operations for daily metrics
 */

import Database from 'better-sqlite3';
import { DailyMetrics, DailyMetricsRow } from '../../../shared/types/database';

export class MetricsRepository {
  constructor(private db: Database.Database) {}

  /**
   * Convert database row to DailyMetrics object
   */
  private rowToMetrics(row: DailyMetricsRow): DailyMetrics {
    return {
      date: row.date,
      workMinutes: row.work_minutes,
      pomodorosCompleted: row.pomodoros_completed,
      tasksCompleted: row.tasks_completed,
      tasksCreated: row.tasks_created,
      focusScore: row.focus_score,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Convert DailyMetrics object to database row format
   */
  private metricsToRow(metrics: Partial<DailyMetrics>): Partial<DailyMetricsRow> {
    const row: Partial<DailyMetricsRow> = {};

    if (metrics.date !== undefined) row.date = metrics.date;
    if (metrics.workMinutes !== undefined) row.work_minutes = metrics.workMinutes;
    if (metrics.pomodorosCompleted !== undefined) row.pomodoros_completed = metrics.pomodorosCompleted;
    if (metrics.tasksCompleted !== undefined) row.tasks_completed = metrics.tasksCompleted;
    if (metrics.tasksCreated !== undefined) row.tasks_created = metrics.tasksCreated;
    if (metrics.focusScore !== undefined) row.focus_score = metrics.focusScore;

    return row;
  }

  /**
   * Get metrics by date
   */
  getByDate(date: string): DailyMetrics | null {
    const stmt = this.db.prepare('SELECT * FROM daily_metrics WHERE date = ?');
    const row = stmt.get(date) as DailyMetricsRow | undefined;

    return row ? this.rowToMetrics(row) : null;
  }

  /**
   * Get today's metrics
   */
  getToday(): DailyMetrics | null {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return this.getByDate(today);
  }

  /**
   * Get metrics for date range
   */
  getByDateRange(startDate: string, endDate: string): DailyMetrics[] {
    const stmt = this.db.prepare(`
      SELECT * FROM daily_metrics
      WHERE date >= ? AND date <= ?
      ORDER BY date DESC
    `);

    const rows = stmt.all(startDate, endDate) as DailyMetricsRow[];
    return rows.map((row) => this.rowToMetrics(row));
  }

  /**
   * Get weekly metrics (last 7 days)
   */
  getWeekly(): DailyMetrics[] {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6);

    return this.getByDateRange(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );
  }

  /**
   * Get monthly metrics (last 30 days)
   */
  getMonthly(): DailyMetrics[] {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 29);

    return this.getByDateRange(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );
  }

  /**
   * Get metrics for current week (Monday to Sunday)
   */
  getCurrentWeek(): DailyMetrics[] {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return this.getByDateRange(
      monday.toISOString().split('T')[0],
      sunday.toISOString().split('T')[0]
    );
  }

  /**
   * Get metrics for current month
   */
  getCurrentMonth(): DailyMetrics[] {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return this.getByDateRange(
      firstDay.toISOString().split('T')[0],
      lastDay.toISOString().split('T')[0]
    );
  }

  /**
   * Create or update metrics (upsert)
   */
  upsert(metrics: Omit<DailyMetrics, 'createdAt' | 'updatedAt'>): DailyMetrics {
    const existing = this.getByDate(metrics.date);
    const now = new Date().toISOString();

    if (existing) {
      // Update existing
      const row = this.metricsToRow(metrics);

      const stmt = this.db.prepare(`
        UPDATE daily_metrics
        SET work_minutes = ?,
            pomodoros_completed = ?,
            tasks_completed = ?,
            tasks_created = ?,
            focus_score = ?,
            updated_at = ?
        WHERE date = ?
      `);

      stmt.run(
        row.work_minutes,
        row.pomodoros_completed,
        row.tasks_completed,
        row.tasks_created,
        row.focus_score,
        now,
        metrics.date
      );

      return {
        ...metrics,
        createdAt: existing.createdAt,
        updatedAt: now,
      };
    } else {
      // Insert new
      const row = this.metricsToRow(metrics);

      const stmt = this.db.prepare(`
        INSERT INTO daily_metrics (
          date, work_minutes, pomodoros_completed, tasks_completed,
          tasks_created, focus_score, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        metrics.date,
        row.work_minutes,
        row.pomodoros_completed,
        row.tasks_completed,
        row.tasks_created,
        row.focus_score,
        now,
        now
      );

      return {
        ...metrics,
        createdAt: now,
        updatedAt: now,
      };
    }
  }

  /**
   * Increment work minutes for a date
   */
  incrementWorkMinutes(date: string, minutes: number): DailyMetrics {
    const existing = this.getByDate(date);
    const currentMinutes = existing?.workMinutes || 0;

    return this.upsert({
      date,
      workMinutes: currentMinutes + minutes,
      pomodorosCompleted: existing?.pomodorosCompleted || 0,
      tasksCompleted: existing?.tasksCompleted || 0,
      tasksCreated: existing?.tasksCreated || 0,
      focusScore: existing?.focusScore || 0,
    });
  }

  /**
   * Increment pomodoros completed for a date
   */
  incrementPomodoros(date: string): DailyMetrics {
    const existing = this.getByDate(date);

    return this.upsert({
      date,
      workMinutes: existing?.workMinutes || 0,
      pomodorosCompleted: (existing?.pomodorosCompleted || 0) + 1,
      tasksCompleted: existing?.tasksCompleted || 0,
      tasksCreated: existing?.tasksCreated || 0,
      focusScore: existing?.focusScore || 0,
    });
  }

  /**
   * Increment tasks completed for a date
   */
  incrementTasksCompleted(date: string): DailyMetrics {
    const existing = this.getByDate(date);

    return this.upsert({
      date,
      workMinutes: existing?.workMinutes || 0,
      pomodorosCompleted: existing?.pomodorosCompleted || 0,
      tasksCompleted: (existing?.tasksCompleted || 0) + 1,
      tasksCreated: existing?.tasksCreated || 0,
      focusScore: existing?.focusScore || 0,
    });
  }

  /**
   * Increment tasks created for a date
   */
  incrementTasksCreated(date: string): DailyMetrics {
    const existing = this.getByDate(date);

    return this.upsert({
      date,
      workMinutes: existing?.workMinutes || 0,
      pomodorosCompleted: existing?.pomodorosCompleted || 0,
      tasksCompleted: existing?.tasksCompleted || 0,
      tasksCreated: (existing?.tasksCreated || 0) + 1,
      focusScore: existing?.focusScore || 0,
    });
  }

  /**
   * Update focus score for a date
   */
  updateFocusScore(date: string, score: number): DailyMetrics {
    const existing = this.getByDate(date);

    return this.upsert({
      date,
      workMinutes: existing?.workMinutes || 0,
      pomodorosCompleted: existing?.pomodorosCompleted || 0,
      tasksCompleted: existing?.tasksCompleted || 0,
      tasksCreated: existing?.tasksCreated || 0,
      focusScore: score,
    });
  }

  /**
   * Get aggregate statistics for a date range
   */
  getAggregateStats(startDate: string, endDate: string): {
    totalWorkMinutes: number;
    totalPomodoros: number;
    totalTasksCompleted: number;
    totalTasksCreated: number;
    averageFocusScore: number;
    daysTracked: number;
  } {
    const stmt = this.db.prepare(`
      SELECT 
        SUM(work_minutes) as total_work,
        SUM(pomodoros_completed) as total_pomodoros,
        SUM(tasks_completed) as total_tasks_completed,
        SUM(tasks_created) as total_tasks_created,
        AVG(focus_score) as avg_focus_score,
        COUNT(*) as days_tracked
      FROM daily_metrics
      WHERE date >= ? AND date <= ?
    `);

    const result = stmt.get(startDate, endDate) as {
      total_work: number | null;
      total_pomodoros: number | null;
      total_tasks_completed: number | null;
      total_tasks_created: number | null;
      avg_focus_score: number | null;
      days_tracked: number;
    };

    return {
      totalWorkMinutes: result.total_work || 0,
      totalPomodoros: result.total_pomodoros || 0,
      totalTasksCompleted: result.total_tasks_completed || 0,
      totalTasksCreated: result.total_tasks_created || 0,
      averageFocusScore: result.avg_focus_score || 0,
      daysTracked: result.days_tracked,
    };
  }

  /**
   * Get best day (highest work minutes)
   */
  getBestDay(startDate: string, endDate: string): DailyMetrics | null {
    const stmt = this.db.prepare(`
      SELECT * FROM daily_metrics
      WHERE date >= ? AND date <= ?
      ORDER BY work_minutes DESC
      LIMIT 1
    `);

    const row = stmt.get(startDate, endDate) as DailyMetricsRow | undefined;
    return row ? this.rowToMetrics(row) : null;
  }

  /**
   * Get streak (consecutive days with work)
   */
  getCurrentStreak(): number {
    const stmt = this.db.prepare(`
      SELECT date FROM daily_metrics
      WHERE work_minutes > 0
      ORDER BY date DESC
    `);

    const rows = stmt.all() as { date: string }[];
    
    if (rows.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < rows.length; i++) {
      const rowDate = new Date(rows[i].date);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      expectedDate.setHours(0, 0, 0, 0);

      if (rowDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Delete old metrics (cleanup)
   */
  deleteOlderThan(date: string): number {
    const stmt = this.db.prepare('DELETE FROM daily_metrics WHERE date < ?');
    const result = stmt.run(date);

    return result.changes;
  }
}

// Made with Bob
