import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function GameOverScreen({ score, onRestart }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>☠ Game Over</Text>
      <Text style={styles.score}>Score: {score}</Text>
      <TouchableOpacity style={styles.button} onPress={onRestart}>
        <Text style={styles.buttonText}>Back to Menu</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#87ceeb', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold' },
  score: { fontSize: 24, marginTop: 10 },
  button: { backgroundColor: '#33c37d', padding: 15, borderRadius: 12, marginTop: 20 },
  buttonText: { color: '#fff', fontSize: 18 },
});
