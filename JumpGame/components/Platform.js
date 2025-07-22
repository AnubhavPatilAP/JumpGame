import React from 'react';
import { View, StyleSheet, Platform as RNPlatform, Text } from 'react-native';

const Platform = ({
  x,
  y,
  type = 'base',
  jumpCount = 0,
  status = 'idle',
  showDebug = false,
}) => {
  const getWidthByType = (platformType) => {
    if (platformType === 'small') return RNPlatform.OS === 'web' ? 90 : 70;
    return RNPlatform.OS === 'web' ? 120 : 100;
  };

  const getHeight = () => (RNPlatform.OS === 'web' ? 18 : 14);

  const getStyle = () => {
    const width = getWidthByType(type);
    const height = getHeight();

    switch (type) {
      case 'small':
        return {
          ...baseStyle,
          width,
          height,
          backgroundColor: '#4E342E',
          borderColor: '#3E2723',
          borderWidth: 2,
        };
      case 'fragile':
        return status === 'breaking'
          ? {
              ...baseStyle,
              width,
              height,
              backgroundColor: '#FFDAB9',
              borderColor: '#D2691E',
              borderStyle: 'dashed',
              shadowOpacity: 0.1,
              elevation: 2,
              transform: [{ rotate: '-1deg' }],
            }
          : {
              ...baseStyle,
              width,
              height,
              backgroundColor: '#F5DEB3',
              borderColor: '#D2B48C',
              borderStyle: 'dashed',
              shadowOpacity: 0.1,
              elevation: 2,
            };
      case 'moving':
        return {
          ...baseStyle,
          width,
          height,
          backgroundColor: '#6B8E23',
          borderColor: '#556B2F',
          shadowColor: '#333',
          shadowOpacity: 0.35,
          elevation: 6,
        };
      default:
        return {
          ...baseStyle,
          width,
          height,
          backgroundColor: '#8B5A2B',
          borderColor: '#5C3A1E',
        };
    }
  };

  return (
    <View style={[getStyle(), { position: 'absolute', left: x, top: y }]}>
      {status === 'breaking' && type === 'fragile' && <View style={styles.crackLine} />}
      {showDebug && <Text style={styles.debugText}>Jumps: {jumpCount}</Text>}
    </View>
  );
};

const baseStyle = {
  borderRadius: 10,
  borderWidth: 1,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3,
  elevation: 5,
};

const styles = StyleSheet.create({
  crackLine: {
    position: 'absolute',
    top: 6,
    left: 20,
    width: 80,
    height: 2,
    backgroundColor: '#800000',
    transform: [{ rotate: '-20deg' }],
  },
  debugText: {
    fontSize: 10,
    color: 'white',
    textAlign: 'center',
    marginTop: 1,
  },
});

export default Platform;
