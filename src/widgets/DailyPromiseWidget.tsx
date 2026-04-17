// src/widgets/DailyPromiseWidget.tsx
import React from 'react';
import { Voltra } from 'voltra';
import promises from '@/data/promise';
import { simpleHash } from '@/store/DailyPromisesStore';
import { startLiveActivity } from 'voltra/client'
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { GRATEFUL_THEME } from '@/design/theme';
import { Text } from '@/components/ui/Text';
import { MaterialIcons } from '@expo/vector-icons';
// Pure function to get today's promise (works in widget context)
const getTodaysPromise = () => {
  const today = new Date().toDateString();
  const userId = 'local-user';
  const seed = today + userId;

  const shuffled = [...promises].sort((a, b) => {
    const hashA = simpleHash(seed + a.id);
    const hashB = simpleHash(seed + b.id);
    return hashA - hashB;
  });

  const promise = shuffled[0];

  return {
    finalText: promise.personalizedTemplate.replace('{name}', 'Beloved'),
    reference: promise.reference,
  };
};
const theme = GRATEFUL_THEME.light.colors;

export function DailyPromiseWidget() {
  const { finalText, reference } = getTodaysPromise();
  
  const activityUI = (
    <Voltra.VStack
      spacing={12}
      
      style={{ flex: 1, justifyContent: 'center', backgroundColor: "#443734", padding: 16 }}
    >

      {/* Header */}
      <Voltra.Text
        style={{
          fontSize: 13,
          opacity: 0.6,
          color: '#eaded7',
          fontFamily: 'DMSans_400Regular'
        }}
      >
        ✨ Today’s Promise
      </Voltra.Text>

      {/* Promise Text */}
      <Voltra.Text
        style={{
          fontSize: 17,
          lineHeight: 24,
          fontWeight: '600',
          color: '#eaded7',
          fontFamily: "Domine_600SemiBold"
        }}
        numberOfLines={4}
      >
        {finalText}
      </Voltra.Text>

      {/* Reference */}
      <Voltra.Text
        style={{
          fontSize: 11,
          opacity: 0.5,
          color: '#eaded7',
          letterSpacing: 2,
          fontFamily: "DMSans_500Medium"
        }}
      >
        {reference}
      </Voltra.Text>
    </Voltra.VStack>
  );

  const startActivity = async () => {
    await startLiveActivity({
      lockScreen: activityUI,
    })
  }

  return (
    <View>

    <TouchableOpacity 
    style={styles.addButton}
    onPress={startActivity}
    >
    <MaterialIcons name="add-circle" size={24} color={theme.background} />
    <Text style={styles.addButtonText}>Add to Home Screen</Text>
  </TouchableOpacity>
    </View>
  )

}


const styles = StyleSheet.create({
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
})