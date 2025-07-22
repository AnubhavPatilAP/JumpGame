import React from 'react';
import { Image, StyleSheet } from 'react-native';
import playerImage from '../assets/player.png';

export default function Player({ x, y, facing, size = 60 }) {
  return (
    <Image
      source={playerImage}
      style={[
        styles.player,
        {
          left: x,
          top: y,
          width: size,
          height: size,
          transform: [{ scaleX: facing === 'left' ? -1 : 1 }],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  player: {
    position: 'absolute',
  },
});
