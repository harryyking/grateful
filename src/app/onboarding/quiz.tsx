import React, { useState } from "react";
import {
  View,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MotiView, AnimatePresence } from "moti";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';

import { Text } from "@/components/ui/Text"; 

import Splash from "@/components/Splash";
import { authClient } from "@/lib/authClient";
import { GRATEFUL_THEME } from "@/design/theme";
import { OnboardingAnswers } from "@/types/promiseTypes";
import { useProfileStore } from "@/store/ProfileStore";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";

const { width } = Dimensions.get("window");

const theme = GRATEFUL_THEME.light.colors

// --- Types & Interfaces ---

type QuestionType = "radio" | "multiselect" | "text";

interface Option {
  label: string;
  value: string;
}

interface Question {
  id: string;
  text: string;
  subtext?: string;
  type: QuestionType;
  options?: Option[];
  placeholder?: string;
}

type AnswerValue = string | string[];
type Answers = Record<string, AnswerValue>;

// --- Data ---

export const ONBOARDING_QUESTIONS: Question[] = [
  {
    id: "name",
    text: "What should we call you?",
    subtext: "This makes your daily word feel personal.",
    type: "text",
    placeholder: "Your name",
  },

  {
    id: "current_state",
    text: "Right now, I feel...",
    subtext: "Be honest. This helps us meet you where you are.",
    type: "radio",
    options: [
      { label: "Overwhelmed", value: "overwhelmed" },
      { label: "Anxious", value: "anxious" },
      { label: "Disconnected from God", value: "distant" },
      { label: "Hopeful but inconsistent", value: "inconsistent" },
    ],
  },

  {
    id: "desire",
    text: "What do you need most from God right now?",
    subtext: "We'll shape your daily messages around this.",
    type: "radio",
    options: [
      { label: "Peace", value: "peace" },
      { label: "Strength", value: "strength" },
      { label: "Direction", value: "direction" },
      { label: "Faith", value: "faith" },
      { label: "Provision", value: "provision" },
    ],
  },

  {
    id: "struggle",
    text: "What are you currently struggling with?",
    subtext: "Select all that apply.",
    type: "multiselect",
    options: [
      { label: "Anxiety / Overthinking", value: "anxiety" },
      { label: "Temptation / Habits", value: "temptation" },
      { label: "Lack of consistency", value: "consistency" },
      { label: "Feeling lost", value: "lost" },
    ],
  },

  {
    id: "christian_tradition",
    text: "What is your Christian tradition?",
    subtext: "This helps us serve you better with relevant teachings.",
    type: "radio",
    options: [
      { label: "Catholic", value: "catholic" },
      { label: "Protestant", value: "protestant" },
      { label: "Orthodox", value: "orthodox" },
      { label: "Charismatic / Pentecostal", value: "charismatic" },
      { label: "Non-denominational", value: "nondenominational" },
    ],
  },

  {
    id: "reminder_time",
    text: "When should we show up for you?",
    subtext: "We'll send your daily word at this time.",
    type: "radio",
    options: [
      { label: "Morning", value: "morning" },
      { label: "Afternoon", value: "afternoon" },
      { label: "Night", value: "night" },
    ],
  },

  {
    id: "final_word",
    text: "One word that describes what you need most right now?",
    subtext: "We'll remember this.",
    type: "text",
    placeholder: "Peace • Hope • Strength",
  },
];

// --- Component ---

