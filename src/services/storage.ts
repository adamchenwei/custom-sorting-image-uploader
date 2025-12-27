import AsyncStorage from '@react-native-async-storage/async-storage';
import { WatchedFolder, LogEntry, AppConfig, UploadQueueItem } from '../types';

const STORAGE_KEYS = {
  WATCHED_FOLDERS: '@watched_folders',
  LOGS: '@logs',
  CONFIG: '@config',
  UPLOAD_QUEUE: '@upload_queue',
};

const DEFAULT_CONFIG: AppConfig = {
  serverUrl: 'https://your-server-url.com', // User must configure this
  deviceId: `device_${Date.now()}`,
  maxRetries: 3,
  imageMaxWidth: 300,
  imageMaxHeight: 300,
  imageQuality: 20,
};

// Watched Folders
export async function getWatchedFolders(): Promise<WatchedFolder[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.WATCHED_FOLDERS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting watched folders:', error);
    return [];
  }
}

export async function saveWatchedFolders(folders: WatchedFolder[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.WATCHED_FOLDERS, JSON.stringify(folders));
  } catch (error) {
    console.error('Error saving watched folders:', error);
  }
}

export async function addWatchedFolder(folder: WatchedFolder): Promise<void> {
  const folders = await getWatchedFolders();
  const exists = folders.some(f => f.uri === folder.uri);
  if (!exists) {
    folders.push(folder);
    await saveWatchedFolders(folders);
  }
}

export async function removeWatchedFolder(folderId: string): Promise<void> {
  const folders = await getWatchedFolders();
  const filtered = folders.filter(f => f.id !== folderId);
  await saveWatchedFolders(filtered);
}

// Logs
export async function getLogs(): Promise<LogEntry[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.LOGS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting logs:', error);
    return [];
  }
}

export async function saveLogs(logs: LogEntry[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  } catch (error) {
    console.error('Error saving logs:', error);
  }
}

export async function addLog(log: Omit<LogEntry, 'id' | 'timestamp'>): Promise<void> {
  const logs = await getLogs();
  const newLog: LogEntry = {
    ...log,
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
  };
  logs.unshift(newLog); // Add to beginning
  // Keep only last 1000 logs
  const trimmedLogs = logs.slice(0, 1000);
  await saveLogs(trimmedLogs);
}

export async function clearLogs(): Promise<void> {
  await saveLogs([]);
}

// Config
export async function getConfig(): Promise<AppConfig> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CONFIG);
    if (data) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    }
    return DEFAULT_CONFIG;
  } catch (error) {
    console.error('Error getting config:', error);
    return DEFAULT_CONFIG;
  }
}

export async function saveConfig(config: Partial<AppConfig>): Promise<void> {
  try {
    const currentConfig = await getConfig();
    const newConfig = { ...currentConfig, ...config };
    await AsyncStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(newConfig));
  } catch (error) {
    console.error('Error saving config:', error);
  }
}

// Upload Queue
export async function getUploadQueue(): Promise<UploadQueueItem[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.UPLOAD_QUEUE);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting upload queue:', error);
    return [];
  }
}

export async function saveUploadQueue(queue: UploadQueueItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.UPLOAD_QUEUE, JSON.stringify(queue));
  } catch (error) {
    console.error('Error saving upload queue:', error);
  }
}

export async function addToUploadQueue(item: Omit<UploadQueueItem, 'id' | 'addedAt' | 'status' | 'retryCount'>): Promise<void> {
  const queue = await getUploadQueue();
  const exists = queue.some(q => q.uri === item.uri);
  if (!exists) {
    queue.push({
      ...item,
      id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      retryCount: 0,
      addedAt: Date.now(),
    });
    await saveUploadQueue(queue);
  }
}

export async function updateUploadQueueItem(id: string, updates: Partial<UploadQueueItem>): Promise<void> {
  const queue = await getUploadQueue();
  const index = queue.findIndex(q => q.id === id);
  if (index !== -1) {
    queue[index] = { ...queue[index], ...updates };
    await saveUploadQueue(queue);
  }
}

export async function removeFromUploadQueue(id: string): Promise<void> {
  const queue = await getUploadQueue();
  const filtered = queue.filter(q => q.id !== id);
  await saveUploadQueue(filtered);
}
