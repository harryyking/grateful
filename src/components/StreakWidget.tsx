import React from 'react';
import { StyleSheet, View, Modal, Pressable, Platform } from 'react-native';
import { Text } from '@/components/ui/Text';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const DAYS = [
  { label: 'Tu', status: 'checked' },
  { label: 'We', status: 'checked' },
  { label: 'Th', status: 'checked' },
  { label: 'Fr', status: 'checked' },
  { label: 'Mo', status: 'active' }, // Current Day
];

interface StreakModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export const StreakModal = ({ isVisible, onClose }: StreakModalProps) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      {/* 1. Backdrop (Closes on tap) */}
      <Pressable style={styles.overlay} onPress={onClose}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        
        {/* 2. The Pop-up Card */}
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          <View style={styles.contentContainer}>
            {/* Sun Icon with Streak Count */}
            <View style={styles.sunContainer}>
              <MaterialIcons name="wb-sunny" size={52} color="#F2A827" style={styles.sunIcon} />
              <View style={styles.countOverlay}>
                <Text style={styles.countText}>16</Text>
              </View>
            </View>

            <Text style={styles.title}>Keep the fire burning</Text>
            <Text style={styles.subtitle}>You've sought God for 16 days straight.</Text>

            {/* Horizontal Days */}
            <View style={styles.daysWrapper}>
              {DAYS.map((day, index) => (
                <View key={index} style={styles.dayColumn}>
                  <Text style={[styles.dayLabel, day.status === 'active' && styles.activeLabel]}>
                    {day.label}
                  </Text>
                  <View style={[styles.checkCircle, day.status === 'active' && styles.activeCheck]}>
                    <MaterialIcons 
                      name={day.status === 'active' ? "wb-sunny" : "check"} 
                      size={14} 
                      color="#1C1C18" 
                    />
                  </View>
                </View>
              ))}
            </View>
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
    backgroundColor: 'rgba(0,0,0,0.5)', // Dim the background
  },
  modalCard: {
    width: '85%',
    backgroundColor: '#26231E', // Matching your theme
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
      android: { elevation: 10 }
    })
  },
  contentContainer: {
    alignItems: 'center',
  },
  sunContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  sunIcon: {
    shadowColor: '#F2A827',
    shadowOpacity: 0.6,
    shadowRadius: 15,
  },
  countOverlay: {
    position: 'absolute',
    top: 15,
  },
  countText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#514534',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    marginBottom: 24,
  },
  daysWrapper: {
    flexDirection: 'row',
    gap: 14,
  },
  dayColumn: {
    alignItems: 'center',
    gap: 8,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.3)',
  },
  activeLabel: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F2A827',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.6,
  },
  activeCheck: {
    opacity: 1,
    backgroundColor: '#F2A827',
    transform: [{ scale: 1.1 }],
  },
});