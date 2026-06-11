// Shared types between main and renderer processes

export interface AppInfo {
  version: string;
  name: string;
  platform: string;
}

export interface WorkspaceItem {
  id: string;
  name: string;
  type: 'app' | 'url';
  path: string;
  icon?: string;
  order: number;
}

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  sound?: boolean;
  actions?: Array<{
    type: string;
    text: string;
  }>;
}

export interface SystemSettings {
  startOnBoot: boolean;
  minimizeToTray: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
}

// Made with Bob
