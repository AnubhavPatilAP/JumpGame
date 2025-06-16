import React from 'react';
import { Image, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function Player({ y }) {
  return (
    <Image
      source={require('../assets/player.png')}
      style={[styles.player, { top: y }]}
    />
  );
}

const styles = StyleSheet.create({
  player: {
    position: 'absolute',
    width: 60,
    height: 60,
    left: width / 2 - 30,
  },
});
