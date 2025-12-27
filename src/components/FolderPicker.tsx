import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as MediaLibrary from 'expo-media-library';

interface FolderPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectFolder: (album: MediaLibrary.Album) => void;
  existingFolderUris: string[];
}

interface NavigationItem {
  album: MediaLibrary.Album | null;
  title: string;
}

export const FolderPicker: React.FC<FolderPickerProps> = ({
  visible,
  onClose,
  onSelectFolder,
  existingFolderUris,
}) => {
  const [albums, setAlbums] = useState<MediaLibrary.Album[]>([]);
  const [allAlbums, setAllAlbums] = useState<MediaLibrary.Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [navigationStack, setNavigationStack] = useState<NavigationItem[]>([
    { album: null, title: 'All Folders' },
  ]);
  const [currentAlbum, setCurrentAlbum] = useState<MediaLibrary.Album | null>(null);

  useEffect(() => {
    if (visible) {
      loadAlbums();
      setNavigationStack([{ album: null, title: 'All Folders' }]);
      setCurrentAlbum(null);
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

      setAllAlbums(fetchedAlbums);
      
      // Filter out already watched folders for display
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

  const getChildAlbums = (parentAlbum: MediaLibrary.Album): MediaLibrary.Album[] => {
    const parentTitle = parentAlbum.title;
    return allAlbums.filter((album) => {
      if (album.id === parentAlbum.id) return false;
      const albumPath = album.title;
      return (
        albumPath.startsWith(parentTitle + '/') &&
        albumPath.split('/').length === parentTitle.split('/').length + 1
      );
    });
  };

  const navigateToAlbum = (album: MediaLibrary.Album) => {
    // Always navigate into the folder first, let user choose with "Choose This Folder" button
    setNavigationStack([...navigationStack, { album, title: album.title }]);
    setCurrentAlbum(album);
    
    // Check for child albums (based on path naming convention)
    const childAlbums = getChildAlbums(album);
    setAlbums(childAlbums.filter((a) => !existingFolderUris.includes(a.id)));
  };

  const navigateBack = () => {
    if (navigationStack.length > 1) {
      const newStack = navigationStack.slice(0, -1);
      setNavigationStack(newStack);
      const previousItem = newStack[newStack.length - 1];
      setCurrentAlbum(previousItem.album);
      
      if (previousItem.album === null) {
        const availableAlbums = allAlbums.filter(
          (album) => !existingFolderUris.includes(album.id)
        );
        setAlbums(availableAlbums);
      } else {
        const childAlbums = getChildAlbums(previousItem.album);
        setAlbums(childAlbums.filter((a) => !existingFolderUris.includes(a.id)));
      }
    }
  };

  const selectCurrentFolder = () => {
    if (currentAlbum) {
      onSelectFolder(currentAlbum);
      onClose();
    }
  };

  const hasChildren = (album: MediaLibrary.Album): boolean => {
    return getChildAlbums(album).length > 0;
  };

  const renderItem = ({ item }: { item: MediaLibrary.Album }) => {
    return (
      <View style={styles.albumItemContainer}>
        <TouchableOpacity
          style={styles.albumItem}
          onPress={() => navigateToAlbum(item)}
        >
          <View style={styles.albumIcon}>
            <Text style={styles.albumIconText}>📁</Text>
          </View>
          <View style={styles.albumInfo}>
            <Text style={styles.albumName}>{item.title.split('/').pop()}</Text>
            <Text style={styles.albumCount}>
              {item.assetCount} {item.assetCount === 1 ? 'item' : 'items'}
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderBreadcrumb = () => {
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.breadcrumbContainer}
        contentContainerStyle={styles.breadcrumbContent}
      >
        {navigationStack.map((item, index) => (
          <View key={index} style={styles.breadcrumbItem}>
            {index > 0 && <Text style={styles.breadcrumbSeparator}>/</Text>}
            <TouchableOpacity
              onPress={() => {
                if (index < navigationStack.length - 1) {
                  const newStack = navigationStack.slice(0, index + 1);
                  setNavigationStack(newStack);
                  const targetItem = newStack[newStack.length - 1];
                  setCurrentAlbum(targetItem.album);
                  
                  if (targetItem.album === null) {
                    const availableAlbums = allAlbums.filter(
                      (album) => !existingFolderUris.includes(album.id)
                    );
                    setAlbums(availableAlbums);
                  } else {
                    const childAlbums = getChildAlbums(targetItem.album);
                    setAlbums(childAlbums.filter((a) => !existingFolderUris.includes(a.id)));
                  }
                }
              }}
            >
              <Text
                style={[
                  styles.breadcrumbText,
                  index === navigationStack.length - 1 && styles.breadcrumbTextActive,
                ]}
              >
                {item.title.split('/').pop() || item.title}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {navigationStack.length > 1 && (
              <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
                <Text style={styles.backButtonText}>‹ Back</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.title}>Select Folder</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {renderBreadcrumb()}

        {currentAlbum && (
          <TouchableOpacity style={styles.chooseHereButton} onPress={selectCurrentFolder}>
            <Text style={styles.chooseHereIcon}>✓</Text>
            <View style={styles.chooseHereContent}>
              <Text style={styles.chooseHereText}>Choose This Folder</Text>
              <Text style={styles.chooseHereSubtext}>
                {currentAlbum.title} • {currentAlbum.assetCount} items
              </Text>
            </View>
          </TouchableOpacity>
        )}

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
            <Text style={styles.emptyText}>
              {currentAlbum ? 'No subfolders found' : 'No available folders found'}
            </Text>
            <Text style={styles.emptySubtext}>
              {currentAlbum
                ? 'Use "Choose This Folder" above to select the current folder'
                : 'All folders are already being watched or no albums exist'}
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
  headerLeft: {
    width: 70,
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: 70,
    alignItems: 'flex-end',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  breadcrumbContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    maxHeight: 44,
  },
  breadcrumbContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbSeparator: {
    marginHorizontal: 8,
    color: '#999',
    fontSize: 14,
  },
  breadcrumbText: {
    fontSize: 14,
    color: '#3b82f6',
  },
  breadcrumbTextActive: {
    color: '#1a1a1a',
    fontWeight: '600',
  },
  chooseHereButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
  },
  chooseHereIcon: {
    fontSize: 20,
    color: '#fff',
    marginRight: 12,
  },
  chooseHereContent: {
    flex: 1,
  },
  chooseHereText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  chooseHereSubtext: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  albumItemContainer: {
    marginBottom: 8,
  },
  albumItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
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
  chevron: {
    fontSize: 24,
    color: '#999',
    marginLeft: 8,
  },
  selectBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  selectBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
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
