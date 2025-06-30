import React from 'react';
import { Image, StyleSheet } from 'react-native';

export default function PlatformBlock({ x, y }) {
  return (
    <Image
      source={require('../assets/platform.png')}
      style={[styles.platform, { top: y, left: x }]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  platform: {
    position: 'absolute',
    width: 100,
    height: 20,
  },
});
