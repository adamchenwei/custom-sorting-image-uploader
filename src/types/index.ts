export interface WatchedFolder {
  id: string;
  uri: string;
  name: string;
  addedAt: number;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  filename?: string;
  folderUri?: string;
}

export interface UploadQueueItem {
  id: string;
  uri: string;
  filename: string;
  folderUri: string;
  status: 'pending' | 'uploading' | 'success' | 'failed';
  retryCount: number;
  addedAt: number;
  error?: string;
}

export interface AppConfig {
  serverUrl: string;
  deviceId: string;
  maxRetries: number;
  imageMaxWidth: number;
  imageMaxHeight: number;
  imageQuality: number;
}
