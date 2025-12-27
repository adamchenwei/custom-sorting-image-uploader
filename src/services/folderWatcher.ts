import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { WatchedFolder, UploadQueueItem } from '../types';
import {
  getWatchedFolders,
  addToUploadQueue,
  getUploadQueue,
  addLog,
  getConfig,
  removeFromUploadQueue
} from './storage';
import { isImageFile } from './imageProcessor';
import {
  processAndUploadImage
} from './uploadService';
import {
  showUploadingNotification,
  showUploadSuccessNotification,
  showUploadFailedNotification,
  dismissNotification,
} from './notificationService';

let watcherInterval: ReturnType<typeof setInterval> | null = null;
let isProcessingQueue = false;
const processedAssets = new Set<string>();

export async function requestMediaLibraryPermissions(): Promise<boolean> {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  return status === 'granted';
}

export async function getAlbums(): Promise<MediaLibrary.Album[]> {
  const hasPermission = await requestMediaLibraryPermissions();
  if (!hasPermission) {
    throw new Error('Media library permission not granted');
  }

  const albums = await MediaLibrary.getAlbumsAsync({
    includeSmartAlbums: true,
  });

  return albums;
}

export async function checkForNewImages(folders: WatchedFolder[]): Promise<void> {
  for (const folder of folders) {
    try {
      // Get assets from the album
      const album = await MediaLibrary.getAlbumAsync(folder.name);
      if (!album) {
        continue;
      }

      const { assets } = await MediaLibrary.getAssetsAsync({
        album: album,
        mediaType: MediaLibrary.MediaType.photo,
        sortBy: [[MediaLibrary.SortBy.creationTime, false]],
        first: 50, // Get latest 50 images
      });

      for (const asset of assets) {
        // Skip already processed assets
        if (processedAssets.has(asset.id)) {
          continue;
        }

        // Check if already in queue
        const queue = await getUploadQueue();
        const inQueue = queue.some(q => q.uri === asset.uri);
        if (inQueue) {
          processedAssets.add(asset.id);
          continue;
        }

        // Only process image files
        if (!isImageFile(asset.filename)) {
          continue;
        }

        // Add to upload queue
        await addToUploadQueue({
          uri: asset.uri,
          filename: asset.filename,
          folderUri: folder.uri,
        });

        await addLog({
          type: 'info',
          message: `New image detected: ${asset.filename}`,
          filename: asset.filename,
          folderUri: folder.uri,
        });

        processedAssets.add(asset.id);
      }
    } catch (error) {
      console.error(`Error checking folder ${folder.name}:`, error);
      await addLog({
        type: 'error',
        message: `Error checking folder ${folder.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        folderUri: folder.uri,
      });
    }
  }
}

export async function processUploadQueue(): Promise<void> {
  if (isProcessingQueue) {
    return;
  }

  isProcessingQueue = true;

  try {
    const queue = await getUploadQueue();
    const pendingItems = queue.filter(item => item.status === 'pending');

    for (const item of pendingItems) {
      let notificationId: string | null = null;

      try {
        notificationId = await showUploadingNotification(item.filename);
        const success = await processAndUploadImage(item);

        if (notificationId) {
          await dismissNotification(notificationId);
        }

        if (success) {
          await showUploadSuccessNotification(item.filename);

          // Delete the original file after successful upload
          await deleteOriginalFile(item.uri);
        } else {
          await showUploadFailedNotification(item.filename);
        }
      } catch (error) {
        if (notificationId) {
          await dismissNotification(notificationId);
        }
        await showUploadFailedNotification(
          item.filename,
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    }
  } finally {
    isProcessingQueue = false;
  }
}

async function deleteOriginalFile(assetUri: string): Promise<void> {
  try {
    // For MediaLibrary assets, we need to delete through MediaLibrary
    const asset = await MediaLibrary.getAssetInfoAsync(assetUri);
    if (asset) {
      await MediaLibrary.deleteAssetsAsync([asset.id]);
      await addLog({
        type: 'info',
        message: `Deleted original file after upload: ${asset.filename}`,
        filename: asset.filename,
      });
    }
  } catch (error) {
    console.error('Error deleting original file:', error);
    await addLog({
      type: 'warning',
      message: `Could not delete original file: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
}

export async function startFolderWatcher(): Promise<void> {
  if (watcherInterval) {
    return; // Already running
  }

  await addLog({
    type: 'info',
    message: 'Folder watcher started',
  });

  // Check immediately
  const folders = await getWatchedFolders();
  await checkForNewImages(folders);
  await processUploadQueue();

  // Then check every 10 seconds
  watcherInterval = setInterval(async () => {
    const folders = await getWatchedFolders();
    await checkForNewImages(folders);
    await processUploadQueue();
  }, 10000);
}

export async function stopFolderWatcher(): Promise<void> {
  if (watcherInterval) {
    clearInterval(watcherInterval);
    watcherInterval = null;

    await addLog({
      type: 'info',
      message: 'Folder watcher stopped',
    });
  }
}

export function isWatcherRunning(): boolean {
  return watcherInterval !== null;
}
