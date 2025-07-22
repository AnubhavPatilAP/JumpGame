import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Player from './Player';
import PlatformBlock from './Platform';

export default function GameUI({
  score,
  platforms,
  playerX,
  playerY,
  facing,
  playerSize,
}) {
  return (
    <>
      <Text style={styles.score}>Score: {score}</Text>
      <Player x={playerX} y={playerY} facing={facing} size={playerSize} />
      {platforms.map((p) => (
        <PlatformBlock
          key={p.id}
          x={p.x}
          y={p.y}
          type={p.type}
          moving={p.moving}
          jumpCount={p.jumpCount}
          status={p.status}
          showDebug={false}
        />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  score: {
    position: 'absolute',
    top: 40,
    left: 20,
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    zIndex: 10,
  },
});
