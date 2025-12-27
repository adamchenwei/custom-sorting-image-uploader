import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { WatchedFolder } from '../types';

interface WatchedFolderListProps {
  folders: WatchedFolder[];
  onRemoveFolder: (folderId: string) => void;
}

export const WatchedFolderList: React.FC<WatchedFolderListProps> = ({
  folders,
  onRemoveFolder,
}) => {
  const handleRemove = (folder: WatchedFolder) => {
    Alert.alert(
      'Remove Folder',
      `Are you sure you want to stop watching "${folder.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => onRemoveFolder(folder.id),
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: WatchedFolder }) => (
    <View style={styles.folderItem}>
      <View style={styles.folderInfo}>
        <Text style={styles.folderName}>{item.name}</Text>
        <Text style={styles.folderPath} numberOfLines={1} ellipsizeMode="middle">
          {item.uri}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemove(item)}
      >
        <Text style={styles.removeButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  if (folders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No folders being watched</Text>
        <Text style={styles.emptySubtext}>
          Tap "Add Folder" to start watching a folder for new images
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={folders}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      style={styles.list}
      contentContainerStyle={styles.listContent}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  folderInfo: {
    flex: 1,
    marginRight: 12,
  },
  folderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  folderPath: {
    fontSize: 12,
    color: '#666',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
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
