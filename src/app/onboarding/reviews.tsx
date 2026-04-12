import React, { useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { GRATEFUL_THEME } from '@/design/theme';
import { useProfileStore } from '@/store/ProfileStore';

const SPACING = 16;
const { colors, radius } = GRATEFUL_THEME.light;

const REVIEWS_DATA = [
  {
    id: '1',
    name: 'Emmanuel Arthur',
    content: "The daily verses always seem to hit exactly what I'm walking through. It's become my favorite way to pause and invite God into my morning before the noise of the world starts.",
    milestone: 'Growing',
  },
  {
    id: '2',
    name: 'Millicent Bloom',
    content: "I've struggled with anxiety for years. Having these promises sent to my lock screen acts as a constant reminder that He is in control. My mind feels more at peace than ever.",
    milestone: 'Daily Reader',
  },
  {
    id: '3',
    name: 'Susanna Tagoe',
    content: "It’s so much more than just an app. The reflections help me actually apply the Bible to my life as a mother and a professional. It feels like a daily breath of fresh air.",
    milestone: 'Spirit Filled',
  },
];

export default function ReviewsScreen() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();

  const CARD_WIDTH = Math.min(width * 0.85, 420);
  const PADDING_HORIZONTAL = (width - CARD_WIDTH) / 2;

  const { finishOnboarding } = useProfileStore();

  const handleFinishOnboarding = () => {
    finishOnboarding();
    router.push('/home');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.contentWrapper}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconWrapper}>
            <MaterialIcons name="star" size={36} color={colors.primary} />
          </View>
          <Text variant="h1">Leave a review</Text>
          <Text style={styles.subhead}>
            We're a small team, so a rating goes a long way 🤍
          </Text>
        </View>

        {/* Testimonials Carousel */}
        <View style={styles.carouselContainer}>
          <Animated.ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + SPACING}
            decelerationRate="fast"
            contentContainerStyle={[
              styles.scrollContent,
              { paddingHorizontal: PADDING_HORIZONTAL },
            ]}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
          >
            {REVIEWS_DATA.map((item, index) => {
              const inputRange = [
                (index - 1) * (CARD_WIDTH + SPACING),
                index * (CARD_WIDTH + SPACING),
                (index + 1) * (CARD_WIDTH + SPACING),
              ];
              const scale = scrollX.interpolate({
                inputRange,
                outputRange: [0.95, 1, 0.95],
                extrapolate: 'clamp',
              });

              return (
                <Animated.View
                  key={item.id}
                  style={[styles.card, { width: CARD_WIDTH, transform: [{ scale }] }]}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderInfo}>
                      <Text style={styles.authorText}>{item.name}</Text>
                      <View style={styles.milestoneBadge}>
                        <MaterialIcons name="local-fire-department" size={14} color={colors.primarySoft} />
                        <Text style={styles.milestoneText}>{item.milestone}</Text>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.quoteText}>"{item.content}"</Text>

                  <View style={styles.starsRow}>
                    {[...Array(5)].map((_, i) => (
                      <MaterialIcons key={i} name="star" size={18} color={colors.primary} />
                    ))}
                  </View>
                </Animated.View>
              );
            })}
          </Animated.ScrollView>
        </View>

        {/* Footer - Simple Continue */}
        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.button}
            onPress={handleFinishOnboarding}
          >
            <Text style={styles.buttonText}>Continue</Text>
            <MaterialIcons name="arrow-forward" size={20} color={colors.background} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 12,
  },
  iconWrapper: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: radius.xl,
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  subhead: {
    fontSize: 16,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 12,
  },

  carouselContainer: {
    flexGrow: 1,
    minHeight: 260,
    marginVertical: 24,
    justifyContent: 'center',
  },
  scrollContent: {
    gap: SPACING,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: 24,
    minHeight: 260,
    justifyContent: 'space-between',
    shadowColor: colors.foreground,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderInfo: {
    justifyContent: 'center',
  },
  authorText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: 6,
  },
  milestoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.md,
    gap: 4,
  },
  milestoneText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.foreground,
  },
  quoteText: {
    fontSize: 15.5,
    color: colors.foreground,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 20,
  },

  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderRadius: 30,
    width: '100%',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    color: colors.background,
    fontSize: 17,
    fontWeight: '700',
  },
});