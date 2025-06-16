import React from 'react';
import { Image, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function Platform({ y }) {
  return (
    <Image
      source={require('../assets/platform.png')}
      style={[styles.platform, { top: y }]}
    />
  );
}

const styles = StyleSheet.create({
  platform: {
    position: 'absolute',
    width: 100,
    height: 20,
    left: width / 2 - 50,
  },
});
