// src/widgets/DailyPromiseWidget.tsx
import React from 'react';
import { Voltra } from 'voltra';
import promises from '@/data/promise';
import { simpleHash } from '@/store/DailyPromisesStore';
import { scheduleWidget, updateWidget, VoltraWidgetPreview } from 'voltra/client';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { GRATEFUL_THEME } from '@/design/theme';
import { Text } from '@/components/ui/Text';
import { MaterialIcons } from '@expo/vector-icons';
import { useProfileStore } from '@/store/ProfileStore';

const theme = GRATEFUL_THEME.light.colors;

// ── Plain function — safe to call outside React ────────────────────────────
const getTodaysPromise = () => {
  const profile = useProfileStore.getState(); // .getState() not hook

  const today = new Date().toDateString();
  const seed = today + 'local-user';
  const shuffled = [...promises].sort((a, b) =>
    simpleHash(seed + a.id) - simpleHash(seed + b.id)
  );
  const promise = shuffled[0];
  return {
    finalText: promise.personalizedTemplate.replace('{name}', profile.name || 'Beloved'),
    reference: promise.reference,
  };
};

// Small: ~155x155pt
export const SmallWidget = () => {
  const { finalText, reference } = getTodaysPromise();
  return (
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
          fontFamily: 'Baskerville', // ✅ iOS system font
        }}
      >
        TODAY'S PROMISE
      </Voltra.Text>

      <Voltra.Text
        style={{
          fontSize: 13,
          fontWeight: '400',
          color: '#3C2A20',
          textAlign: 'center',
          marginBottom: 8,
          fontFamily: 'Georgia', // ✅ iOS system font
        }}
      >
        {finalText}
      </Voltra.Text>

      <Voltra.Text
        style={{
          fontSize: 10,
          fontWeight: '600',
          color: '#3C2A20',
          fontFamily: 'Baskerville', // ✅ iOS system font
        }}
      >
        {reference}
      </Voltra.Text>
    </Voltra.VStack>
  );
};

// Medium: ~329x155pt
export const MediumWidget = () => {
  const { finalText, reference } = getTodaysPromise();
  return (
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
              fontFamily: 'Baskerville', // ✅ iOS system font
            }}
          >
            TODAY'S PROMISE
          </Voltra.Text>

          <Voltra.Text
            style={{
              fontSize: 14,
              fontWeight: '400',
              color: '#3C2A20',
              fontFamily: 'Georgia', // ✅ iOS system font
            }}
          >
            {finalText}
          </Voltra.Text>
        </Voltra.VStack>

        <Voltra.Text
          style={{
            fontSize: 11,
            fontWeight: '600',
            color: '#3C2A20',
            fontFamily: 'Baskerville', // ✅ iOS system font
          }}
        >
          {reference}
        </Voltra.Text>
      </Voltra.VStack>
    </Voltra.HStack>
  );
};

export function WidgetContent() {
  return <SmallWidget />;
}

export function DailyPromiseWidget() {
  const handleAddToHomeScreen = async () => {
    // Schedule today AND tomorrow so the widget never goes stale overnight
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
  
    await scheduleWidget('daily_promise', [
      {
        date: today,
        variants: {
          systemSmall: <SmallWidget />,
          systemMedium: <MediumWidget />,
        },
      },
      {
        date: tomorrow,
        variants: {
          systemSmall: <SmallWidget />,
          systemMedium: <MediumWidget />,
        },
      },
    ]);
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