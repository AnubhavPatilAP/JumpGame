import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function Controls({ onLeft, onRight, onRelease }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPressIn={onLeft} onPressOut={onRelease}>
        <Text style={styles.text}>◀</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPressIn={onRight} onPressOut={onRelease}>
        <Text style={styles.text}>▶</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    backgroundColor: '#00000088',
    padding: 20,
    borderRadius: 40,
  },
  text: {
    fontSize: 24,
    color: '#fff',
  },
});
