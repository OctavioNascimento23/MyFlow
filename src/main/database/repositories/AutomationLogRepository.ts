/**
 * Automation Log Repository
 * Handles CRUD operations for automation execution logs
 */

import Database from 'better-sqlite3';
import { AutomationLog, AutomationLogRow, AutomationStatus } from '../../../shared/types/database';

export class AutomationLogRepository {
  constructor(private db: Database.Database) {}

  /**
   * Convert database row to AutomationLog object
   */
  private rowToLog(row: AutomationLogRow): AutomationLog {
    return {
      id: row.id,
      workspaceId: row.workspace_id,
      status: row.status as AutomationStatus,
      errorMessage: row.error_message || undefined,
      executedAt: row.executed_at,
    };
  }

  /**
   * Convert AutomationLog object to database row format
   */
  private logToRow(log: Partial<AutomationLog>): Partial<AutomationLogRow> {
    const row: Partial<AutomationLogRow> = {};

    if (log.workspaceId !== undefined) row.workspace_id = log.workspaceId;
    if (log.status !== undefined) row.status = log.status;
    if (log.errorMessage !== undefined) row.error_message = log.errorMessage || null;
    if (log.executedAt !== undefined) row.executed_at = log.executedAt;

    return row;
  }

  /**
   * Create a new automation log
   */
  create(log: AutomationLog): AutomationLog {
    const row = this.logToRow(log);

    const stmt = this.db.prepare(`
      INSERT INTO automation_logs (
        id, workspace_id, status, error_message, executed_at
      ) VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      log.id,
      row.workspace_id,
      row.status,
      row.error_message,
      row.executed_at
    );

    return log;
  }

  /**
   * Get log by ID
   */
  getById(id: string): AutomationLog | null {
    const stmt = this.db.prepare('SELECT * FROM automation_logs WHERE id = ?');
    const row = stmt.get(id) as AutomationLogRow | undefined;

    return row ? this.rowToLog(row) : null;
  }

  /**
   * Get all logs for a workspace
   */
  getByWorkspace(workspaceId: string, limit?: number): AutomationLog[] {
    const stmt = this.db.prepare(`
      SELECT * FROM automation_logs
      WHERE workspace_id = ?
      ORDER BY executed_at DESC
      ${limit ? 'LIMIT ?' : ''}
    `);

    const rows = limit
      ? stmt.all(workspaceId, limit) as AutomationLogRow[]
      : stmt.all(workspaceId) as AutomationLogRow[];

    return rows.map((row) => this.rowToLog(row));
  }

  /**
   * Get recent logs (all workspaces)
   */
  getRecent(limit: number = 50): AutomationLog[] {
    const stmt = this.db.prepare(`
      SELECT * FROM automation_logs
      ORDER BY executed_at DESC
      LIMIT ?
    `);

    const rows = stmt.all(limit) as AutomationLogRow[];
    return rows.map((row) => this.rowToLog(row));
  }

  /**
   * Get logs by status
   */
  getByStatus(status: AutomationStatus, limit?: number): AutomationLog[] {
    const stmt = this.db.prepare(`
      SELECT * FROM automation_logs
      WHERE status = ?
      ORDER BY executed_at DESC
      ${limit ? 'LIMIT ?' : ''}
    `);

    const rows = limit
      ? stmt.all(status, limit) as AutomationLogRow[]
      : stmt.all(status) as AutomationLogRow[];

    return rows.map((row) => this.rowToLog(row));
  }

  /**
   * Get error logs
   */
  getErrors(limit?: number): AutomationLog[] {
    return this.getByStatus('error', limit);
  }

  /**
   * Get successful logs
   */
  getSuccessful(limit?: number): AutomationLog[] {
    return this.getByStatus('success', limit);
  }

  /**
   * Get logs by date range
   */
  getByDateRange(startDate: string, endDate: string): AutomationLog[] {
    const stmt = this.db.prepare(`
      SELECT * FROM automation_logs
      WHERE executed_at >= ? AND executed_at <= ?
      ORDER BY executed_at DESC
    `);

    const rows = stmt.all(startDate, endDate) as AutomationLogRow[];
    return rows.map((row) => this.rowToLog(row));
  }

  /**
   * Get today's logs
   */
  getToday(): AutomationLog[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString();

    return this.getByDateRange(todayStr, tomorrowStr);
  }

  /**
   * Get logs for a workspace by date range
   */
  getByWorkspaceAndDateRange(
    workspaceId: string,
    startDate: string,
    endDate: string
  ): AutomationLog[] {
    const stmt = this.db.prepare(`
      SELECT * FROM automation_logs
      WHERE workspace_id = ?
        AND executed_at >= ?
        AND executed_at <= ?
      ORDER BY executed_at DESC
    `);

    const rows = stmt.all(workspaceId, startDate, endDate) as AutomationLogRow[];
    return rows.map((row) => this.rowToLog(row));
  }

  /**
   * Get last execution for a workspace
   */
  getLastExecution(workspaceId: string): AutomationLog | null {
    const stmt = this.db.prepare(`
      SELECT * FROM automation_logs
      WHERE workspace_id = ?
      ORDER BY executed_at DESC
      LIMIT 1
    `);

    const row = stmt.get(workspaceId) as AutomationLogRow | undefined;
    return row ? this.rowToLog(row) : null;
  }

  /**
   * Get execution statistics for a workspace
   */
  getWorkspaceStats(workspaceId: string): {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    partialExecutions: number;
    successRate: number;
    lastExecution?: string;
  } {
    const stmt = this.db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
        SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN status = 'partial' THEN 1 ELSE 0 END) as partial,
        MAX(executed_at) as last_execution
      FROM automation_logs
      WHERE workspace_id = ?
    `);

    const result = stmt.get(workspaceId) as {
      total: number;
      successful: number;
      failed: number;
      partial: number;
      last_execution: string | null;
    };

    const successRate = result.total > 0 
      ? (result.successful / result.total) * 100 
      : 0;

    return {
      totalExecutions: result.total,
      successfulExecutions: result.successful,
      failedExecutions: result.failed,
      partialExecutions: result.partial,
      successRate: Math.round(successRate * 100) / 100,
      lastExecution: result.last_execution || undefined,
    };
  }