export default function OnboardingScreen() {
  const router = useRouter();

  const [index, setIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [textInput, setTextInput] = useState<string>("");

  const currentQuestion = ONBOARDING_QUESTIONS[index];
  const progress = ((index + 1) / ONBOARDING_QUESTIONS.length) * 100;
  const [isLoading, setIsLoading] = useState(false)

  const { isCompleted, isLoading: checkingStatus } = useOnboardingStatus();

// ← NEW: Get the action from our Zustand store
const completeOnboarding = useProfileStore((state) => state.completeOnboarding);

if (checkingStatus) {
  return <Splash />;
}

if (isCompleted) {
  router.replace('/home');
  return null;
}
  const handleOptionSelect = (value: string) => {
    Haptics.selectionAsync();

    setAnswers((prev) => {
      const current = prev[currentQuestion.id];

      if (currentQuestion.type === "multiselect") {
        const arr: string[] = Array.isArray(current) ? current : [];
        return {
          ...prev,
          [currentQuestion.id]: arr.includes(value)
            ? arr.filter((v) => v !== value)
            : [...arr, value],
        };
      }

      return {
        ...prev,
        [currentQuestion.id]: value,
      };
    });
  };

  const isStepValid = (): boolean => {
    if (currentQuestion.type === "text") {
      return textInput.trim().length > 1;
    }
    
    const answer = answers[currentQuestion.id];
    
    if (currentQuestion.type === "multiselect") {
      return Array.isArray(answer) && answer.length > 0;
    }
    
    return Boolean(answer);
  };

  const handleNext = async () => {
    if (!isStepValid()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // === Always send latest text input for text questions ===
    const answersToSend: Answers = currentQuestion.type === "text"
      ? { ...answers, [currentQuestion.id]: textInput.trim() }
      : answers;

    if (currentQuestion.type === "text") {
      setAnswers(answersToSend);
    }

    if (index < ONBOARDING_QUESTIONS.length - 1) {
      setIndex((prev) => prev + 1);
      if (currentQuestion.type === "text") setTextInput("");
    } else {
      // === FINAL STEP – now fully local ===
      setIsLoading(true);

      try {
        // ← THIS IS THE ONLY CHANGE
        completeOnboarding(answersToSend as unknown as OnboardingAnswers);

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace("/onboarding/features");
      } catch (error) {
        console.error("Onboarding save failed:", error);
        alert("Something went wrong. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const isOptionSelected = (value: string): boolean => {
    const answer = answers[currentQuestion.id];
    if (currentQuestion.type === "multiselect" && Array.isArray(answer)) {
      return answer.includes(value);
    }
    return answer === value;
  };

  return (
    <View style={styles.container}>
      
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* Header & Progress */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => index > 0 && setIndex(index - 1)}
              style={{ opacity: index > 0 ? 1 : 0, paddingVertical: 10 }}
              disabled={index === 0}
            >
              <MaterialIcons name="arrow-back-ios" size={20} color={theme.onBackground} />
            </TouchableOpacity>
            
            <View style={styles.progressBackground}>
              <MotiView
                style={styles.progressFill}
                animate={{ width: `${progress}%` }}
                transition={{ type: "timing", duration: 400 }}
              />
            </View>
            <View style={{ width: 20 }} /> 
          </View>

          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <AnimatePresence exitBeforeEnter>
              <MotiView
                key={currentQuestion.id}
                from={{ opacity: 0, translateY: 15 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: -15 }}
                transition={{ type: "timing", duration: 350 }}
              >
                <Text style={styles.question}>{currentQuestion.text}</Text>
                
                {currentQuestion.subtext && (
                  <Text style={styles.subtext}>{currentQuestion.subtext}</Text>
                )}

                <View style={styles.inputContainer}>
                  {currentQuestion.type === "text" && (
                    <TextInput
                      style={styles.textInput}
                      placeholder={currentQuestion.placeholder}
                      placeholderTextColor={theme.muted}
                      value={textInput}
                      onChangeText={setTextInput}
                      autoFocus
                      selectionColor={theme.primary}
                    />
                  )}

                  {(currentQuestion.type === "radio" || currentQuestion.type === "multiselect") && (
                    <View style={styles.options}>
                      {currentQuestion.options?.map((option) => {
                        const selected = isOptionSelected(option.value);
                        return (
                          <TouchableOpacity
                            key={option.value}
                            onPress={() => handleOptionSelect(option.value)}
                            activeOpacity={0.7}
                            style={[
                              styles.option,
                              selected && styles.optionSelected,
                            ]}
                          >
                            <Text
                              style={[
                                styles.optionText,
                                selected && styles.optionTextSelected,
                              ]}
                            >
                              {option.label}
                            </Text>
                            {selected && (
                              <MaterialIcons 
                                name={currentQuestion.type === "multiselect" ? "check-box" : "radio-button-checked"} 
                                size={20} 
                                color={theme.primary} 
                              />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              </MotiView>
            </AnimatePresence>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={[
                styles.continueButton, 
                !isStepValid() && styles.continueButtonDisabled
              ]}
              onPress={handleNext}
              disabled={!isStepValid()}
            >
              <Text style={[
                styles.buttonText,
                !isStepValid() && styles.buttonTextDisabled
              ]}>
                {index === ONBOARDING_QUESTIONS.length - 1 ? "Start Your Journey" : "Continue"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  safeArea: { flex: 1, paddingHorizontal: 24 },
  
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginTop: 10 
  },
  progressBackground: {
    flex: 1,
    height: 6,
    backgroundColor: theme.border,
    borderRadius: 3,
    marginHorizontal: 16,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.primary,
    borderRadius: 3,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 20,
  },
  question: {
    fontFamily: 'Domine_600SemiBold',
    fontSize: 32,
    lineHeight: 40,
    color: theme.foreground,
    marginBottom: 12,
  },
  subtext: {
    fontSize: 15,
    color: theme.muted,
    marginBottom: 40,
    lineHeight: 22,
  },
  inputContainer: {
    minHeight: 250, 
  },
  textInput: {
    height: 64,
    borderRadius: 16,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.primary,
    paddingHorizontal: 20,
    fontSize: 20,
    color: theme.foreground,
  },
  options: {
    gap: 16,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: theme.card,
  },
  optionSelected: {
    backgroundColor: theme.primarySoft,
    borderColor: theme.primary,
  },
  optionText: {
    fontSize: 16,
    color: theme.foreground,
    flex: 1,
    paddingRight: 10,
  },
  optionTextSelected: {
    fontWeight: "600",
    color: theme.onBackground,
  },
  footer: {
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'ios' ? 10 : 20,
  },
  continueButton: {
    height: 60,
    backgroundColor: theme.primary,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonDisabled: {
    backgroundColor: theme.muted,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: theme.onBackground,
  },
  splashContainer: { 
    flex: 1, 
    backgroundColor: theme.background 
  },
  splashContent: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  splashTitle: { 
    fontSize: 42, 
    fontFamily: "serif", 
    color: theme.onBackground, 
    marginTop: 20 
  },
  splashSubtitle: { 
    fontSize: 18, 
    color: theme.muted, 
    marginTop: 8, 
    textAlign: "center" 
  },
});