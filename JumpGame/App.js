import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Player from './components/Player';
import Platform from './components/Platform';

const { width, height } = Dimensions.get('window');
const PLAYER_SIZE = 60;
const PLATFORM_HEIGHT = 20;

export default function App() {
  const [playerY, setPlayerY] = useState(height - 200);
  const [velocityY, setVelocityY] = useState(0);
  const gravity = 0.6;

  const platformY = useRef(height - 100).current;

  useEffect(() => {
    const interval = setInterval(() => {
      setVelocityY((v) => v + gravity);
      setPlayerY((y) => {
        const newY = y + velocityY;

        if (
          newY + PLAYER_SIZE >= platformY &&
          newY + PLAYER_SIZE <= platformY + PLATFORM_HEIGHT &&
          velocityY > 0
        ) {
          setVelocityY(-15); // bounce
        }

        return newY;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [velocityY]);

  return (
    <View style={styles.container}>
      <Player y={playerY} />
      <Platform y={platformY} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87ceeb',
  },
});
