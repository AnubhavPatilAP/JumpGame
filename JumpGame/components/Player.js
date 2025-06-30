import React from 'react';
import { Image, StyleSheet } from 'react-native';

export default function Player({ x, y }) {
  return (
    <Image
      source={require('../assets/player.png')}
      style={[styles.player, { top: y, left: x }]}
    />
  );
}

const styles = StyleSheet.create({
  player: {
    position: 'absolute',
    width: 60,
    height: 60,
  },
});
