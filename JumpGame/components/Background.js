import React from 'react';
import { View, StyleSheet, Dimensions, ImageBackground } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function Background({ children }) {
  return (
    <View style={styles.gameScreen}>
      {/* Tree trunk with bark texture */}
      <ImageBackground
        source={require('../assets/bark-texture.png')}
        resizeMode="repeat"
        style={styles.treeTrunk}
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
    height: '100%',
    marginLeft: -(SCREEN_WIDTH * 0.7) / 2,
  },
});
