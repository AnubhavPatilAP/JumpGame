import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Player from './Player';
import PlatformBlock from './Platform';

export default function GameUI({ score, platforms, playerX, playerY, facing }) {
  return (
    <>
      <Text style={styles.score}>Score: {score}</Text>
      <Player x={playerX} y={playerY} facing={facing} />
      {platforms.map((p) => (
        <PlatformBlock key={p.id} x={p.x} y={p.y} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  score: {
    position: 'absolute',
    top: 40,
    left: 20,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    zIndex: 10,
  },
});
