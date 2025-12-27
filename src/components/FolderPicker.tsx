import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';

interface FolderPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectFolder: (album: MediaLibrary.Album) => void;
  existingFolderUris: string[];
}

export const FolderPicker: React.FC<FolderPickerProps> = ({
  visible,
  onClose,
  onSelectFolder,
  existingFolderUris,
}) => {
  const [albums, setAlbums] = useState<MediaLibrary.Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadAlbums();
    }
  }, [visible]);

  const loadAlbums = async () => {
    setLoading(true);
    setError(null);

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access media library was denied');
        setLoading(false);
        return;
      }

      const fetchedAlbums = await MediaLibrary.getAlbumsAsync({
        includeSmartAlbums: true,
      });

      // Filter out already watched folders
      const availableAlbums = fetchedAlbums.filter(
        (album) => !existingFolderUris.includes(album.id)
      );

      setAlbums(availableAlbums);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load albums');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: MediaLibrary.Album }) => (
    <TouchableOpacity
      style={styles.albumItem}
      onPress={() => {
        onSelectFolder(item);
        onClose();
      }}
    >
      <View style={styles.albumIcon}>
        <Text style={styles.albumIconText}>📁</Text>
      </View>
      <View style={styles.albumInfo}>
        <Text style={styles.albumName}>{item.title}</Text>
        <Text style={styles.albumCount}>
          {item.assetCount} {item.assetCount === 1 ? 'item' : 'items'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Folder</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Loading folders...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadAlbums}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : albums.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>No available folders found</Text>
            <Text style={styles.emptySubtext}>
              All folders are already being watched or no albums exist
            </Text>
          </View>
        ) : (
          <FlatList
            data={albums}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            style={styles.list}
            contentContainerStyle={styles.listContent}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  closeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  albumItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  albumIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  albumIconText: {
    fontSize: 24,
  },
  albumInfo: {
    flex: 1,
  },
  albumName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  albumCount: {
    fontSize: 13,
    color: '#666',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
