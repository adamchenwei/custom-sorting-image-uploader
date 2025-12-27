import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { WatchedFolderList, LogViewer, ConfigModal, FolderPicker } from './src/components';
import { WatchedFolder, LogEntry, AppConfig } from './src/types';
import {
  getWatchedFolders,
  addWatchedFolder,
  removeWatchedFolder,
  getLogs,
  clearLogs,
  getConfig,
  saveConfig,
} from './src/services/storage';
import {
  startFolderWatcher,
  stopFolderWatcher,
  isWatcherRunning,
  requestMediaLibraryPermissions,
} from './src/services/folderWatcher';
import { requestNotificationPermissions } from './src/services/notificationService';

export default function App() {
  const [watchedFolders, setWatchedFolders] = useState<WatchedFolder[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [isWatching, setIsWatching] = useState(false);
  const [showLogViewer, setShowLogViewer] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showFolderPicker, setShowFolderPicker] = useState(false);

  // Load initial data
  useEffect(() => {
    loadData();
    requestPermissions();
  }, []);

  // Refresh logs periodically
  useEffect(() => {
    const interval = setInterval(async () => {
      const currentLogs = await getLogs();
      setLogs(currentLogs);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    const [folders, currentLogs, currentConfig] = await Promise.all([
      getWatchedFolders(),
      getLogs(),
      getConfig(),
    ]);
    setWatchedFolders(folders);
    setLogs(currentLogs);
    setConfig(currentConfig);
  };

  const requestPermissions = async () => {
    const mediaPermission = await requestMediaLibraryPermissions();
    const notificationPermission = await requestNotificationPermissions();

    if (!mediaPermission) {
      Alert.alert(
        'Permission Required',
        'This app needs access to your media library to watch folders for new images.'
      );
    }

    if (!notificationPermission) {
      Alert.alert(
        'Notifications Disabled',
        'Enable notifications to receive upload status updates.'
      );
    }
  };

  const handleAddFolder = async (album: MediaLibrary.Album) => {
    const newFolder: WatchedFolder = {
      id: album.id,
      uri: album.id,
      name: album.title,
      addedAt: Date.now(),
    };

    await addWatchedFolder(newFolder);
    const updatedFolders = await getWatchedFolders();
    setWatchedFolders(updatedFolders);
  };

  const handleRemoveFolder = async (folderId: string) => {
    await removeWatchedFolder(folderId);
    const updatedFolders = await getWatchedFolders();
    setWatchedFolders(updatedFolders);
  };

  const handleClearLogs = async () => {
    Alert.alert(
      'Clear Logs',
      'Are you sure you want to clear all logs?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearLogs();
            setLogs([]);
          },
        },
      ]
    );
  };

  const handleSaveConfig = async (newConfig: Partial<AppConfig>) => {
    await saveConfig(newConfig);
    const updatedConfig = await getConfig();
    setConfig(updatedConfig);
  };

  const toggleWatcher = async () => {
    if (isWatching) {
      await stopFolderWatcher();
      setIsWatching(false);
    } else {
      if (!config?.serverUrl || config.serverUrl === 'https://your-server-url.com') {
        Alert.alert(
          'Configuration Required',
          'Please configure your server URL in Settings before starting the watcher.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => setShowConfigModal(true) },
          ]
        );
        return;
      }

      if (watchedFolders.length === 0) {
        Alert.alert(
          'No Folders',
          'Please add at least one folder to watch before starting.'
        );
        return;
      }

      await startFolderWatcher();
      setIsWatching(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Image Uploader</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setShowConfigModal(true)}
        >
          <Text style={styles.settingsButtonText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Status Banner */}
      <View style={[styles.statusBanner, isWatching ? styles.statusActive : styles.statusInactive]}>
        <View style={[styles.statusDot, isWatching ? styles.statusDotActive : styles.statusDotInactive]} />
        <Text style={styles.statusText}>
          {isWatching ? 'Watching for new images...' : 'Watcher is stopped'}
        </Text>
      </View>

      {/* Watched Folders Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Watched Folders</Text>
          <Text style={styles.sectionCount}>{watchedFolders.length}</Text>
        </View>
        <WatchedFolderList
          folders={watchedFolders}
          onRemoveFolder={handleRemoveFolder}
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => setShowFolderPicker(true)}
        >
          <Text style={styles.primaryButtonText}>+ Add Folder</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            isWatching ? styles.stopButton : styles.startButton,
          ]}
          onPress={toggleWatcher}
        >
          <Text style={styles.buttonText}>
            {isWatching ? '⏹ Stop Watching' : '▶ Start Watching'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => setShowLogViewer(true)}
        >
          <Text style={styles.secondaryButtonText}>📋 View Logs ({logs.length})</Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <LogViewer
        visible={showLogViewer}
        logs={logs}
        onClose={() => setShowLogViewer(false)}
        onClear={handleClearLogs}
      />

      {config && (
        <ConfigModal
          visible={showConfigModal}
          config={config}
          onClose={() => setShowConfigModal(false)}
          onSave={handleSaveConfig}
        />
      )}

      <FolderPicker
        visible={showFolderPicker}
        onClose={() => setShowFolderPicker(false)}
        onSelectFolder={handleAddFolder}
        existingFolderUris={watchedFolders.map(f => f.uri)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  settingsButton: {
    padding: 8,
  },
  settingsButtonText: {
    fontSize: 24,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
  },
  statusActive: {
    backgroundColor: '#dcfce7',
  },
  statusInactive: {
    backgroundColor: '#fef3c7',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusDotActive: {
    backgroundColor: '#22c55e',
  },
  statusDotInactive: {
    backgroundColor: '#f59e0b',
  },
  statusText: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  section: {
    flex: 1,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  sectionCount: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 10,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: '#22c55e',
  },
  stopButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  secondaryButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '500',
  },
});
