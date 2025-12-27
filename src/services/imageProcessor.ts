import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { AppConfig } from '../types';

export interface ProcessedImage {
  uri: string;
  width: number;
  height: number;
  base64?: string;
}

export async function processImage(
  imageUri: string,
  config: Pick<AppConfig, 'imageMaxWidth' | 'imageMaxHeight' | 'imageQuality'>
): Promise<ProcessedImage> {
  try {
    // Get original image info
    const imageInfo = await FileSystem.getInfoAsync(imageUri);
    if (!imageInfo.exists) {
      throw new Error('Image file does not exist');
    }

    // Resize and compress the image
    const result = await ImageManipulator.manipulateAsync(
      imageUri,
      [
        {
          resize: {
            width: config.imageMaxWidth,
            height: config.imageMaxHeight,
          },
        },
      ],
      {
        compress: config.imageQuality / 100, // Convert from 0-100 to 0-1
        format: ImageManipulator.SaveFormat.WEBP,
        base64: true,
      }
    );

    return {
      uri: result.uri,
      width: result.width,
      height: result.height,
      base64: result.base64,
    };
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
}

export async function getImageMimeType(uri: string): Promise<string> {
  const extension = uri.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    case 'heic':
    case 'heif':
      return 'image/heic';
    default:
      return 'image/jpeg';
  }
}

export function isImageFile(filename: string): boolean {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif', 'bmp'];
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension ? imageExtensions.includes(extension) : false;
}
