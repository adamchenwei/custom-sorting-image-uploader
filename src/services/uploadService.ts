import * as FileSystem from 'expo-file-system';
import { processImage } from './imageProcessor';
import { addLog, getConfig, updateUploadQueueItem, removeFromUploadQueue } from './storage';
import { UploadQueueItem } from '../types';

interface UploadUrlResponse {
  uploadUrl: string;
  key: string;
}

export async function getPresignedUploadUrl(
  serverUrl: string,
  filename: string,
  deviceId: string,
  contentType: string = 'image/webp'
): Promise<UploadUrlResponse> {
  const response = await fetch(`${serverUrl}/api/cloudfront/upload-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filename,
      contentType,
      deviceId,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get upload URL: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export async function uploadFileToS3(
  presignedUrl: string,
  fileUri: string,
  contentType: string = 'image/webp'
): Promise<void> {
  // Read file as base64
  const base64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: 'base64',
  });

  // Convert base64 to binary for upload
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const response = await fetch(presignedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
    },
    body: bytes,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload to S3: ${response.status}`);
  }
}

export async function processAndUploadImage(item: UploadQueueItem): Promise<boolean> {
  try {
    const config = await getConfig();

    await updateUploadQueueItem(item.id, { status: 'uploading' });

    await addLog({
      type: 'info',
      message: `Processing image: ${item.filename}`,
      filename: item.filename,
      folderUri: item.folderUri,
    });

    // Process the image (resize and compress)
    const processedImage = await processImage(item.uri, config);

    await addLog({
      type: 'info',
      message: `Image processed, getting upload URL...`,
      filename: item.filename,
    });

    // Get presigned URL from server
    const { uploadUrl } = await getPresignedUploadUrl(
      config.serverUrl,
      item.filename.replace(/\.[^/.]+$/, '.webp'), // Change extension to webp
      config.deviceId,
      'image/webp'
    );

    await addLog({
      type: 'info',
      message: `Uploading to S3...`,
      filename: item.filename,
    });

    // Upload to S3
    await uploadFileToS3(uploadUrl, processedImage.uri, 'image/webp');

    await addLog({
      type: 'success',
      message: `Successfully uploaded: ${item.filename}`,
      filename: item.filename,
      folderUri: item.folderUri,
    });

    // Remove from queue on success
    await removeFromUploadQueue(item.id);

    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    await addLog({
      type: 'error',
      message: `Failed to upload ${item.filename}: ${errorMessage}`,
      filename: item.filename,
      folderUri: item.folderUri,
    });

    const config = await getConfig();
    const newRetryCount = item.retryCount + 1;

    if (newRetryCount >= config.maxRetries) {
      await updateUploadQueueItem(item.id, {
        status: 'failed',
        retryCount: newRetryCount,
        error: errorMessage,
      });
    } else {
      await updateUploadQueueItem(item.id, {
        status: 'pending',
        retryCount: newRetryCount,
        error: errorMessage,
      });
    }

    return false;
  }
}
