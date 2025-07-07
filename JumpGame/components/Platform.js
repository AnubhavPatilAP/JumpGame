import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const Platform = ({ x, y, type = 'base', moving = false }) => {
  const [posX, setPosX] = useState(x);
  const [direction, setDirection] = useState(1); // 1 = right, -1 = left
  const originalX = useRef(x); // Store the initial X position
  const movementRange = 50; // pixels left/right from original

  // Moving logic
  useEffect(() => {
    if (!moving) return;

    const interval = setInterval(() => {
      setPosX((prevX) => {
        const platformWidth = getStyle().width || 120;
        const nextX = prevX + direction * 2;

        const minX = Math.max(0, originalX.current - movementRange);
        const maxX = Math.min(SCREEN_WIDTH - platformWidth, originalX.current + movementRange);

        if (nextX <= minX || nextX >= maxX) {
          setDirection((d) => -d);
          return prevX;
        }

        return nextX;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [moving, direction]);

  const getStyle = () => {
    switch (type) {
      case 'small':
        return styles.smallBranch;
      case 'fragile':
        return styles.fragileBranch;
      case 'moving':
        return styles.movingBranch;
      default:
        return styles.branch;
    }
  };

  return <View style={[getStyle(), { left: posX, top: y }]} />;
};

const baseStyle = {
  position: 'absolute',
  height: 18,
  borderRadius: 10,
  borderWidth: 1,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3,
  elevation: 5,
};

const styles = StyleSheet.create({
  branch: {
    ...baseStyle,
    width: 120,
    backgroundColor: '#8B5A2B',
    borderColor: '#5C3A1E',
  },
  smallBranch: {
    ...baseStyle,
    width: 90,
    backgroundColor: '#4E342E',
    borderColor: '#3E2723',
    borderWidth: 2,
  },
  fragileBranch: {
    ...baseStyle,
    width: 120,
    backgroundColor: '#F5DEB3',
    borderColor: '#D2B48C',
    borderStyle: 'dashed',
    shadowOpacity: 0.1,
    elevation: 2,
  },
  movingBranch: {
    ...baseStyle,
    width: 120,
    backgroundColor: '#6B8E23',
    borderColor: '#556B2F',
    shadowColor: '#333',
    shadowOpacity: 0.35,
    elevation: 6,
  },
});

export default Platform;