  /**
   * Get overall statistics
   */
  getOverallStats(): {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    partialExecutions: number;
    successRate: number;
    uniqueWorkspaces: number;
  } {
    const stmt = this.db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
        SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN status = 'partial' THEN 1 ELSE 0 END) as partial,
        COUNT(DISTINCT workspace_id) as unique_workspaces
      FROM automation_logs
    `);

    const result = stmt.get() as {
      total: number;
      successful: number;
      failed: number;
      partial: number;
      unique_workspaces: number;
    };

    const successRate = result.total > 0 
      ? (result.successful / result.total) * 100 
      : 0;

    return {
      totalExecutions: result.total,
      successfulExecutions: result.successful,
      failedExecutions: result.failed,
      partialExecutions: result.partial,
      successRate: Math.round(successRate * 100) / 100,
      uniqueWorkspaces: result.unique_workspaces,
    };
  }

  /**
   * Delete logs for a workspace
   */
  deleteByWorkspace(workspaceId: string): number {
    const stmt = this.db.prepare('DELETE FROM automation_logs WHERE workspace_id = ?');
    const result = stmt.run(workspaceId);

    return result.changes;
  }

  /**
   * Delete old logs (cleanup)
   */
  deleteOlderThan(date: string): number {
    const stmt = this.db.prepare('DELETE FROM automation_logs WHERE executed_at < ?');
    const result = stmt.run(date);

    return result.changes;
  }

  /**
   * Delete all logs
   */
  deleteAll(): number {
    const stmt = this.db.prepare('DELETE FROM automation_logs');
    const result = stmt.run();

    return result.changes;
  }

  /**
   * Get execution count by day for the last N days
   */
  getExecutionsByDay(days: number = 7): Array<{
    date: string;
    total: number;
    successful: number;
    failed: number;
  }> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stmt = this.db.prepare(`
      SELECT 
        DATE(executed_at) as date,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
        SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as failed
      FROM automation_logs
      WHERE executed_at >= ? AND executed_at <= ?
      GROUP BY DATE(executed_at)
      ORDER BY date DESC
    `);

    const rows = stmt.all(startDate.toISOString(), endDate.toISOString()) as Array<{
      date: string;
      total: number;
      successful: number;
      failed: number;
    }>;

    return rows;
  }
}

// Made with Bob
