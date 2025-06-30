import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ImageButton from './ImageButton';

export default function GameOverMenu({ onRestart, score, highScore }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>☠ Game Over</Text>
      <Text style={styles.score}>Your Score: {score}</Text>
      <Text style={styles.score}>High Score: {highScore}</Text>

      <ImageButton
        source={require('../assets/restart_button.png')}
        onPress={onRestart}
        style={styles.restartBtn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#87ceeb', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 36, fontWeight: 'bold', marginBottom: 20 },
  score: { fontSize: 20, marginBottom: 10 },
  restartBtn: { marginTop: 20 },
});
