import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Text } from "@/components/ui/Text";
import { router } from "expo-router";
import { GRATEFUL_THEME } from "@/design/theme";
import StoreReview from "expo-store-review";
import { useDailyReminders } from "@/hooks/useDailyReminders";
import { EditUserNameModal } from "@/components/EditUser";
import { useProfileStore } from "@/store/ProfileStore";

// Pulling your exact theme requirements
const theme = GRATEFUL_THEME.light.colors;
// Assuming a standard radius from your theme, fallback to 12 if not defined
const radius = GRATEFUL_THEME.light.radius || { md: 12 };

// --- Reusable iOS-Style List Row ---
const SettingRow = ({
  icon,
  title,
  onPress,
  hasSwitch,
  switchValue,
  onSwitchChange,
  isDestructive,
  isLast,
}: any) => {
  return (
    <TouchableOpacity
      style={styles.rowContainer}
      onPress={onPress}
      activeOpacity={hasSwitch ? 1 : 0.7}
      disabled={hasSwitch} // Disable row press if it's just a switch toggle
    >
      <View style={styles.rowLeft}>
        <View style={styles.iconContainer}>
          <MaterialIcons
            name={icon}
            size={22}
            color={isDestructive ? "#EF4444" : theme.foreground}
            style={{ opacity: 0.7 }}
          />
        </View>
        <Text style={[styles.rowTitle, isDestructive && { color: "#EF4444" }]}>
          {title}
        </Text>
      </View>

      <View style={styles.rowRight}>
        {hasSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: "rgba(0,0,0,0.1)", true: theme.primary }}
            thumbColor={Platform.OS === "android" ? "#fff" : undefined}
          />
        ) : (
          <MaterialIcons
            name="chevron-right"
            size={24}
            color={theme.foreground}
            style={{ opacity: 0.3 }}
          />
        )}
      </View>

      {/* iOS styled inset divider */}
      {!isLast && <View style={styles.divider} />}
    </TouchableOpacity>
  );
};

