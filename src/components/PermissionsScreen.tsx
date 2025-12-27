import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as MediaLibrary from 'expo-media-library';
import * as Notifications from 'expo-notifications';

interface Permission {
  id: string;
  name: string;
  description: string;
  status: 'granted' | 'denied' | 'undetermined';
  request: () => Promise<void>;
}

interface PermissionsScreenProps {
  onAllPermissionsGranted: () => void;
}

export const PermissionsScreen: React.FC<PermissionsScreenProps> = ({
  onAllPermissionsGranted,
}) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    setLoading(true);

    // Check Media Library permission
    const mediaStatus = await MediaLibrary.getPermissionsAsync();
    
    // Check Notifications permission
    const notificationStatus = await Notifications.getPermissionsAsync();

    const permissionsList: Permission[] = [
      {
        id: 'media',
        name: 'Photo Library',
        description: 'Access your photos to watch folders and upload images',
        status: mediaStatus.granted ? 'granted' : mediaStatus.canAskAgain ? 'undetermined' : 'denied',
        request: async () => {
          const result = await MediaLibrary.requestPermissionsAsync();
          await checkPermissions();
        },
      },
      {
        id: 'notifications',
        name: 'Notifications',
        description: 'Show upload status notifications',
        status: notificationStatus.granted ? 'granted' : notificationStatus.canAskAgain ? 'undetermined' : 'denied',
        request: async () => {
          if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('uploads', {
              name: 'Upload Notifications',
              importance: Notifications.AndroidImportance.DEFAULT,
            });
          }
          await Notifications.requestPermissionsAsync();
          await checkPermissions();
        },
      },
    ];

    setPermissions(permissionsList);
    setLoading(false);

    // Check if all required permissions are granted
    const allGranted = permissionsList.every(p => p.status === 'granted');
    if (allGranted) {
      onAllPermissionsGranted();
    }
  };

  const openSettings = () => {
    Linking.openSettings();
  };

  const getStatusColor = (status: Permission['status']) => {
    switch (status) {
      case 'granted':
        return '#22c55e';
      case 'denied':
        return '#ef4444';
      default:
        return '#f59e0b';
    }
  };

  const getStatusText = (status: Permission['status']) => {
    switch (status) {
      case 'granted':
        return 'Granted';
      case 'denied':
        return 'Denied';
      default:
        return 'Not Set';
    }
  };

  const getStatusIcon = (status: Permission['status']) => {
    switch (status) {
      case 'granted':
        return '✓';
      case 'denied':
        return '✕';
      default:
        return '?';
    }
  };

  const allGranted = permissions.every(p => p.status === 'granted');
  const hasDenied = permissions.some(p => p.status === 'denied');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Permissions Required</Text>
          <Text style={styles.subtitle}>
            This app needs the following permissions to work properly
          </Text>
        </View>

        {permissions.map((permission) => (
          <View key={permission.id} style={styles.permissionCard}>
            <View style={styles.permissionHeader}>
              <View style={styles.permissionInfo}>
                <Text style={styles.permissionName}>{permission.name}</Text>
                <Text style={styles.permissionDescription}>
                  {permission.description}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(permission.status) },
                ]}
              >
                <Text style={styles.statusIcon}>
                  {getStatusIcon(permission.status)}
                </Text>
              </View>
            </View>

            <View style={styles.permissionActions}>
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(permission.status) },
                ]}
              >
                {getStatusText(permission.status)}
              </Text>

              {permission.status !== 'granted' && (
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    permission.status === 'denied' && styles.settingsButton,
                  ]}
                  onPress={
                    permission.status === 'denied'
                      ? openSettings
                      : permission.request
                  }
                >
                  <Text style={styles.actionButtonText}>
                    {permission.status === 'denied' ? 'Open Settings' : 'Grant'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        {hasDenied && (
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              Some permissions were denied. Please open Settings to enable them
              manually.
            </Text>
            <TouchableOpacity style={styles.settingsLink} onPress={openSettings}>
              <Text style={styles.settingsLinkText}>Open App Settings</Text>
            </TouchableOpacity>
          </View>
        )}

        {allGranted && (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={onAllPermissionsGranted}
          >
            <Text style={styles.continueButtonText}>Continue to App</Text>
          </TouchableOpacity>
        )}

        {!allGranted && !loading && (
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={checkPermissions}
          >
            <Text style={styles.refreshButtonText}>↻ Refresh Status</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  permissionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  permissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  permissionInfo: {
    flex: 1,
    marginRight: 12,
  },
  permissionName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  permissionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIcon: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  permissionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  settingsButton: {
    backgroundColor: '#6b7280',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
    marginBottom: 12,
  },
  settingsLink: {
    alignSelf: 'flex-start',
  },
  settingsLinkText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  refreshButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  refreshButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '500',
  },
});
