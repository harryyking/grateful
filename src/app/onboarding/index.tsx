import React from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  Dimensions,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/Text";

const { width, height } = Dimensions.get("window");
const WelcomeImage = require("@/assets/images/welcome.jpg");

// Shows the user exactly what they're signing up for
const TEASER = {
  text: "I have loved you with an everlasting love; I have drawn you with unfailing kindness.",
  reference: "Jeremiah 31:3",
};

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ImageBackground
        source={WelcomeImage}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[
            "rgba(20, 12, 8, 0.05)",
            "rgba(20, 12, 8, 0.5)",
            "rgba(20, 12, 8, 0.88)",
            "#140c08",
          ]}
          locations={[0, 0.3, 0.65, 1]}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>

            {/* ── Wordmark ────────────────────────────────── */}
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: "timing", duration: 1400, delay: 100 }}
              style={styles.wordmark}
            >
              <View style={styles.wordmarkLine} />
              <Text style={styles.wordmarkText}>GRATEFUL</Text>
              <View style={styles.wordmarkLine} />
            </MotiView>

            <View style={{ flex: 1 }} />

            {/* ── Verse card teaser ───────────────────────── */}
            <MotiView
              from={{ opacity: 0, translateY: 14 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 900, delay: 500 }}
              style={styles.verseCard}
            >
              {/* Gold left accent bar */}
              <View style={styles.verseAccent} />
              <View style={styles.verseBody}>
                <Text style={styles.verseLabel}>TODAY'S PROMISE</Text>
                <Text style={styles.verseText}>"{TEASER.text}"</Text>
                <Text style={styles.verseRef}>{TEASER.reference}</Text>
              </View>
            </MotiView>

            {/* ── Headline copy ────────────────────────────── */}
            <MotiView
              from={{ opacity: 0, translateY: 16 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 900, delay: 800 }}
              style={styles.copyBlock}
            >
              <Text style={styles.headline}>
                A word from God,{"\n"}written for you.
              </Text>
              <Text style={styles.subheadline}>
                Each morning, a scripture promise shaped around your life —
                not generic, but personal. Let Him meet you right where you are.
              </Text>
            </MotiView>

            {/* ── CTA ─────────────────────────────────────── */}
            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 800, delay: 1100 }}
              style={styles.footer}
            >
              <TouchableOpacity
                activeOpacity={0.88}
                style={styles.primaryButton}
                onPress={() => router.push("/onboarding/quiz")}
              >
                <Text style={styles.primaryButtonText}>Receive My First Promise</Text>
              </TouchableOpacity>

              <Text style={styles.disclaimer}>
                Free · No account needed · Takes 2 minutes
              </Text>
            </MotiView>

          </SafeAreaView>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#140c08",
  },
  backgroundImage: {
    width,
    height,
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 8,
    paddingBottom: 20,
  },

  // ── Wordmark ──────────────────────────────────────────
  wordmark: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  wordmarkLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(244, 183, 64, 0.4)",
  },
  wordmarkText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 4,
    color: "#F4B740",
  },

  // ── Verse card ────────────────────────────────────────
  verseCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.07)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(244, 183, 64, 0.18)",
    overflow: "hidden",
    marginBottom: 32,
  },
  verseAccent: {
    width: 3,
    backgroundColor: "#F4B740",
  },
  verseBody: {
    flex: 1,
    padding: 18,
    gap: 8,
  },
  verseLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    color: "#F4B740",
  },
  verseText: {
    fontSize: 14,
    lineHeight: 22,
    color: "rgba(255, 255, 255, 0.9)",
    fontFamily: "Georgia",
    fontStyle: "italic",
  },
  verseRef: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.45)",
    letterSpacing: 1,
  },

  // ── Copy ──────────────────────────────────────────────
  copyBlock: {
    marginBottom: 36,
  },
  headline: {
    fontSize: 38,
    lineHeight: 48,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16,
    letterSpacing: -0.5,
    fontFamily: "Domine_600SemiBold",
  },
  subheadline: {
    fontSize: 16,
    lineHeight: 25,
    color: "rgba(255, 255, 255, 0.65)",
  },

  // ── CTA ───────────────────────────────────────────────
  footer: {
    gap: 16,
    alignItems: "center",
  },
  primaryButton: {
    width: "100%",
    height: 62,
    backgroundColor: "#F4B740",
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#F4B740",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  primaryButtonText: {
    color: "#1c0e06",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  disclaimer: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.35)",
    textAlign: "center",
    letterSpacing: 0.5,
  },
});