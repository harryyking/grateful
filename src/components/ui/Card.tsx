import { View } from "react-native";
import { GRATEFUL_THEME } from "@/design/theme";
import { shadows } from "@/design/spacing";
import React from "react";

export function Card({ children }: {children : React.ReactNode}) {
  return (
    <View
      style={{
        backgroundColor: GRATEFUL_THEME.light.colors.card,
        borderRadius: 12,
        padding: 22,
        ...shadows.md
      }}
    >
      {children}
    </View>
  );
}