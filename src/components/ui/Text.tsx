import React from "react";
import { Text as RNText, TextStyle, StyleProp } from "react-native";
import { typography } from "@/design/typography";
import { GRATEFUL_THEME } from "@/design/theme";

type TypographyVariant = keyof typeof typography;

interface TextProps {
  variant?: TypographyVariant;
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

export function Text({
  variant = "body",
  style,
  children,
}: TextProps) {
  return (
    <RNText
      style={[
        typography[variant],
        { color: GRATEFUL_THEME.light.colors.foreground },
        style,
      ]}
    >
      {children}
    </RNText>
  );
}