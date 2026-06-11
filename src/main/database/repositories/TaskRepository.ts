/**
 * Task Repository
 * Handles CRUD operations for tasks
 */

import Database from 'better-sqlite3';
import { Task, TaskRow, TaskPriority, Subtask } from '../../../shared/types/database';

export class TaskRepository {
  constructor(private db: Database.Database) {}

  /**
   * Convert database row to Task object
   */
  private rowToTask(row: TaskRow): Task {
    return {
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      priority: row.priority as TaskPriority,
      deadline: row.deadline || undefined,
      estimatedMinutes: row.estimated_minutes || undefined,
      tags: row.tags ? JSON.parse(row.tags) : [],
      subtasks: row.subtasks ? JSON.parse(row.subtasks) : [],
      completed: row.completed === 1,
      completedAt: row.completed_at || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Convert Task object to database row format
   */
  private taskToRow(task: Partial<Task>): Partial<TaskRow> {
    const row: Partial<TaskRow> = {};

    if (task.title !== undefined) row.title = task.title;
    if (task.description !== undefined) row.description = task.description || null;
    if (task.priority !== undefined) row.priority = task.priority;
    if (task.deadline !== undefined) row.deadline = task.deadline || null;
    if (task.estimatedMinutes !== undefined) row.estimated_minutes = task.estimatedMinutes || null;
    if (task.tags !== undefined) row.tags = JSON.stringify(task.tags);
    if (task.subtasks !== undefined) row.subtasks = JSON.stringify(task.subtasks);
    if (task.completed !== undefined) row.completed = task.completed ? 1 : 0;
    if (task.completedAt !== undefined) row.completed_at = task.completedAt || null;

    return row;
  }

  /**
   * Get all tasks
   */
  getAll(): Task[] {
    const stmt = this.db.prepare(`
      SELECT * FROM tasks
      ORDER BY 
        CASE priority
          WHEN 'urgent_important' THEN 1
          WHEN 'not_urgent_important' THEN 2
          WHEN 'urgent_not_important' THEN 3
          WHEN 'not_urgent_not_important' THEN 4
        END,
        created_at DESC
    `);

    const rows = stmt.all() as TaskRow[];
    return rows.map((row) => this.rowToTask(row));
  }

  /**
   * Get task by ID
   */
  getById(id: string): Task | null {
    const stmt = this.db.prepare('SELECT * FROM tasks WHERE id = ?');
    const row = stmt.get(id) as TaskRow | undefined;

    return row ? this.rowToTask(row) : null;
  }

  /**
   * Get tasks by priority
   */
  getByPriority(priority: TaskPriority): Task[] {
    const stmt = this.db.prepare(`
      SELECT * FROM tasks
      WHERE priority = ?
      ORDER BY created_at DESC
    `);

    const rows = stmt.all(priority) as TaskRow[];
    return rows.map((row) => this.rowToTask(row));
  }

  /**
   * Get completed tasks
   */
  getCompleted(): Task[] {
    const stmt = this.db.prepare(`
      SELECT * FROM tasks
      WHERE completed = 1
      ORDER BY completed_at DESC
    `);

    const rows = stmt.all() as TaskRow[];
    return rows.map((row) => this.rowToTask(row));
  }

  /**
   * Get incomplete tasks
   */
  getIncomplete(): Task[] {
    const stmt = this.db.prepare(`
      SELECT * FROM tasks
      WHERE completed = 0
      ORDER BY 
        CASE priority
          WHEN 'urgent_important' THEN 1
          WHEN 'not_urgent_important' THEN 2
          WHEN 'urgent_not_important' THEN 3
          WHEN 'not_urgent_not_important' THEN 4
        END,
        deadline ASC,
        created_at DESC
    `);

    const rows = stmt.all() as TaskRow[];
    return rows.map((row) => this.rowToTask(row));
  }

  /**
   * Get tasks with upcoming deadlines
   */
  getUpcoming(days: number = 7): Task[] {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);

    const stmt = this.db.prepare(`
      SELECT * FROM tasks
      WHERE completed = 0
        AND deadline IS NOT NULL
        AND deadline >= ?
        AND deadline <= ?
      ORDER BY deadline ASC
    `);

    const rows = stmt.all(now.toISOString(), future.toISOString()) as TaskRow[];
    return rows.map((row) => this.rowToTask(row));
  }

  /**
   * Get overdue tasks
   */
  getOverdue(): Task[] {
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      SELECT * FROM tasks
      WHERE completed = 0
        AND deadline IS NOT NULL
        AND deadline < ?
      ORDER BY deadline ASC
    `);

    const rows = stmt.all(now) as TaskRow[];
    return rows.map((row) => this.rowToTask(row));
  }

  /**
   * Create a new task
   */
  create(task: Omit<Task, 'createdAt' | 'updatedAt'>): Task {
    const now = new Date().toISOString();
    const row = this.taskToRow(task);

    const stmt = this.db.prepare(`
      INSERT INTO tasks (
        id, title, description, priority, deadline, estimated_minutes,
        tags, subtasks, completed, completed_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      task.id,
      row.title,
      row.description,
      row.priority,
      row.deadline,
      row.estimated_minutes,
      row.tags,
      row.subtasks,
      row.completed,
      row.completed_at,
      now,
      now
    );

    return {
      ...task,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Update a task
   */
  update(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Task | null {
    const existing = this.getById(id);
    if (!existing) {
      return null;
    }

    const now = new Date().toISOString();
    const row = this.taskToRow(updates);

    const fields: string[] = [];
    const values: any[] = [];

    if (row.title !== undefined) {
      fields.push('title = ?');
      values.push(row.title);
    }
    if (row.description !== undefined) {
      fields.push('description = ?');
      values.push(row.description);
    }
    if (row.priority !== undefined) {
      fields.push('priority = ?');
      values.push(row.priority);
    }
    if (row.deadline !== undefined) {
      fields.push('deadline = ?');
      values.push(row.deadline);
    }
    if (row.estimated_minutes !== undefined) {
      fields.push('estimated_minutes = ?');
      values.push(row.estimated_minutes);
    }
    if (row.tags !== undefined) {
      fields.push('tags = ?');
      values.push(row.tags);
    }
    if (row.subtasks !== undefined) {
      fields.push('subtasks = ?');
      values.push(row.subtasks);
    }
    if (row.completed !== undefined) {
      fields.push('completed = ?');
      values.push(row.completed);
    }
    if (row.completed_at !== undefined) {
      fields.push('completed_at = ?');
      values.push(row.completed_at);
    }

    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE tasks
      SET ${fields.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);

    return this.getById(id);
  }

  /**
   * Delete a task
   */
  delete(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM tasks WHERE id = ?');
    const result = stmt.run(id);

    return result.changes > 0;
  }

  /**
   * Toggle task completion status
   */
  toggleComplete(id: string): Task | null {
    const task = this.getById(id);
    if (!task) {
      return null;
    }

    const now = new Date().toISOString();
    return this.update(id, {
      completed: !task.completed,
      completedAt: !task.completed ? now : undefined,
    });
  }

  /**
   * Update task priority
   */
  updatePriority(id: string, priority: TaskPriority): Task | null {
    return this.update(id, { priority });
  }

  /**
   * Add a subtask
   */
  addSubtask(id: string, subtask: Subtask): Task | null {
    const task = this.getById(id);
    if (!task) {
      return null;
    }

    const subtasks = [...task.subtasks, subtask];
    return this.update(id, { subtasks });
  }

  /**
   * Update a subtask
   */
  updateSubtask(id: string, subtaskId: string, updates: Partial<Subtask>): Task | null {
    const task = this.getById(id);
    if (!task) {
      return null;
    }

    const subtasks = task.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, ...updates } : st
    );

    return this.update(id, { subtasks });
  }

  /**
   * Delete a subtask
   */
  deleteSubtask(id: string, subtaskId: string): Task | null {
    const task = this.getById(id);
    if (!task) {
      return null;
    }

    const subtasks = task.subtasks.filter((st) => st.id !== subtaskId);
    return this.update(id, { subtasks });
  }

  /**
   * Search tasks by title or description
   */
  search(query: string): Task[] {
    const stmt = this.db.prepare(`
      SELECT * FROM tasks
      WHERE title LIKE ? OR description LIKE ?
      ORDER BY created_at DESC
    `);

    const searchTerm = `%${query}%`;
    const rows = stmt.all(searchTerm, searchTerm) as TaskRow[];
    return rows.map((row) => this.rowToTask(row));
  }

  /**
   * Get tasks by tag
   */
  getByTag(tag: string): Task[] {
    const stmt = this.db.prepare(`
      SELECT * FROM tasks
      WHERE tags LIKE ?
      ORDER BY created_at DESC
    `);

    const rows = stmt.all(`%"${tag}"%`) as TaskRow[];
    return rows.map((row) => this.rowToTask(row));
  }

  /**
   * Get task statistics
   */
  getStats(): {
    total: number;
    completed: number;
    incomplete: number;
    overdue: number;
  } {
    const now = new Date().toISOString();

    const total = this.db.prepare('SELECT COUNT(*) as count FROM tasks').get() as { count: number };
    const completed = this.db.prepare('SELECT COUNT(*) as count FROM tasks WHERE completed = 1').get() as { count: number };
    const incomplete = this.db.prepare('SELECT COUNT(*) as count FROM tasks WHERE completed = 0').get() as { count: number };
    const overdue = this.db.prepare(
      'SELECT COUNT(*) as count FROM tasks WHERE completed = 0 AND deadline IS NOT NULL AND deadline < ?'
    ).get(now) as { count: number };

    return {
      total: total.count,
      completed: completed.count,
      incomplete: incomplete.count,
      overdue: overdue.count,
    };
  }
}

// Made with Bob
