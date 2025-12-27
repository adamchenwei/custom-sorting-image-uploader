import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { AppConfig } from '../types';

interface ConfigModalProps {
  visible: boolean;
  config: AppConfig;
  onClose: () => void;
  onSave: (config: Partial<AppConfig>) => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  visible,
  config,
  onClose,
  onSave,
}) => {
  const [serverUrl, setServerUrl] = useState(config.serverUrl);
  const [deviceId, setDeviceId] = useState(config.deviceId);
  const [maxRetries, setMaxRetries] = useState(config.maxRetries.toString());
  const [imageMaxWidth, setImageMaxWidth] = useState(config.imageMaxWidth.toString());
  const [imageMaxHeight, setImageMaxHeight] = useState(config.imageMaxHeight.toString());
  const [imageQuality, setImageQuality] = useState(config.imageQuality.toString());

  useEffect(() => {
    setServerUrl(config.serverUrl);
    setDeviceId(config.deviceId);
    setMaxRetries(config.maxRetries.toString());
    setImageMaxWidth(config.imageMaxWidth.toString());
    setImageMaxHeight(config.imageMaxHeight.toString());
    setImageQuality(config.imageQuality.toString());
  }, [config]);

  const handleSave = () => {
    if (!serverUrl.trim()) {
      Alert.alert('Error', 'Server URL is required');
      return;
    }

    const parsedMaxRetries = parseInt(maxRetries, 10);
    const parsedMaxWidth = parseInt(imageMaxWidth, 10);
    const parsedMaxHeight = parseInt(imageMaxHeight, 10);
    const parsedQuality = parseInt(imageQuality, 10);

    if (isNaN(parsedMaxRetries) || parsedMaxRetries < 1) {
      Alert.alert('Error', 'Max retries must be a positive number');
      return;
    }

    if (isNaN(parsedMaxWidth) || parsedMaxWidth < 50) {
      Alert.alert('Error', 'Image max width must be at least 50');
      return;
    }

    if (isNaN(parsedMaxHeight) || parsedMaxHeight < 50) {
      Alert.alert('Error', 'Image max height must be at least 50');
      return;
    }

    if (isNaN(parsedQuality) || parsedQuality < 1 || parsedQuality > 100) {
      Alert.alert('Error', 'Image quality must be between 1 and 100');
      return;
    }

    onSave({
      serverUrl: serverUrl.trim(),
      deviceId: deviceId.trim() || config.deviceId,
      maxRetries: parsedMaxRetries,
      imageMaxWidth: parsedMaxWidth,
      imageMaxHeight: parsedMaxHeight,
      imageQuality: parsedQuality,
    });

    onClose();
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
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Server Configuration</Text>
            
            <Text style={styles.label}>Server URL *</Text>
            <TextInput
              style={styles.input}
              value={serverUrl}
              onChangeText={setServerUrl}
              placeholder="https://your-server.com"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />

            <Text style={styles.label}>Device ID</Text>
            <TextInput
              style={styles.input}
              value={deviceId}
              onChangeText={setDeviceId}
              placeholder="Unique device identifier"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>Max Upload Retries</Text>
            <TextInput
              style={styles.input}
              value={maxRetries}
              onChangeText={setMaxRetries}
              placeholder="3"
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Image Optimization</Text>
            
            <Text style={styles.label}>Max Width (pixels)</Text>
            <TextInput
              style={styles.input}
              value={imageMaxWidth}
              onChangeText={setImageMaxWidth}
              placeholder="300"
              keyboardType="number-pad"
            />

            <Text style={styles.label}>Max Height (pixels)</Text>
            <TextInput
              style={styles.input}
              value={imageMaxHeight}
              onChangeText={setImageMaxHeight}
              placeholder="300"
              keyboardType="number-pad"
            />

            <Text style={styles.label}>Quality (1-100)</Text>
            <TextInput
              style={styles.input}
              value={imageQuality}
              onChangeText={setImageQuality}
              placeholder="20"
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoText}>
              Images will be resized to fit within the specified dimensions while maintaining
              aspect ratio. They will be converted to WebP format before upload.
            </Text>
          </View>
        </ScrollView>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  cancelButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  infoSection: {
    backgroundColor: '#e0f2fe',
    borderRadius: 12,
    padding: 16,
  },
  infoText: {
    fontSize: 13,
    color: '#0369a1',
    lineHeight: 20,
  },
});
