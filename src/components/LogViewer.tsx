import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { LogEntry } from '../types';

interface LogViewerProps {
  visible: boolean;
  logs: LogEntry[];
  onClose: () => void;
  onClear: () => void;
}

export const LogViewer: React.FC<LogViewerProps> = ({
  visible,
  logs,
  onClose,
  onClear,
}) => {
  const getLogTypeColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return '#22c55e';
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      default:
        return '#3b82f6';
    }
  };

  const getLogTypeIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      default:
        return 'ℹ';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const renderItem = ({ item }: { item: LogEntry }) => (
    <View style={styles.logItem}>
      <View
        style={[
          styles.logTypeIndicator,
          { backgroundColor: getLogTypeColor(item.type) },
        ]}
      >
        <Text style={styles.logTypeIcon}>{getLogTypeIcon(item.type)}</Text>
      </View>
      <View style={styles.logContent}>
        <Text style={styles.logMessage}>{item.message}</Text>
        <Text style={styles.logTimestamp}>{formatTimestamp(item.timestamp)}</Text>
        {item.filename && (
          <Text style={styles.logFilename}>File: {item.filename}</Text>
        )}
      </View>
    </View>
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
          <Text style={styles.title}>Activity Log</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Done</Text>
          </TouchableOpacity>
        </View>

        {logs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No log entries yet</Text>
          </View>
        ) : (
          <FlatList
            data={logs}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            style={styles.list}
            contentContainerStyle={styles.listContent}
          />
        )}

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={onClear}
          >
            <Text style={styles.clearButtonText}>Clear Logs</Text>
          </TouchableOpacity>
        </View>
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
  logItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  logTypeIndicator: {
    width: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logTypeIcon: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  logContent: {
    flex: 1,
    padding: 12,
  },
  logMessage: {
    fontSize: 14,
    color: '#1a1a1a',
    marginBottom: 4,
  },
  logTimestamp: {
    fontSize: 11,
    color: '#999',
  },
  logFilename: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#ff4444',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
