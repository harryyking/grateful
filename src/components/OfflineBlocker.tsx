import { GRATEFUL_THEME } from "@/design/theme";
import { ActivityIndicator, Modal, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "./ui/Text";
import NetInfo from "@react-native-community/netinfo";


export const OfflineBlocker = ({ isOnline }: { isOnline: boolean }) => {
    const insets = useSafeAreaInsets();

  
    if (isOnline) return null;
  
    return (
      <Modal
        visible={!isOnline}
        transparent={false}
        animationType="fade"
        statusBarTranslucent
      >
        <View
          style={{
            flex: 1,
            backgroundColor: GRATEFUL_THEME.light.colors.background,
            paddingTop: insets.top + 60,
            paddingHorizontal: 24,
            alignItems: "center",
          }}
        >
          {/* Icon */}
          <Text style={{ fontSize: 64, marginBottom: 24 }}>📡</Text>
  
          <Text
            style={{
              fontSize: 24,
              fontFamily: "DMSans_700Bold", // or your bold font
              textAlign: "center",
              marginBottom: 12,
              color: GRATEFUL_THEME.light.colors.foreground,
            }}
          >
            No Internet Connection
          </Text>
  
          <Text
            style={{
              fontSize: 17,
              fontFamily: "DMSans_400Regular",
              textAlign: "center",
              lineHeight: 24,
              color: GRATEFUL_THEME.light.colors.muted || "#666",
              maxWidth: 320,
            }}
          >
            Our platform requires an internet connection to fetch data from the database.
            {"\n\n"}
            Please connect to Wi‑Fi or mobile data and try again.
          </Text>
  
          <TouchableOpacity
            onPress={async () => {
              // Force a fresh network check (the hook will update automatically)
              await NetInfo.fetch(); // ← this triggers an immediate re-check
            }}
            style={{
              marginTop: 40,
              backgroundColor: GRATEFUL_THEME.light.colors.primary,
              paddingVertical: 16,
              paddingHorizontal: 48,
              borderRadius: 9999,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <ActivityIndicator size="small" color="#FFF" />
            <Text
              style={{
                color: "#FFF",
                fontSize: 18,
                fontFamily: "DMSans_600SemiBold",
              }}
            >
              Retry Connection
            </Text>
          </TouchableOpacity>
  
          <Text
            style={{
              marginTop: "auto",
              marginBottom: 40,
              fontSize: 14,
              color: "#888",
              textAlign: "center",
            }}
          >
            You’ll be taken back to the app as soon as you’re online
          </Text>
        </View>
      </Modal>
    );
  };