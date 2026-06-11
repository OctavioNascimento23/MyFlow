/**
 * Launcher Service
 * Handles execution of workspace actions (apps, URLs, delays, notifications)
 */

import { spawn } from 'child_process';
import { shell } from 'electron';
import { existsSync } from 'fs';
import { WorkspaceAction } from '../../shared/types/database';

export class LauncherService {
  /**
   * Execute a single workspace action
   */
  async executeAction(action: WorkspaceAction): Promise<{ success: boolean; error?: string }> {
    try {
      switch (action.type) {
        case 'open_app':
          return await this.openApp(action.path!);
        
        case 'open_url':
          return await this.openUrl(action.url!, action.browser);
        
        case 'wait':
          return await this.wait(action.delay || 1000);
        
        case 'notification':
          return await this.showNotification(action.message || 'Notification');
        
        case 'open_folder':
          return await this.openFolder(action.path!);
        
        default:
          return { success: false, error: `Unknown action type: ${action.type}` };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Open an application
   */
  private async openApp(appPath: string): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      try {
        // Check if file exists
        if (!existsSync(appPath)) {
          resolve({ success: false, error: `Application not found: ${appPath}` });
          return;
        }

        // Handle different file types
        const isShortcut = appPath.toLowerCase().endsWith('.lnk');
        const isExecutable = appPath.toLowerCase().endsWith('.exe');

        if (isShortcut || isExecutable) {
          // Use spawn for .exe and .lnk files
          const child = spawn(appPath, [], {
            detached: true,
            stdio: 'ignore',
            shell: true,
          });

          child.unref();

          // Give it a moment to start
          setTimeout(() => {
            resolve({ success: true });
          }, 500);
        } else {
          // For other file types, use shell.openPath
          shell.openPath(appPath).then((error) => {
            if (error) {
              resolve({ success: false, error });
            } else {
              resolve({ success: true });
            }
          });
        }
      } catch (error) {
        resolve({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to open application',
        });
      }
    });
  }

  /**
   * Open a URL in browser
   */
  private async openUrl(url: string, browser?: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate URL
      if (!this.isValidUrl(url)) {
        return { success: false, error: 'Invalid URL format' };
      }

      // If specific browser is requested, try to open with that browser
      if (browser && browser !== 'default') {
        const browserPath = this.getBrowserPath(browser);
        if (browserPath) {
          return await this.openApp(browserPath + ' ' + url);
        }
      }

      // Use default browser
      await shell.openExternal(url);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to open URL',
      };
    }
  }

  /**
   * Wait/delay for specified milliseconds
   */
  private async wait(milliseconds: number): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, milliseconds);
    });
  }

  /**
   * Show a notification (placeholder - will be implemented with Electron notifications)
   */
  private async showNotification(message: string): Promise<{ success: boolean; error?: string }> {
    try {
      // This will be implemented with Electron's Notification API
      console.log('[Launcher] Notification:', message);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to show notification',
      };
    }
  }

  /**
   * Open a folder in file explorer
   */
  private async openFolder(folderPath: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!existsSync(folderPath)) {
        return { success: false, error: `Folder not found: ${folderPath}` };
      }

      await shell.openPath(folderPath);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to open folder',
      };
    }
  }

  /**
   * Check if app is already running (Windows-specific)
   */
  async isAppRunning(appName: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const child = spawn('tasklist', [], { shell: true });
        let output = '';

        child.stdout.on('data', (data) => {
          output += data.toString();
        });

        child.on('close', () => {
          const isRunning = output.toLowerCase().includes(appName.toLowerCase());
          resolve(isRunning);
        });

        child.on('error', () => {
          resolve(false);
        });
      } catch {
        resolve(false);
      }
    });
  }

  /**
   * Check if a file/path exists
   */
  checkPathExists(path: string): boolean {
    return existsSync(path);
  }

  /**
   * Validate URL format
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get browser executable path (Windows-specific)
   */
  private getBrowserPath(browser: string): string | null {
    const browserPaths: Record<string, string> = {
      chrome: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      firefox: 'C:\\Program Files\\Mozilla Firefox\\firefox.exe',
      edge: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    };

    const path = browserPaths[browser.toLowerCase()];
    return path && existsSync(path) ? path : null;
  }
}

// Made with Bob