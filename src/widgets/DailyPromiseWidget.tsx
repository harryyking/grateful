// src/widgets/DailyPromiseWidget.tsx
import React from 'react';
import { Voltra } from 'voltra';
import promises from '@/data/promise';
import { simpleHash } from '@/store/DailyPromisesStore';

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

export default function DailyPromiseWidget() {
  const { finalText, reference } = getTodaysPromise();

  return (
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


}