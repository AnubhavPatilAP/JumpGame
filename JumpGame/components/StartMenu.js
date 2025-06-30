import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import ImageButton from './ImageButton';

export default function StartMenu({ onStart, musicOn, toggleMusic }) {
  const [selected, setSelected] = useState('easy');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎮 Doodle Jump</Text>

      <Text style={styles.label}>Select Difficulty:</Text>
      <View style={styles.difficultyRow}>
        {['easy', 'medium', 'hard'].map((level) => (
          <TouchableOpacity
            key={level}
            onPress={() => setSelected(level)}
            style={[styles.difficultyButton, selected === level && styles.selected]}
          >
            <Text style={styles.difficultyText}>{level.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ImageButton
        source={require('../assets/start_button.png')}
        onPress={() => onStart(selected)}
        style={styles.startBtn}
      />

      <TouchableOpacity onPress={toggleMusic}>
        <Image
          source={
            musicOn
              ? require('../assets/music_on.png')
              : require('../assets/music_off.png')
          }
          style={styles.musicIcon}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#87ceeb' },
  title: { fontSize: 36, fontWeight: 'bold', marginBottom: 30 },
  label: { fontSize: 18, marginBottom: 10 },
  difficultyRow: { flexDirection: 'row', marginBottom: 30 },
  difficultyButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    backgroundColor: '#ccc',
    borderRadius: 8,
  },
  selected: { backgroundColor: '#33c37d' },
  difficultyText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  startBtn: { marginBottom: 30 },
  musicIcon: { width: 40, height: 40 },
});
