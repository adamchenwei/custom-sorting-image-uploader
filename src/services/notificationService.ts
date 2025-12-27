import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('uploads', {
      name: 'Upload Notifications',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

export async function showUploadingNotification(filename: string): Promise<string> {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Uploading Image',
      body: `Uploading ${filename}...`,
      data: { type: 'uploading', filename },
    },
    trigger: null,
  });
  return notificationId;
}

export async function showUploadSuccessNotification(filename: string): Promise<string> {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Upload Complete',
      body: `Successfully uploaded ${filename}`,
      data: { type: 'success', filename },
    },
    trigger: null,
  });
  return notificationId;
}

export async function showUploadFailedNotification(filename: string, error?: string): Promise<string> {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Upload Failed',
      body: `Failed to upload ${filename}${error ? `: ${error}` : ''}`,
      data: { type: 'failed', filename },
    },
    trigger: null,
  });
  return notificationId;
}

export async function dismissNotification(notificationId: string): Promise<void> {
  await Notifications.dismissNotificationAsync(notificationId);
}

export async function dismissAllNotifications(): Promise<void> {
  await Notifications.dismissAllNotificationsAsync();
}
