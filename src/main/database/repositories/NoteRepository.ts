/**
 * Note Repository
 * Handles CRUD operations for notes with full-text search
 */

import Database from 'better-sqlite3';
import { Note, NoteRow } from '../../../shared/types/database';

export class NoteRepository {
  constructor(private db: Database.Database) {}

  /**
   * Convert database row to Note object
   */
  private rowToNote(row: NoteRow): Note {
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      category: row.category || undefined,
      tags: row.tags ? JSON.parse(row.tags) : [],
      pinned: row.pinned === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Convert Note object to database row format
   */
  private noteToRow(note: Partial<Note>): Partial<NoteRow> {
    const row: Partial<NoteRow> = {};

    if (note.title !== undefined) row.title = note.title;
    if (note.content !== undefined) row.content = note.content;
    if (note.category !== undefined) row.category = note.category || null;
    if (note.tags !== undefined) row.tags = JSON.stringify(note.tags);
    if (note.pinned !== undefined) row.pinned = note.pinned ? 1 : 0;

    return row;
  }

  /**
   * Get all notes
   */
  getAll(): Note[] {
    const stmt = this.db.prepare(`
      SELECT * FROM notes
      ORDER BY pinned DESC, updated_at DESC
    `);

    const rows = stmt.all() as NoteRow[];
    return rows.map((row) => this.rowToNote(row));
  }

  /**
   * Get note by ID
   */
  getById(id: string): Note | null {
    const stmt = this.db.prepare('SELECT * FROM notes WHERE id = ?');
    const row = stmt.get(id) as NoteRow | undefined;

    return row ? this.rowToNote(row) : null;
  }

  /**
   * Get pinned notes
   */
  getPinned(): Note[] {
    const stmt = this.db.prepare(`
      SELECT * FROM notes
      WHERE pinned = 1
      ORDER BY updated_at DESC
    `);

    const rows = stmt.all() as NoteRow[];
    return rows.map((row) => this.rowToNote(row));
  }

  /**
   * Get notes by category
   */
  getByCategory(category: string): Note[] {
    const stmt = this.db.prepare(`
      SELECT * FROM notes
      WHERE category = ?
      ORDER BY pinned DESC, updated_at DESC
    `);

    const rows = stmt.all(category) as NoteRow[];
    return rows.map((row) => this.rowToNote(row));
  }

  /**
   * Get all categories
   */
  getCategories(): string[] {
    const stmt = this.db.prepare(`
      SELECT DISTINCT category FROM notes
      WHERE category IS NOT NULL
      ORDER BY category ASC
    `);

    const rows = stmt.all() as { category: string }[];
    return rows.map((row) => row.category);
  }

  /**
   * Get notes by tag
   */
  getByTag(tag: string): Note[] {
    const stmt = this.db.prepare(`
      SELECT * FROM notes
      WHERE tags LIKE ?
      ORDER BY pinned DESC, updated_at DESC
    `);

    const rows = stmt.all(`%"${tag}"%`) as NoteRow[];
    return rows.map((row) => this.rowToNote(row));
  }

  /**
   * Search notes using full-text search
   */
  search(query: string): Note[] {
    try {
      // Try FTS search first
      const ftsStmt = this.db.prepare(`
        SELECT notes.* FROM notes
        INNER JOIN notes_fts ON notes.rowid = notes_fts.rowid
        WHERE notes_fts MATCH ?
        ORDER BY notes.pinned DESC, notes.updated_at DESC
      `);

      const rows = ftsStmt.all(query) as NoteRow[];
      return rows.map((row) => this.rowToNote(row));
    } catch (error) {
      // Fallback to LIKE search if FTS fails
      console.warn('[NoteRepository] FTS search failed, using LIKE fallback:', error);
      
      const likeStmt = this.db.prepare(`
        SELECT * FROM notes
        WHERE title LIKE ? OR content LIKE ?
        ORDER BY pinned DESC, updated_at DESC
      `);

      const searchTerm = `%${query}%`;
      const rows = likeStmt.all(searchTerm, searchTerm) as NoteRow[];
      return rows.map((row) => this.rowToNote(row));
    }
  }

  /**
   * Create a new note
   */
  create(note: Omit<Note, 'createdAt' | 'updatedAt'>): Note {
    const now = new Date().toISOString();
    const row = this.noteToRow(note);

    const stmt = this.db.prepare(`
      INSERT INTO notes (
        id, title, content, category, tags, pinned,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      note.id,
      row.title,
      row.content,
      row.category,
      row.tags,
      row.pinned,
      now,
      now
    );

    return {
      ...note,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Update a note
   */
  update(id: string, updates: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>): Note | null {
    const existing = this.getById(id);
    if (!existing) {
      return null;
    }

    const now = new Date().toISOString();
    const row = this.noteToRow(updates);

    const fields: string[] = [];
    const values: any[] = [];

    if (row.title !== undefined) {
      fields.push('title = ?');
      values.push(row.title);
    }
    if (row.content !== undefined) {
      fields.push('content = ?');
      values.push(row.content);
    }
    if (row.category !== undefined) {
      fields.push('category = ?');
      values.push(row.category);
    }
    if (row.tags !== undefined) {
      fields.push('tags = ?');
      values.push(row.tags);
    }
    if (row.pinned !== undefined) {
      fields.push('pinned = ?');
      values.push(row.pinned);
    }

    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE notes
      SET ${fields.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);

    return this.getById(id);
  }

  /**
   * Delete a note
   */
  delete(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM notes WHERE id = ?');
    const result = stmt.run(id);

    return result.changes > 0;
  }

  /**
   * Toggle note pinned status
   */
  togglePinned(id: string): Note | null {
    const note = this.getById(id);
    if (!note) {
      return null;
    }

    return this.update(id, { pinned: !note.pinned });
  }

  /**
   * Update note category
   */
  updateCategory(id: string, category: string | undefined): Note | null {
    return this.update(id, { category });
  }

  /**
   * Add tag to note
   */
  addTag(id: string, tag: string): Note | null {
    const note = this.getById(id);
    if (!note) {
      return null;
    }

    if (note.tags.includes(tag)) {
      return note;
    }

    const tags = [...note.tags, tag];
    return this.update(id, { tags });
  }

  /**
   * Remove tag from note
   */
  removeTag(id: string, tag: string): Note | null {
    const note = this.getById(id);
    if (!note) {
      return null;
    }

    const tags = note.tags.filter((t) => t !== tag);
    return this.update(id, { tags });
  }

  /**
   * Get all unique tags
   */
  getAllTags(): string[] {
    const stmt = this.db.prepare('SELECT tags FROM notes WHERE tags IS NOT NULL');
    const rows = stmt.all() as { tags: string }[];

    const tagsSet = new Set<string>();
    rows.forEach((row) => {
      try {
        const tags = JSON.parse(row.tags) as string[];
        tags.forEach((tag) => tagsSet.add(tag));
      } catch (error) {
        // Skip invalid JSON
      }
    });

    return Array.from(tagsSet).sort();
  }

  /**
   * Get note statistics
   */
  getStats(): {
    total: number;
    pinned: number;
    byCategory: Record<string, number>;
  } {
    const total = this.db.prepare('SELECT COUNT(*) as count FROM notes').get() as { count: number };
    const pinned = this.db.prepare('SELECT COUNT(*) as count FROM notes WHERE pinned = 1').get() as { count: number };
    
    const categoryStmt = this.db.prepare(`
      SELECT category, COUNT(*) as count
      FROM notes
      WHERE category IS NOT NULL
      GROUP BY category
    `);
    const categoryRows = categoryStmt.all() as { category: string; count: number }[];
    
    const byCategory: Record<string, number> = {};
    categoryRows.forEach((row) => {
      byCategory[row.category] = row.count;
    });

    return {
      total: total.count,
      pinned: pinned.count,
      byCategory,
    };
  }

  /**
   * Get recently updated notes
   */
  getRecent(limit: number = 10): Note[] {
    const stmt = this.db.prepare(`
      SELECT * FROM notes
      ORDER BY updated_at DESC
      LIMIT ?
    `);

    const rows = stmt.all(limit) as NoteRow[];
    return rows.map((row) => this.rowToNote(row));
  }
}

// Made with Bob
