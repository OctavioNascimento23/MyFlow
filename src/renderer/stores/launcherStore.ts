/**
 * Launcher Store
 * Manages workspace state and operations
 */

import { create } from 'zustand';
import { Workspace } from '../../shared/types/database';

interface LauncherState {
  workspaces: Workspace[];
  loading: boolean;
  error: string | null;
  executingWorkspaceId: string | null;

  // Actions
  fetchWorkspaces: () => Promise<void>;
  createWorkspace: (workspace: Omit<Workspace, 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  executeWorkspace: (id: string) => Promise<void>;
  toggleWorkspace: (id: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useLauncherStore = create<LauncherState>((set, get) => ({
  workspaces: [],
  loading: false,
  error: null,
  executingWorkspaceId: null,

  setError: (error) => set({ error }),

  fetchWorkspaces: async () => {
    set({ loading: true, error: null });
    try {
      const result = await window.electronAPI.database.workspaces.getAll();
      
      if (result.success) {
        set({ workspaces: result.data, loading: false });
      } else {
        set({ error: result.error, loading: false });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch workspaces',
        loading: false 
      });
    }
  },

  createWorkspace: async (workspace) => {
    set({ loading: true, error: null });
    try {
      const result = await window.electronAPI.database.workspaces.create(workspace);
      
      if (result.success) {
        // Refresh workspaces list
        await get().fetchWorkspaces();
      } else {
        set({ error: result.error, loading: false });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create workspace',
        loading: false 
      });
    }
  },

  updateWorkspace: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const result = await window.electronAPI.database.workspaces.update(id, updates);
      
      if (result.success) {
        // Refresh workspaces list
        await get().fetchWorkspaces();
      } else {
        set({ error: result.error, loading: false });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update workspace',
        loading: false 
      });
    }
  },

  deleteWorkspace: async (id) => {
    set({ loading: true, error: null });
    try {
      const result = await window.electronAPI.database.workspaces.delete(id);
      
      if (result.success) {
        // Refresh workspaces list
        await get().fetchWorkspaces();
      } else {
        set({ error: result.error, loading: false });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete workspace',
        loading: false 
      });
    }
  },

  executeWorkspace: async (id) => {
    set({ executingWorkspaceId: id, error: null });
    try {
      const result = await window.electronAPI.launcher.executeWorkspace(id);
      
      if (!result.success) {
        set({ error: result.error, executingWorkspaceId: null });
      } else {
        set({ executingWorkspaceId: null });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to execute workspace',
        executingWorkspaceId: null 
      });
    }
  },

  toggleWorkspace: async (id) => {
    set({ loading: true, error: null });
    try {
      const result = await window.electronAPI.database.workspaces.toggleEnabled(id);
      
      if (result.success) {
        // Refresh workspaces list
        await get().fetchWorkspaces();
      } else {
        set({ error: result.error, loading: false });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to toggle workspace',
        loading: false 
      });
    }
  },
}));

// Made with Bob