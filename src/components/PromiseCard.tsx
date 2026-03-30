import { View } from "react-native";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";

export function PromiseCard({ promise, reference }: {promise: string, reference: string}) {
  return (
    <Card>
      <Text
        style={{
          marginBottom: 16,
          fontFamily: 'Domine_400Regular'
        }}
      >
        {promise}
      </Text>

      <Text
        variant="caption"
        style={{
          opacity: 0.6
        }}
      >
        {reference}
      </Text>
    </Card>
  );
}