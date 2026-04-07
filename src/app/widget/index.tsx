import React from 'react';
import { StyleSheet, View, TouchableOpacity, Dimensions, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Text } from '@/components/ui/Text';
import { router } from 'expo-router';
import { GRATEFUL_THEME } from '@/design/theme';

import DailyPromiseWidget from '@/widgets/DailyPromiseWidget';   // ← Your real Voltra widget

const theme = GRATEFUL_THEME.light.colors;
const { width } = Dimensions.get('window');

export default function WidgetScreen() {
  const handleAddToHomeScreen = () => {
    Alert.alert(
      "How to Add the Widget",
      Platform.select({
        ios: "1. Long-press an empty area on your Home Screen\n2. Tap the + button in the top-left\n3. Search for \"Grateful\"\n4. Choose \"Daily Promise\" (Medium size works best)",
        android: "1. Long-press your Home Screen\n2. Tap Widgets\n3. Find \"Grateful\"\n4. Drag the Daily Promise widget onto your screen",
      })!,
      [{ text: "Got it!" }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Live Preview */}
        <View style={styles.previewContainer}>
          <Text style={styles.previewLabel}>LIVE PREVIEW</Text>
          
          <View style={styles.previewFrame}>
            {/* <DailyPromiseWidget /> */}
          </View>
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>NOW AVAILABLE</Text>
          </View>
          
          <Text variant="h1" style={styles.title}>
            Daily Promise Widget
          </Text>
          
          <Text style={styles.description}>
            Add your personalized daily promise to your home screen. 
            It updates automatically every day and brings encouragement with just a glance.
          </Text>
        </View>

        {/* Add Button */}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddToHomeScreen}
        >
          <MaterialIcons name="add-circle" size={24} color={theme.background} />
          <Text style={styles.addButtonText}>Add to Home Screen</Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          Tap the widget anytime to open Grateful
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 60,
  },

  // Preview
  previewContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  previewLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: theme.primary,
    marginBottom: 12,
  },
  previewFrame: {
    width: width * 0.82,
    height: 170,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },

  // Typography
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  badge: {
    backgroundColor: 'rgba(251, 231, 178, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 16,
  },
  badgeText: {
    color: theme.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  title: {
    color: theme.foreground,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.foreground,
    opacity: 0.8,
    textAlign: 'center',
    maxWidth: 300,
  },

  // Button
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primary,
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderRadius: 30,
    width: '100%',
    maxWidth: 320,
    justifyContent: 'center',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  addButtonText: {
    color: theme.background,
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 10,
  },

  note: {
    marginTop: 24,
    fontSize: 13,
    color: theme.foreground,
    opacity: 0.4,
    textAlign: 'center',
  },
});