import React from 'react';
import { View, StyleSheet } from 'react-native';

const Platform = ({ x, y }) => {
  return (
    <View style={[styles.platform, { left: x, top: y }]} />
  );
};

const styles = StyleSheet.create({
  platform: {
    position: 'absolute',
    width: 100,
    height: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2E7D32',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
});

export default Platform;
