import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
} from "react-native";
import { GRATEFUL_THEME } from "@/design/theme";

type JournalInputProps = {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
};

export default function JournalInput({
  value,
  onChange,
  placeholder = "What are you grateful for today?",
}: JournalInputProps) {
  const theme = GRATEFUL_THEME.light;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <Text style={[styles.label, { color: theme.colors.mutedForeground }]}>
        Journal
      </Text>

      <TextInput
        multiline
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.mutedForeground}
        style={[
          styles.input,
          {
            color: theme.colors.foreground,
          },
        ]}
        textAlignVertical="top"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    minHeight: 180,
  },

  label: {
    fontSize: 12,
    marginBottom: 10,
    fontFamily: "DMSans_500Medium",
    letterSpacing: 0.5,
  },

  input: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "DMSans_400Regular",
    minHeight: 120,
  },
});