export default function ProfileScreen() {
  const name = useProfileStore((state) => state.name);
  const createdAt = useProfileStore((state) => state.createdAt);
  const updateName = useProfileStore((state) => state.updateName);
  const deleteAccount = useProfileStore((state) => state.deleteAccount);
  const { toggleReminders, isEnabled } = useDailyReminders();
  const [isVisible, setIsVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const joinedYear = createdAt
    ? new Date(createdAt).getFullYear()
    : new Date().getFullYear();

  // Open Privacy Policy
  const openPrivacy = () => {
    Linking.openURL("https://grateful-bible-verses.vercel.app/privacy");
  };

  // Open Terms
  const openTerms = () => {
    Linking.openURL("https://grateful-bible-verses.vercel.app/terms");
  };

  // Request App Review using Expo Store Review
  const requestReview = async () => {
    try {
      const isAvailable = await StoreReview.isAvailableAsync();
  
      if (isAvailable) {
        // This is the ONLY correct way to trigger the native review prompt
        await StoreReview.requestReview();
      } else {
        // Fallback for simulator, web, or older devices
        const url = Platform.select({
          ios: "https://apps.apple.com/app/6761614902",
          android: "https://play.google.com/store/apps/details?id=com.harryyking.grateful",
          default: null,
        });
  
        if (url) {
          await Linking.openURL(url);
        }
      }
    } catch (error) {
      console.error("StoreReview error:", error);
      // Silent fallback — never crash the app
      const url = Platform.select({
        ios: "https://apps.apple.com/app/6761614902",
        android: "https://play.google.com/store/apps/details?id=com.harryyking.grateful",
      });
      if (url) Linking.openURL(url);
    }
  };
  // Contact Support (opens email)
  const contactSupport = () => {
    Linking.openURL("mailto:arthurharry06@gmail.com?subject=Support Request");
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. All your progress, streaks, and saved promises will be permanently erased from this device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Forever",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              // Local delete (clears Zustand + MMKV)
              deleteAccount();

              // Optional: If you still want to delete from server (Better Auth), call it here
              // await authClient.deleteUser();

              Alert.alert(
                "Account Deleted",
                "Your local data has been cleared."
              );
              router.replace("/"); // or '/onboarding' depending on your flow
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.message || "Failed to delete account."
              );
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navigation */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons
            name="arrow-back-ios"
            size={20}
            color={theme.primary}
          />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* --- Identity Section (No Avatar) --- */}
        <View style={styles.identityContainer}>
          {/* Your original content */}
          <Text variant="h1">{name || "Beloved"}</Text>
          <View style={styles.joinBadge}>
            <Text style={styles.joinText}>
              Joined Grateful in {joinedYear || ""}
            </Text>
          </View>
        </View>

        {/* --- Preferences Section --- */}
        <Text style={styles.sectionHeader}>PREFERENCES</Text>
        <View style={styles.sectionGroup}>
          <SettingRow
            icon="notifications-active"
            title="Daily Reminders"
            hasSwitch
            switchValue={isEnabled}
            onSwitchChange={toggleReminders}
          />
          <SettingRow
            icon="person"
            title="Account"
            onPress={() => setIsVisible(true)}
            isLast
          />
        </View>

        <EditUserNameModal
          isVisible={isVisible}
          onClose={() => setIsVisible(false)}
        />

        {/* --- Data & Support Section --- */}
        <Text style={styles.sectionHeader}>DATA & SUPPORT</Text>
        <View style={styles.sectionGroup}>
          <SettingRow
            icon="lightbulb"
            title="Feature Requests & Suggestions"
            onPress={() => Linking.openURL("https://insigh.to/b/grateful")}
          />
          {/* <SettingRow icon="star" title="Add Reviews" onPress={requestReview} /> */}
          <SettingRow
            icon="help-outline"
            title="Contact Support"
            onPress={contactSupport}
          />
          <SettingRow
            icon="privacy-tip"
            title="Privacy Policy"
            onPress={openPrivacy}
          />
          <SettingRow
            icon="description"
            title="Terms of Service"
            onPress={openTerms}
            isLast
          />
        </View>

        {/* --- Account Section --- */}
        <View style={[styles.sectionGroup, { marginTop: 32 }]}>
          <SettingRow
            icon="delete-forever"
            title="Delete Account"
            isDestructive
            onPress={handleDelete}
            isLast
          />
        </View>

        <Text style={styles.versionText}>Grateful v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    width: 60,
  },
  backText: {
    color: theme.primary,
    fontSize: 17,
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: theme.foreground,
  },
  scrollContent: {
    paddingBottom: 60,
  },

  // Identity Block
  identityContainer: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: "center",
  },
  userName: {
    fontSize: 28,
    fontWeight: "800",
    color: theme.foreground,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: theme.foreground,
    opacity: 0.6,
    marginBottom: 16,
  },
  joinBadge: {
    backgroundColor: theme.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  joinText: {
    fontSize: 12,
    color: theme.foreground,
    opacity: 0.5,
    fontWeight: "600",
  },

  // Grouped Sections
  sectionHeader: {
    fontSize: 13,
    color: theme.foreground,
    opacity: 0.5,
    paddingHorizontal: 32,
    marginBottom: 8,
    marginTop: 24,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  sectionGroup: {
    backgroundColor: theme.background || "#FFFFFF",
    marginHorizontal: 16,
    borderRadius: radius.md,
    overflow: "hidden",
    // Optional iOS shadow for the blocks
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
      },
      android: {
        elevation: 1,
      },
    }),
  },

  // Individual Row
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: theme.card,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rowTitle: {
    fontSize: 16,
    color: theme.foreground,
    fontWeight: "500",
  },
  rowRight: {
    justifyContent: "center",
  },
  divider: {
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 60, // iOS style inset divider (starts after the icon)
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(0,0,0,0.1)",
  },

  versionText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 13,
    color: theme.foreground,
    opacity: 0.4,
  },
});
