import React from 'react';
import { TouchableOpacity, Image, StyleSheet } from 'react-native';

export default function ImageButton({ source, onPress, style }) {
  return (
    <TouchableOpacity onPress={onPress} style={style}>
      <Image source={source} style={styles.image} resizeMode="contain" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 200,
    height: 80,
  },
});
