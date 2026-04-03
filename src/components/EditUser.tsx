import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Modal, 
  Pressable, 
  TextInput, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { Text } from '@/components/ui/Text';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { authClient } from '@/lib/authClient';
import { queryClient } from '@/lib/QueryClient';
import { useProfileStore } from '@/store/ProfileStore';

interface EditNameProps {
  isVisible: boolean;
  onClose: () => void;
  
}

export const EditUserNameModal = ({ isVisible, onClose, }: EditNameProps) => {
  const [localName, setLocalName] = useState('');
  const [loading, setLoading] = useState(false);

  // Get both current name and action from store
  const currentName = useProfileStore((state) => state.name);
  const updateName = useProfileStore((state) => state.updateName);

  // Reset local state when modal opens
  // useEffect(() => {
  //   if (isVisible) {
  //     setLocalName(currentName || 'Beloved');
  //   }
  // }, [isVisible, currentName]);

  const handleUpdate = async () => {
    const trimmedName = localName.trim();
    if (!trimmedName) return;

    setLoading(true);

    try {
      // Call the store action (which now handles both local + optional API)
      await updateName(trimmedName);     // ← We made updateName async in previous suggestion

      onClose();
    } catch (error: any) {
      Alert.alert("Update Failed", error.message || "Could not update name");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal animationType="fade" transparent visible={isVisible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>Edit Name</Text>
            <Text style={styles.subtitle}>How should we address you?</Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={localName}
              onChangeText={setLocalName}
              placeholder="Enter your name"
              placeholderTextColor="rgba(255,255,255,0.3)"
              autoFocus
              maxLength={30}
              selectionColor="#c9b8a3"
            />
          </View>

          <View style={styles.footer}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            
            <Pressable 
               style={[styles.saveBtn, (!localName.trim() || loading) && styles.disabledBtn]}
               onPress={handleUpdate}
               disabled={loading || !localName.trim()}
            >
              {loading ? (
                <ActivityIndicator color="#2b2724" size="small" />
              ) : (
                <Text style={styles.saveText}>Save Changes</Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#2b2724',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f5f1ed',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(245, 241, 237, 0.6)',
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#f5f1ed',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cancelText: {
    color: '#f5f1ed',
    fontWeight: '600',
  },
  saveBtn: {
    flex: 2,
    backgroundColor: '#FBE7B2', // Your primary accent
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  saveText: {
    color: '#2b2724',
    fontWeight: '700',
  },
});