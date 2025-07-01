import React from 'react';
import { Image, StyleSheet } from 'react-native';
import playerImage from '../assets/player.png';

export default function Player({ x, y, facing }) {
  return (
    <Image
      source={playerImage}
      style={[
        styles.player,
        {
          left: x,
          top: y,
          transform: [{ scaleX: facing === 'left' ? -1 : 1 }],
        },
      ]}
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
