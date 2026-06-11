/**
 * Launcher IPC Handlers
 * Handles IPC communication for workspace execution
 */

import { ipcMain, dialog } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../database';
import { LauncherService } from '../services/LauncherService';
import { WorkspaceAction, AutomationLog, DatabaseResult } from '../../shared/types/database';

const launcherService = new LauncherService();

/**
 * Register all launcher-related IPC handlers
 */
export function registerLauncherHandlers() {
  // Execute a complete workspace
  ipcMain.handle('launcher:execute-workspace', async (_event, workspaceId: string): Promise<DatabaseResult<void>> => {
    try {
      const db = getDb();
      const workspaceRepo = db.workspaces;
      const logRepo = db.automationLogs;

      // Get workspace
      const workspace = workspaceRepo.getById(workspaceId);
      if (!workspace) {
        return { success: false, error: 'Workspace not found' };
      }

      if (!workspace.enabled) {
        return { success: false, error: 'Workspace is disabled' };
      }

      console.log(`[Launcher] Executing workspace: ${workspace.name}`);

      let hasErrors = false;
      let errorMessage = '';

      // Execute each action sequentially
      for (let i = 0; i < workspace.actions.length; i++) {
        const action = workspace.actions[i];
        console.log(`[Launcher] Executing action ${i + 1}/${workspace.actions.length}:`, action.type);

        const result = await launcherService.executeAction(action);

        if (!result.success) {
          hasErrors = true;
          errorMessage += `Action ${i + 1} (${action.type}) failed: ${result.error}\n`;
          console.error(`[Launcher] Action failed:`, result.error);
        }
      }

      // Log execution
      const log: AutomationLog = {
        id: uuidv4(),
        workspaceId: workspace.id,
        status: hasErrors ? 'error' : 'success',
        errorMessage: hasErrors ? errorMessage : undefined,
        executedAt: new Date().toISOString(),
      };

      logRepo.create(log);

      if (hasErrors) {
        return { success: false, error: errorMessage };
      }

      console.log(`[Launcher] Workspace executed successfully: ${workspace.name}`);
      return { success: true, data: undefined };
    } catch (error) {
      console.error('[Launcher] Error executing workspace:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  // Test a single action
  ipcMain.handle('launcher:test-action', async (_event, action: WorkspaceAction): Promise<DatabaseResult<void>> => {
    try {
      console.log('[Launcher] Testing action:', action.type);
      const result = await launcherService.executeAction(action);

      if (!result.success) {
        return { success: false, error: result.error };
      }

      return { success: true, data: undefined };
    } catch (error) {
      console.error('[Launcher] Error testing action:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  // Check if an app path exists
  ipcMain.handle('launcher:check-app-exists', async (_event, path: string): Promise<boolean> => {
    try {
      return launcherService.checkPathExists(path);
    } catch (error) {
      console.error('[Launcher] Error checking app path:', error);
      return false;
    }
  });

  // Browse for an application
  ipcMain.handle('launcher:browse-for-app', async (_event): Promise<string | null> => {
    try {
      const result = await dialog.showOpenDialog({
        title: 'Select Application',
        properties: ['openFile'],
        filters: [
          { name: 'Applications', extensions: ['exe', 'lnk'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      });

      if (result.canceled || result.filePaths.length === 0) {
        return null;
      }

      return result.filePaths[0];
    } catch (error) {
      console.error('[Launcher] Error browsing for app:', error);
      return null;
    }
  });

  // Browse for a folder
  ipcMain.handle('launcher:browse-for-folder', async (_event): Promise<string | null> => {
    try {
      const result = await dialog.showOpenDialog({
        title: 'Select Folder',
        properties: ['openDirectory'],
      });

      if (result.canceled || result.filePaths.length === 0) {
        return null;
      }

      return result.filePaths[0];
    } catch (error) {
      console.error('[Launcher] Error browsing for folder:', error);
      return null;
    }
  });

  // Check if an app is running
  ipcMain.handle('launcher:is-app-running', async (_event, appName: string): Promise<boolean> => {
    try {
      return await launcherService.isAppRunning(appName);
    } catch (error) {
      console.error('[Launcher] Error checking if app is running:', error);
      return false;
    }
  });

  console.log('[IPC] Launcher handlers registered');
}

// Made with Bob