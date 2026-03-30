import { StyleSheet, Text, View, Image, Dimensions } from 'react-native'
import React from 'react'
import { GRATEFUL_THEME } from '@/design/theme';

const splash = require("@/assets/images/splash.png")

const { width, height } = Dimensions.get('window');
const theme = GRATEFUL_THEME.light.colors

const Splash = () => {
  return (
    <View style={styles.container}>
      <Image
      source={splash}
    style={styles.image}
      resizeMode='contain'
      />
    </View>
  )
}

export default Splash

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
        justifyContent: 'center',
        alignItems: 'center',
      },
      image: {
        width: width * 0.8,    
        height: height * 0.4,   
    
      },
})