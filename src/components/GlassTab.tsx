import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { BlurView } from 'expo-blur'
import { MaterialIcons } from '@expo/vector-icons';
import { Text } from './ui/Text';

const GlassTab = ({ icon, onPress, color = "#fff" }: {icon: any, onPress?: () => void, color?: string}) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
    {/* 1. The Container defines the circle shape */}
    <View style={styles.glassWrapper}>
      <BlurView 
        intensity={Platform.OS === 'ios' ? 30 : 100} // Intensity varies by platform
        tint="light" 
        style={styles.blurContainer}
      >
        {/* 2. The Inner Content adds the padding and icon */}
        <View style={styles.iconContainer}>
          <MaterialIcons name={icon} size={24} color={color} />
          <Text>Giving</Text>
        </View>
      </BlurView>
    </View>
  </TouchableOpacity>
  )
}

export default GlassTab

const styles = StyleSheet.create({
    glassWrapper: {
        width: 120,
        height: 56,
        borderRadius: 28, // Half of width/height for perfect circle
        overflow: 'hidden', // Crucial: clips the BlurView to the circle
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)', // Subtle highlight border
      },
      blurContainer: {
        display: 'flex',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Subtle tint
      },
      iconContainer: {
        flexDirection: 'row',
        padding: 12,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4
      },
})