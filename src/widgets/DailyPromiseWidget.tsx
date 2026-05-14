// src/widgets/DailyPromiseWidget.tsx
import React from 'react';
import { Voltra } from 'voltra';
import { getTodaysDailyPromises } from '@/store/DailyPromisesStore';
import { scheduleWidget, VoltraWidgetPreview } from 'voltra/client';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { GRATEFUL_THEME } from '@/design/theme';
import { Text } from '@/components/ui/Text';
import { MaterialIcons } from '@expo/vector-icons';

const theme = GRATEFUL_THEME.light.colors;

// ── Types ──────────────────────────────────────────────────────────────────
export type DailyPromise = {
  finalText: string;
  reference: string;
};

const FALLBACK_PROMISE: DailyPromise = {
  finalText:
    'Beloved, God knows the plans He has for you — plans to prosper you and not to harm you.',
  reference: 'Jeremiah 29:11',
};

// ── Helper: resolve the promise for a given date ───────────────────────────
const getPromiseForDate = (date: Date): DailyPromise => {
  const { promises } = getTodaysDailyPromises(date);
  const promise = promises?.[0];
  if (!promise) return FALLBACK_PROMISE;
  return { finalText: promise.finalText, reference: promise.reference };
};

// ── Small Widget (~155×155pt) ──────────────────────────────────────────────
// Now accepts an explicit `promise` prop so each scheduled snapshot is
// correct for its own date rather than always resolving to "today".
export const SmallWidget = ({ promise }: { promise: DailyPromise }) => (
  <Voltra.VStack
    style={{
      flex: 1,
      backgroundColor: '#E1D8D2',
      padding: 16,
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Voltra.Text
      style={{
        fontSize: 11,
        fontWeight: '700',
        color: '#3C2A20',
        marginBottom: 8,
        fontFamily: 'DM-Sans',
      }}
    >
      TODAY'S PROMISE
    </Voltra.Text>

    <Voltra.Text
      style={{
        fontSize: 14,
        fontWeight: '400',
        color: '#3C2A20',
        textAlign: 'center',
        marginBottom: 8,
        fontFamily: 'Domine',
      }}
    >
      {promise.finalText}
    </Voltra.Text>

    <Voltra.Text
      style={{
        fontSize: 10,
        fontWeight: '600',
        color: '#3C2A20',
        fontFamily: 'Baskerville',
      }}
    >
      {promise.reference}
    </Voltra.Text>
  </Voltra.VStack>
);

// ── Medium Widget (~329×155pt) ─────────────────────────────────────────────
export const MediumWidget = ({ promise }: { promise: DailyPromise }) => (
  <Voltra.HStack
    style={{
      flex: 1,
      backgroundColor: '#E1D8D2',
      padding: 20,
    }}
  >
    <Voltra.VStack style={{ flex: 1, justifyContent: 'space-between' }}>
      <Voltra.VStack>
        <Voltra.Text
          style={{
            fontSize: 11,
            fontWeight: '700',
            color: '#3C2A20',
            marginBottom: 10,
            fontFamily: 'Baskerville',
          }}
        >
          TODAY'S PROMISE
        </Voltra.Text>

        <Voltra.Text
          style={{
            fontSize: 16,
            fontWeight: '400',
            color: '#3C2A20',
            marginBottom: 10,
            fontFamily: 'Georgia',
          }}
        >
          {promise.finalText}
        </Voltra.Text>
      </Voltra.VStack>

      <Voltra.Text
        style={{
          fontSize: 11,
          fontWeight: '600',
          color: '#3C2A20',
          fontFamily: 'Baskerville',
        }}
      >
        {promise.reference}
      </Voltra.Text>
    </Voltra.VStack>
  </Voltra.HStack>
);

// ── Required Voltra export ─────────────────────────────────────────────────
export function WidgetContent() {
  return <SmallWidget promise={getPromiseForDate(new Date())} />;
}

// ── Core scheduler: pre-renders N days so the widget never goes stale ──────
// Called on app launch, on foreground, and from the background task.
// Since all data is offline, we can safely compute every future snapshot now.
export async function scheduleAllUpcomingWidgets(daysAhead = 30): Promise<void> {
  const entries = [];

  for (let i = 0; i < daysAhead; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    date.setHours(0, 0, 0, 0);

    const promise = getPromiseForDate(date);

    entries.push({
      date,
      variants: {
        systemSmall: <SmallWidget promise={promise} />,
        systemMedium: <MediumWidget promise={promise} />,
      },
      deepLinkUrl: 'grateful://home',
    });
  }

  await scheduleWidget('daily_promise', entries);
}

// ── UI component: "Add to Home Screen" button ──────────────────────────────
export function DailyPromiseWidget() {
  const handleAddToHomeScreen = async () => {
    // Schedules 30 days so the widget is immediately up-to-date
    await scheduleAllUpcomingWidgets(30);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={handleAddToHomeScreen}>
        <MaterialIcons name="add-circle" size={24} color={theme.background} />
        <Text style={styles.addButtonText}>Add to Home Screen</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
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
});