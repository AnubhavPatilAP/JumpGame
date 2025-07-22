import React from 'react';
import { View, StyleSheet, Dimensions, ImageBackground, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('screen');

export default function Background({ children }) {
  const isMobile = Platform.OS === 'android' || Platform.OS === 'ios';

  return (
    <View style={styles.gameScreen}>
      <ImageBackground
        source={require('../assets/bark-texture.png')}
        resizeMode={isMobile ? 'cover' : 'repeat'}
        style={isMobile ? styles.fullscreenBark : styles.treeTrunk}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  gameScreen: {
    flex: 1,
    backgroundColor: '#1e90ff',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
    overflow: 'hidden',
  },
  treeTrunk: {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_HEIGHT,
    marginLeft: -(SCREEN_WIDTH * 0.7) / 2,
    zIndex: -1,
  },
  fullscreenBark: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    zIndex: -1,
  },
});
