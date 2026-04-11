import React, { useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Animated,
  Platform,
  Linking,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { GRATEFUL_THEME } from '@/design/theme';
import * as StoreReview from 'expo-store-review';
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

  // Dynamic values for iPad compatibility
  const CARD_WIDTH = Math.min(width * 0.85, 420);
  const PADDING_HORIZONTAL = (width - CARD_WIDTH) / 2;

  // Get review prompt state + finish onboarding from Zustand
  const { lastReviewPrompt, setLastReviewPrompt, finishOnboarding } = useProfileStore();

  const showReviewPrompt = () => {
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    if (lastReviewPrompt && now - lastReviewPrompt < THIRTY_DAYS_MS) {
      return false; // Not showing prompt
    }

    Alert.alert(
      "Would You Like to Leave a Review?",
      "Your feedback helps us spread God's Word to more people. It only takes a moment.",
      [
        {
          text: "Not Now",
          style: "cancel",
          onPress: () => handleFinishOnboarding(), // Still continue if they say no
        },
        {
          text: "Yes, I'd Love To",
          style: "default",
          onPress: async () => {
            try {
              const isAvailable = await StoreReview.isAvailableAsync();
              if (isAvailable) {
                await StoreReview.requestReview();
              } else {
                const url = Platform.select({
                  ios: "https://apps.apple.com/app/6761614902",
                  android: "https://play.google.com/store/apps/details?id=com.harryyking.grateful",
                });
                if (url) await Linking.openURL(url);
              }
              setLastReviewPrompt(now);
            } catch (error) {
              console.error('StoreReview error:', error);
            } finally {
              handleFinishOnboarding(); // Always continue after review attempt
            }
          },
        },
      ]
    );
    return true;
  };


  const handleFinishOnboarding = () => {
    finishOnboarding();
    router.push('/home');
  };


  const handleContinue = () => {
    const showedPrompt = showReviewPrompt();
    if (!showedPrompt) {
      handleFinishOnboarding(); // Skip directly if not showing prompt
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.contentWrapper}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.iconWrapper}>
            <MaterialIcons name="star" size={36} color={colors.primary} />
          </View>
          <Text variant="h1">Leave a review</Text>
          <Text style={styles.subhead}>
            We're a small team, so a rating goes a long way 🤍
          </Text>
        </View>

        {/* Horizontal Testimonials Carousel */}
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

        {/* Footer / Action Area */}
        <View style={styles.footer}>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.button}
            onPress={handleContinue}
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
    paddingVertical: 40,
  },

  // --- Header ---
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 20,
  },
  iconWrapper: {
    backgroundColor: colors.surface,
    padding: 18,
    borderRadius: radius.xl,
    marginBottom: 24,
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

  // --- Carousel & Cards ---
  carouselContainer: {
    flexGrow: 1,
    minHeight: 300,
    marginVertical: 40,
    justifyContent: 'center',
  },
  scrollContent: {
    gap: SPACING,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: 28,
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
    marginBottom: 20,
  },
  cardHeaderInfo: {
    justifyContent: 'center',
  },
  authorText: {
    fontSize: 17,
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
    fontSize: 13,
    fontWeight: '600',
    color: colors.foreground,
  },
  quoteText: {
    fontSize: 17,
    color: colors.foreground,
    lineHeight: 26,
    fontStyle: 'italic',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 20,
  },

  // --- Footer ---
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginBottom: 20,
  },
  reviewButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
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