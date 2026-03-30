import { Pressable, Text } from "react-native";
import { GRATEFUL_THEME } from "@/design/theme";

export function Button({ title, onPress }: {title: string, onPress: ()=> void}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: GRATEFUL_THEME.light.colors.primary,
        paddingVertical: 18,
        borderRadius: 24,
        paddingHorizontal: 16,
        alignItems: "center"
      }}
    >
      <Text
        style={{
          color: GRATEFUL_THEME.light.colors.primaryForeground,
          fontWeight: "700"
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}