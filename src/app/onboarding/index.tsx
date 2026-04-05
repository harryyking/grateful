import React, { useEffect, useState } from "react";
import { 
  View, 
  StyleSheet, 
  ImageBackground, 
  Dimensions, 
  StatusBar ,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { router, useRouter } from "expo-router";
import { MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { useProfileStore } from "@/store/ProfileStore";
const { width, height } = Dimensions.get("window");

const WelcomeImage = require("@/assets/images/welcome.jpg");

export default function WelcomeScreen() {
  const router = useRouter();

  const handleBeginJourney = async () => {
      router.replace("/onboarding/quiz");
 
  };
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Background Image - Choose something serene like a sunrise or a quiet path */}
      <ImageBackground
        source={WelcomeImage}
        style={styles.backgroundImage}
      >
        {/* Gradient Overlay for Text Legibility */}
        <LinearGradient
          colors={["transparent", "rgba(28, 28, 24, 0.4)", "#1c1c18"]}
          style={styles.gradient}
        >
          <View style={styles.content}>
            
            {/* Animated Branding Section */}
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 1000 }}
            >
              <Text variant="h1" style={styles.brand}>Grateful</Text>
              <Text style={styles.headline}>
               Personal Messages from Jesus
              </Text>
              <Text style={styles.subheadline}>
                Get Consistent with God and grow closer to God through daily intentionality.
              </Text>
            </MotiView>

            {/* Action Section */}
            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "timing", duration: 1000, delay: 500 }}
              style={styles.footer}
            >
              <Button 
                title="Begin Your Journey" 
                onPress={handleBeginJourney}
              />
              
            </MotiView>

          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

// Added for the "Log in" touchable if you don't have it imported


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1c1c18",
  },
  backgroundImage: {
    width: width,
    height: height,
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  content: {
    alignItems: "flex-start",
  },
  brand: {
    fontSize: 28,
    color: "#EBA22D",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  headline: {
    fontSize: 36,
    lineHeight: 48,
    color: "#FFFFFF",
    fontWeight: "600",
    marginBottom: 16,
  },
  subheadline: {
    fontSize: 17,
    lineHeight: 24,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 48,
  },
  footer: {
    width: "100%",
    gap: 20,
  },
  primaryButton: {
    height: 64,
    backgroundColor: "#EBA22D",
    borderRadius: 32,
    width: "100%",
  },
  loginLink: {
    alignItems: "center",
    marginTop: 10,
  },
  loginText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
  },
  loginSpan: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});