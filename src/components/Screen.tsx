import { View } from "react-native";
import { GRATEFUL_THEME } from "@/design/theme";
import React from "react";

export function Screen({ children }: {children : React.ReactNode}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: GRATEFUL_THEME.light.colors.background,
        padding: 20
      }}
    >
      {children}
    </View>
  );
}