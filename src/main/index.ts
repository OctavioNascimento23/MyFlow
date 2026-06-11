import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { initDatabase, closeDb } from './database';
import { registerDatabaseHandlers } from './ipc/database-handlers';
import { registerLauncherHandlers } from './ipc/launcher-handlers';
import { StartupService } from './services/StartupService';

let mainWindow: BrowserWindow | null = null;
let startupService: StartupService | null = null;

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    frame: true,
    backgroundColor: '#ffffff',
    show: false,
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    
    // Execute startup workspaces after window is ready
    if (startupService) {
      startupService.executeStartupWorkspaces().catch((error) => {
        console.error('[Main] Error executing startup workspaces:', error);
      });
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(() => {
  // Initialize database
  console.log('[Main] Initializing database...');
  try {
    initDatabase();
    console.log('[Main] Database initialized successfully');
  } catch (error) {
    console.error('[Main] Failed to initialize database:', error);
  }

  // Register database IPC handlers
  registerDatabaseHandlers();
  
  // Register launcher IPC handlers
  registerLauncherHandlers();
  
  // Initialize startup service
  startupService = new StartupService();
  console.log('[Main] Startup service initialized');

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  // Close database connection before quitting
  console.log('[Main] Closing database...');
  closeDb();
});

// Basic IPC handlers
ipcMain.handle('app:getVersion', () => {
  return app.getVersion();
});

ipcMain.handle('app:getPath', (_event, name: string) => {
  return app.getPath(name as any);
});

// Made with Bob
