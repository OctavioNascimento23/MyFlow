/**
 * Startup Service
 * Handles automatic execution of workspaces on application startup
 */

import { getDb } from '../database';
import { LauncherService } from './LauncherService';
import { v4 as uuidv4 } from 'uuid';
import { AutomationLog } from '../../shared/types/database';

export class StartupService {
  private launcherService: LauncherService;
  private startupDelay: number = 3000; // 3 seconds default delay

  constructor() {
    this.launcherService = new LauncherService();
  }

  /**
   * Set the delay before executing startup workspaces
   */
  setStartupDelay(milliseconds: number) {
    this.startupDelay = milliseconds;
  }

  /**
   * Execute all workspaces that are configured to run on startup
   */
  async executeStartupWorkspaces(): Promise<void> {
    try {
      console.log('[Startup] Checking for startup workspaces...');

      // Wait for the configured delay
      await this.delay(this.startupDelay);

      const db = getDb();
      const workspaceRepo = db.workspaces;
      const logRepo = db.automationLogs;

      // Get all workspaces that should run on startup
      const startupWorkspaces = workspaceRepo.getStartupWorkspaces();

      if (startupWorkspaces.length === 0) {
        console.log('[Startup] No startup workspaces found');
        return;
      }

      console.log(`[Startup] Found ${startupWorkspaces.length} startup workspace(s)`);

      // Execute each workspace sequentially
      for (const workspace of startupWorkspaces) {
        console.log(`[Startup] Executing workspace: ${workspace.name}`);

        let hasErrors = false;
        let errorMessage = '';

        // Execute each action in the workspace
        for (let i = 0; i < workspace.actions.length; i++) {
          const action = workspace.actions[i];
          console.log(`[Startup] Executing action ${i + 1}/${workspace.actions.length}:`, action.type);

          const result = await this.launcherService.executeAction(action);

          if (!result.success) {
            hasErrors = true;
            errorMessage += `Action ${i + 1} (${action.type}) failed: ${result.error}\n`;
            console.error(`[Startup] Action failed:`, result.error);
          }
        }

        // Log the execution
        const log: AutomationLog = {
          id: uuidv4(),
          workspaceId: workspace.id,
          status: hasErrors ? 'error' : 'success',
          errorMessage: hasErrors ? errorMessage : undefined,
          executedAt: new Date().toISOString(),
        };

        logRepo.create(log);

        if (hasErrors) {
          console.error(`[Startup] Workspace "${workspace.name}" completed with errors`);
        } else {
          console.log(`[Startup] Workspace "${workspace.name}" executed successfully`);
        }

        // Add a small delay between workspaces
        await this.delay(1000);
      }

      console.log('[Startup] All startup workspaces executed');
    } catch (error) {
      console.error('[Startup] Error executing startup workspaces:', error);
    }
  }

  /**
   * Helper method to create a delay
   */
  private delay(milliseconds: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, milliseconds);
    });
  }
}

// Made with Bob