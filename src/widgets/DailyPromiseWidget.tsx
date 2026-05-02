// src/widgets/DailyPromiseWidget.tsx
import React from 'react';
import { Voltra } from 'voltra';
import promises from '@/data/promise';
import { simpleHash } from '@/store/DailyPromisesStore';
import { scheduleWidget, VoltraWidgetPreview } from 'voltra/client';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { GRATEFUL_THEME } from '@/design/theme';
import { Text } from '@/components/ui/Text';
import { MaterialIcons } from '@expo/vector-icons';
import { useProfileStore } from '@/store/ProfileStore';

const theme = GRATEFUL_THEME.light.colors;

const getTodaysPromise = () => {
  const profile = useProfileStore.getState();
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
          fontFamily: 'DMSans-Bold', // ← PostScript name not filename
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
          fontFamily: 'Domine-Regular', // ← PostScript name not filename
        }}
      >
        {finalText}
      </Voltra.Text>

      <Voltra.Text
        style={{
          fontSize: 10,
          fontWeight: '600',
          color: '#3C2A20',
          fontFamily: 'DMSans-SemiBold', // ← PostScript name not filename
        }}
      >
        {reference}
      </Voltra.Text>
    </Voltra.VStack>
  );
};

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
              fontFamily: 'DMSans-Bold', // ← PostScript name
            }}
          >
            TODAY'S PROMISE
          </Voltra.Text>

          <Voltra.Text
            style={{
              fontSize: 16,
              fontWeight: '400',
              color: '#3C2A20',
              fontFamily: 'Domine-Regular', // ← PostScript name
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
            fontFamily: 'DMSans-SemiBold', // ← PostScript name
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
        deepLinkUrl: 'grateful://home',
      },
      {
        date: tomorrow,
        variants: {
          systemSmall: <SmallWidget />,
          systemMedium: <MediumWidget />,
        },
        deepLinkUrl: 'grateful://home',
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