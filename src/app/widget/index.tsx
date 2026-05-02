import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { Text } from '@/components/ui/Text';
import { router } from 'expo-router';
import { GRATEFUL_THEME } from '@/design/theme';
import { DailyPromiseWidget, MediumWidget, SmallWidget } from '@/widgets/DailyPromiseWidget';
import { VoltraWidgetPreview } from 'voltra/client';

const theme = GRATEFUL_THEME.light.colors;
const { width } = Dimensions.get('window');

const STEPS = [
  {
    icon: 'smartphone' as const,  // ← was 'vibrate', not in Feather
    label: 'Long-press your Home Screen',
  },
  {
    icon: 'plus-circle' as const,
    label: 'Tap the + button in the top-left corner',
  },
  {
    icon: 'search' as const,
    label: 'Search for "Grateful"',
  },
  {
    icon: 'check-circle' as const,
    label: 'Choose Daily Promise and add it',
  },
];

export default function WidgetScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* Hero badge */}
        <View style={styles.badge}>
          <MaterialIcons name="auto-awesome" size={12} color={theme.primary} />
          <Text style={styles.badgeText}>NOW AVAILABLE</Text>
        </View>

        <Text style={styles.title} variant='h2'>Daily Promise on{'\n'} Your Home Screen</Text>
        <Text style={styles.subtitle}>
          A new word of encouragement greets you every morning without opening the app.
        </Text>

        {/* ── Previews ── */}
        <View style={styles.previewSection}>
          <Text style={styles.sectionLabel}>LIVE PREVIEW</Text>

          <View style={styles.previewRow}>
            {/* Small */}
            <View style={styles.previewItem}>
              <VoltraWidgetPreview family="systemSmall" style={styles.widgetShadow}>
                <SmallWidget />
              </VoltraWidgetPreview>
              <Text style={styles.previewCaption}>Small</Text>
            </View>

            {/* Medium stacked to the right */}
            <View style={styles.previewItem}>
              <VoltraWidgetPreview family="systemMedium" style={styles.widgetShadow}>
                <MediumWidget />
              </VoltraWidgetPreview>
              <Text style={styles.previewCaption}>Medium</Text>
            </View>
          </View>
        </View>

        {/* ── Divider ── */}
        <View style={styles.divider} />

        {/* ── Steps ── */}
        <View style={styles.stepsSection}>
          <Text style={styles.sectionLabel}>HOW TO ADD IT</Text>

          {STEPS.map((step, i) => (
            <View key={i} style={styles.step}>
              {/* Number + line */}
              <View style={styles.stepLeft}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{i + 1}</Text>
                </View>
                {i < STEPS.length - 1 && <View style={styles.stepLine} />}
              </View>

              {/* Content */}
              <View style={styles.stepContent}>
                <Feather name={step.icon} size={16} color={theme.primary} style={{ marginBottom: 4 }} />
                <Text style={styles.stepLabel}>{step.label}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── CTA ── */}
        <DailyPromiseWidget />

        <Text style={styles.note}>
          Tap the widget anytime to open Grateful
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(234, 217, 215, 0.15)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(234, 217, 215, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.foreground,
  },

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
  },

  // Badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(244, 183, 64, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(244, 183, 64, 0.25)',
    marginBottom: 20,
  },
  badgeText: {
    color: theme.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  // Hero text
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: theme.foreground,
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: theme.foreground,
    opacity: 0.6,
    textAlign: 'center',
    maxWidth: 300,
    marginBottom: 36,
  },

  // Preview
  previewSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 36,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.8,
    color: theme.primary,
    marginBottom: 20,
    opacity: 0.8,
  },
  previewRow: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
  },
  previewItem: {
    alignItems: 'center',
    gap: 10,
  },
  widgetShadow: {
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  previewCaption: {
    fontSize: 12,
    color: theme.foreground,
    opacity: 0.4,
    fontWeight: '500',
    letterSpacing: 0.5,
  },

  // Divider
  divider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(234, 217, 215, 0.15)',
    marginBottom: 36,
  },

  // Steps
  stepsSection: {
    width: '100%',
    marginBottom: 40,
  },
  step: {
    flexDirection: 'row',
    gap: 16,
    minHeight: 72,
  },
  stepLeft: {
    alignItems: 'center',
    width: 32,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(244, 183, 64, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(244, 183, 64, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.primary,
  },
  stepLine: {
    flex: 1,
    width: 1,
    backgroundColor: 'rgba(244, 183, 64, 0.2)',
    marginTop: 6,
    marginBottom: 0,
  },
  stepContent: {
    flex: 1,
    paddingTop: 4,
    paddingBottom: 24,
  },
  stepLabel: {
    fontSize: 15,
    color: theme.foreground,
    lineHeight: 22,
    opacity: 0.85,
  },

  // Footer
  note: {
    marginTop: 20,
    fontSize: 13,
    color: theme.foreground,
    opacity: 0.35,
    textAlign: 'center',
  },
});