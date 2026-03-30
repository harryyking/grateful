import React from 'react';
import { StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from '@/components/ui/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { GRATEFUL_THEME } from '@/design/theme';


const theme = GRATEFUL_THEME.light.colors

const { width } = Dimensions.get('window');

export default function WidgetComingSoonScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
  

      <View style={styles.content}>
        {/* Abstract Widget Wireframes */}
        <View style={styles.wireframeContainer}>
          {/* Medium/Wide Widget */}
          <View style={[styles.ghostWidget, styles.widgetWide]}>
            <View style={styles.ghostLine} />
            <View style={[styles.ghostLine, { width: '60%' }]} />
          </View>
          
          <View style={styles.wireframeRow}>
            {/* Small Square Widget */}
            <View style={[styles.ghostWidget, styles.widgetSmall]}>
              <MaterialIcons name="favorite" size={24} color={theme.muted} style={{ opacity: 0.5 }}/>
            </View>
            {/* Large Square Widget */}
            <View style={[styles.ghostWidget, styles.widgetLarge]}>
               <View style={[styles.ghostLine, { width: '80%', marginBottom: 12 }]} />
               <View style={[styles.ghostLine, { width: '40%' }]} />
            </View>
          </View>
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>COMING SOON</Text>
          </View>
          
          <Text variant='h1' style={styles.title}>Home Screen Widgets</Text>
          
          <Text style={styles.description}>
            Bring your daily promises directly to your iOS home screens. 
            In our next major update, we will be releasing beautifully crafted widgets in small, medium, and large sizes so you can stay encouraged without even opening the app.
          </Text>
        </View>

        {/* Call to Action */}
        <TouchableOpacity 
          style={styles.notifyButton}
          onPress={() => router.back()} // Or hook this up to a "Notify Me" state
        >
          <MaterialIcons name="notifications-active" size={20} color={theme.background} />
          <Text style={styles.notifyButtonText}>Got it, take me back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: theme.foreground,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 4,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  
  // --- Wireframe Graphics ---
  wireframeContainer: {
    width: width * 0.7,
    alignItems: 'center',
    marginBottom: 48,
  },
  ghostWidget: {
    borderWidth: 2,
    borderColor: theme.muted,
    borderStyle: 'dashed',
    borderRadius: 20,
    backgroundColor: 'rgba(93, 85, 81, 0.1)', // Very faint muted color
    padding: 16,
    justifyContent: 'center',
  },
  widgetWide: {
    width: '100%',
    height: 80,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  wireframeRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  widgetSmall: {
    width: '45%',
    aspectRatio: 1,
    alignItems: 'center',
  },
  widgetLarge: {
    width: '45%',
    aspectRatio: 1, // Keeps it square
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
  },
  ghostLine: {
    height: 8,
    backgroundColor: theme.muted,
    borderRadius: 4,
    width: '100%',
    marginBottom: 8,
    opacity: 0.3,
  },

  // --- Typography ---
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  badge: {
    backgroundColor: 'rgba(201, 184, 163, 0.15)', // Light primary tint
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    marginBottom: 16,
  },
  badgeText: {
    color: theme.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  title: {
    color: theme.foreground,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.foreground,
    opacity: 0.8,
    textAlign: 'center',
  },

  // --- Button ---
  notifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 30,
    width: '100%',
    justifyContent: 'center',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  notifyButtonText: {
    color: theme.background,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});