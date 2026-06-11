/**
 * Workspace Repository
 * Handles CRUD operations for workspaces/automations
 */

import Database from 'better-sqlite3';
import { Workspace, WorkspaceRow, WorkspaceAction, WorkspaceTrigger } from '../../../shared/types/database';

export class WorkspaceRepository {
  constructor(private db: Database.Database) {}

  /**
   * Convert database row to Workspace object
   */
  private rowToWorkspace(row: WorkspaceRow): Workspace {
    return {
      id: row.id,
      name: row.name,
      icon: row.icon || undefined,
      enabled: row.enabled === 1,
      actions: JSON.parse(row.actions) as WorkspaceAction[],
      trigger: {
        onStartup: row.trigger_on_startup === 1,
        hotkey: row.trigger_hotkey || undefined,
        scheduledTime: row.trigger_scheduled_time || undefined,
      },
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Convert Workspace object to database row format
   */
  private workspaceToRow(workspace: Partial<Workspace>): Partial<WorkspaceRow> {
    const row: Partial<WorkspaceRow> = {};

    if (workspace.name !== undefined) row.name = workspace.name;
    if (workspace.icon !== undefined) row.icon = workspace.icon || null;
    if (workspace.enabled !== undefined) row.enabled = workspace.enabled ? 1 : 0;
    if (workspace.actions !== undefined) row.actions = JSON.stringify(workspace.actions);
    
    if (workspace.trigger !== undefined) {
      row.trigger_on_startup = workspace.trigger.onStartup ? 1 : 0;
      row.trigger_hotkey = workspace.trigger.hotkey || null;
      row.trigger_scheduled_time = workspace.trigger.scheduledTime || null;
    }

    return row;
  }

  /**
   * Get all workspaces
   */
  getAll(): Workspace[] {
    const stmt = this.db.prepare(`
      SELECT * FROM workspaces
      ORDER BY created_at DESC
    `);

    const rows = stmt.all() as WorkspaceRow[];
    return rows.map((row) => this.rowToWorkspace(row));
  }

  /**
   * Get workspace by ID
   */
  getById(id: string): Workspace | null {
    const stmt = this.db.prepare('SELECT * FROM workspaces WHERE id = ?');
    const row = stmt.get(id) as WorkspaceRow | undefined;

    return row ? this.rowToWorkspace(row) : null;
  }

  /**
   * Get all enabled workspaces
   */
  getEnabled(): Workspace[] {
    const stmt = this.db.prepare(`
      SELECT * FROM workspaces
      WHERE enabled = 1
      ORDER BY created_at DESC
    `);

    const rows = stmt.all() as WorkspaceRow[];
    return rows.map((row) => this.rowToWorkspace(row));
  }

  /**
   * Get workspaces that trigger on startup
   */
  getStartupWorkspaces(): Workspace[] {
    const stmt = this.db.prepare(`
      SELECT * FROM workspaces
      WHERE enabled = 1 AND trigger_on_startup = 1
      ORDER BY created_at ASC
    `);

    const rows = stmt.all() as WorkspaceRow[];
    return rows.map((row) => this.rowToWorkspace(row));
  }

  /**
   * Create a new workspace
   */
  create(workspace: Omit<Workspace, 'createdAt' | 'updatedAt'>): Workspace {
    const now = new Date().toISOString();
    const row = this.workspaceToRow(workspace);

    const stmt = this.db.prepare(`
      INSERT INTO workspaces (
        id, name, icon, enabled, actions,
        trigger_on_startup, trigger_hotkey, trigger_scheduled_time,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      workspace.id,
      row.name,
      row.icon,
      row.enabled,
      row.actions,
      row.trigger_on_startup,
      row.trigger_hotkey,
      row.trigger_scheduled_time,
      now,
      now
    );

    return {
      ...workspace,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Update a workspace
   */
  update(id: string, updates: Partial<Omit<Workspace, 'id' | 'createdAt' | 'updatedAt'>>): Workspace | null {
    const existing = this.getById(id);
    if (!existing) {
      return null;
    }

    const now = new Date().toISOString();
    const row = this.workspaceToRow(updates);

    const fields: string[] = [];
    const values: any[] = [];

    if (row.name !== undefined) {
      fields.push('name = ?');
      values.push(row.name);
    }
    if (row.icon !== undefined) {
      fields.push('icon = ?');
      values.push(row.icon);
    }
    if (row.enabled !== undefined) {
      fields.push('enabled = ?');
      values.push(row.enabled);
    }
    if (row.actions !== undefined) {
      fields.push('actions = ?');
      values.push(row.actions);
    }
    if (row.trigger_on_startup !== undefined) {
      fields.push('trigger_on_startup = ?');
      values.push(row.trigger_on_startup);
    }
    if (row.trigger_hotkey !== undefined) {
      fields.push('trigger_hotkey = ?');
      values.push(row.trigger_hotkey);
    }
    if (row.trigger_scheduled_time !== undefined) {
      fields.push('trigger_scheduled_time = ?');
      values.push(row.trigger_scheduled_time);
    }

    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE workspaces
      SET ${fields.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);

    return this.getById(id);
  }

  /**
   * Delete a workspace
   */
  delete(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM workspaces WHERE id = ?');
    const result = stmt.run(id);

    return result.changes > 0;
  }

  /**
   * Toggle workspace enabled status
   */
  toggleEnabled(id: string): Workspace | null {
    const workspace = this.getById(id);
    if (!workspace) {
      return null;
    }

    return this.update(id, { enabled: !workspace.enabled });
  }

  /**
   * Update workspace trigger settings
   */
  updateTrigger(id: string, trigger: Partial<WorkspaceTrigger>): Workspace | null {
    const workspace = this.getById(id);
    if (!workspace) {
      return null;
    }

    return this.update(id, {
      trigger: {
        ...workspace.trigger,
        ...trigger,
      },
    });
  }

  /**
   * Search workspaces by name
   */
  search(query: string): Workspace[] {
    const stmt = this.db.prepare(`
      SELECT * FROM workspaces
      WHERE name LIKE ?
      ORDER BY created_at DESC
    `);

    const rows = stmt.all(`%${query}%`) as WorkspaceRow[];
    return rows.map((row) => this.rowToWorkspace(row));
  }
}

// Made with Bob
