import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image"; // <-- Using Expo Image for high performance
import { Text } from "@/components/ui/Text";
import { GRATEFUL_THEME } from "@/design/theme";
import { useRouter } from "expo-router";
import { useTheme } from "@/services/context/ThemeContext";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = (width - 64) / 3;
const { colors, radius } = GRATEFUL_THEME.light;

export type Atmosphere = {
  id: string;
  name: string;
  color: string;
  type: "solid" | "image" | "gradient";
  image?: any;
  textColor?: string;
};

// ... (Keep your ATMOSPHERES array exactly as it is) ...
export const ATMOSPHERES: Atmosphere[] = [
  { id: "1", name: "Original", color: "#2b2724", type: "solid" },
  {
    id: "2",
    name: "Valley",
    color: "#E0F2F1",
    type: "gradient",
    image: require("@/assets/images/valley.jpg"),
  },
  {
    id: "3",
    name: "Sunset",
    color: "#FBE9E7",
    type: "gradient",
    image: require("@/assets/images/sunset.jpg"),
  },
  {
    id: "4",
    name: "Wilderness",
    color: "#F1F8E9",
    type: "image",
    image: require("@/assets/images/wilderness.jpg"),
  },
  {
    id: "5",
    name: "Cloudy",
    color: "#FFF3E0",
    type: "image",
    image: require("@/assets/images/cloudy.jpg"),
  },
  {
    id: "6",
    name: "Bible",
    color: "#E8EAF6",
    type: "image",
    image: require("@/assets/images/bible.jpg"),
  },
  {
    id: "7",
    name: "Night",
    color: "#3E2723",
    type: "solid",
    image: require("@/assets/images/night.jpg"),
  },
  {
    id: "8",
    name: "Breeze",
    color: "#0D47A1",
    type: "image",
    image: require("@/assets/images/breeze.jpg"),
  },
  {
    id: "9",
    name: "City",
    color: "#263238",
    type: "image",
    image: require("@/assets/images/city.jpg"),
  },
  {
    id: "10",
    name: "Mars",
    color: "#263238",
    type: "image",
    image: require("@/assets/images/mars.jpg"),
  },
  {
    id: "11",
    name: "Garden",
    color: "#263238",
    type: "image",
    image: require("@/assets/images/garden.jpg"),
  },
  {
    id: "12",
    name: "Red",
    color: "#263238",
    type: "image",
    image: require("@/assets/images/red.jpg"),
  },
];

export default function AtmosphereScreen() {
  const router = useRouter();
  const { atmosphere, setAtmosphere } = useTheme();
  const [selectedId, setSelectedId] = useState(atmosphere.id);

  useEffect(() => {
    setSelectedId(atmosphere.id);
  }, [atmosphere.id]);

  const handleSelect = (item: any) => {
    setSelectedId(item.id);
    setAtmosphere(item);
  };

  const renderAtmosphere = ({ item }: { item: (typeof ATMOSPHERES)[0] }) => {
    const isSelected = selectedId === item.id;

    return (
      <TouchableOpacity
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
        style={styles.cardContainer}
      >
        <View style={[styles.cardWrapper, isSelected && styles.cardSelected]}>
          <View
            style={[styles.atmosphereCard, { backgroundColor: item.color }]}
          >
            {/* High-Performance Image with Caching and Fade */}
            {item.image && (
              <Image
                source={item.image}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                transition={300} // Smooth fade-in
                cachePolicy="memory-disk" // Prevents flashing on revisit
              />
            )}

            {/* Subtle overlay to ensure text is always readable */}
            <View style={styles.overlay} />

            {/* Typography Preview */}
            <View style={styles.textContainer}>
              <Text style={styles.previewText}>Aa</Text>
              <Text style={styles.nameText}>{item.name}</Text>
            </View>
          </View>

          {/* Elegant Selection Badge */}
          {isSelected && (
            <View style={styles.checkBadge}>
              <MaterialCommunityIcons
                name="check"
                size={12}
                color={colors.background}
              />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={ATMOSPHERES}
        keyExtractor={(item) => item.id}
        renderItem={renderAtmosphere}
        numColumns={3}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Text variant="h2" style={styles.sectionTitle}>
            Customise Theme
          </Text>
        }
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 60,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.foreground,
    marginBottom: 24,
    marginLeft: 8,
  },
  columnWrapper: {
    justifyContent: "flex-start",
    gap: 12,
    marginBottom: 16,
  },
  cardContainer: {
    width: COLUMN_WIDTH,
  },
  cardWrapper: {
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative", // For the absolute checkmark badge
  },
  cardSelected: {
    borderColor: colors.primary, // Using your theme's warm accent color
  },
  atmosphereCard: {
    width: "100%",
    aspectRatio: 0.65,
    borderRadius: radius.md - 2, // Slightly smaller than wrapper to fit inside border
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.25)", // Darkens the image slightly for contrast
  },
  textContainer: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  previewText: {
    fontSize: 28,
    color: "#FFFFFF",
    fontWeight: "700",
    fontFamily: "Domine_500Medium",
    textShadowColor: "rgba(0, 0, 0, 0.4)", // Pop off the background
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  nameText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "600",
    marginTop: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
    opacity: 0.9,
  },
  checkBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: colors.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.background, // Creates a nice cutout effect
    zIndex: 20,
  },
});
