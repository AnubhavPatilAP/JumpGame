import React from 'react';
import { Image, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const PLATFORM_WIDTH = 100;
const PLATFORM_HEIGHT = 20;

export default function Platform({ y }) {
  const x = width / 2 - PLATFORM_WIDTH / 2;

  return (
    <Image
      source={require('../assets/platform.png')}
      style={[styles.platform, { top: y, left: x }]}
      resizeMode="stretch"
    />
  );
}

const styles = StyleSheet.create({
  platform: {
    position: 'absolute',
    width: PLATFORM_WIDTH,
    height: PLATFORM_HEIGHT,
  },
});
