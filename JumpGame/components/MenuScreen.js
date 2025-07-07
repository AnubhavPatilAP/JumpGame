import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function MenuScreen({ onStart }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tree Jumper</Text>

      <TouchableOpacity style={styles.startButton} onPress={onStart}>
        <Text style={styles.startText}>Start Game</Text>
      </TouchableOpacity>

      <View style={styles.instructionsPanel}>
        <Text style={styles.instructionHeader}>How to Play</Text>
        <Text style={styles.instruction}>• Use arrow keys or on-screen buttons to move</Text>
        <Text style={styles.instruction}>• Jump on branches to climb higher</Text>
        <Text style={styles.instruction}>• Each branch disappears after two jumps</Text>
        <Text style={styles.instruction}>• Don't fall off the screen</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#71c4ef', // vibrant sky blue
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 44,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 40,
    textShadowColor: '#4fa3d1',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    letterSpacing: 2,
  },
  startButton: {
    backgroundColor: '#33c37d',
    paddingVertical: 16,
    paddingHorizontal: 50,
    borderRadius: 32,
    elevation: 8,
    shadowColor: '#2e7d32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    marginBottom: 35,
  },
  startText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 1,
  },
  instructionsPanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    width: '90%',
    maxWidth: 360,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },
  instructionHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  instruction: {
    fontSize: 16,
    color: '#444',
    marginBottom: 8,
    lineHeight: 22,
  },
});
