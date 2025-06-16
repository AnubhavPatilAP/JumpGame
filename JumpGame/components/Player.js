import React from 'react';
import { Image, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const PLAYER_SIZE = 60;

export default function Player({ y }) {
  const x = width / 2 - PLAYER_SIZE / 2;

  return (
    <Image
      source={require('../assets/player.png')}
      style={[styles.player, { top: y, left: x }]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  player: {
    position: 'absolute',
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
  },
});
