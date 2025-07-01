import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function MenuScreen({ onStart }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🪂 Doodle Jump</Text>
      <TouchableOpacity style={styles.button} onPress={onStart}>
        <Text style={styles.buttonText}>Start Game</Text>
      </TouchableOpacity>
      <Text style={styles.instructions}>Use ← → keys or touch buttons</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#87ceeb', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 36, fontWeight: 'bold' },
  button: { backgroundColor: '#33c37d', padding: 15, borderRadius: 12, marginTop: 20 },
  buttonText: { color: '#fff', fontSize: 20 },
  instructions: { fontSize: 16, marginTop: 10 },
});
