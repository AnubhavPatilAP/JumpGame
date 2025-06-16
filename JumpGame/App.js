import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions, Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { Asset } from 'expo-asset';
import Player from './components/Player';
import Platform from './components/Platform';

const { width, height } = Dimensions.get('window');
const PLAYER_SIZE = 60;
const PLATFORM_HEIGHT = 20;

SplashScreen.preventAutoHideAsync(); // Splash will stay until manually hidden

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [playerY, setPlayerY] = useState(height - 200);
  const [velocityY, setVelocityY] = useState(0);
  const gravity = 0.6;
  const platformY = height - 100;

  // Load assets (optional if your PNGs are imported via require)
  useEffect(() => {
    async function prepare() {
      try {
        await Asset.loadAsync([
          require('./assets/player.png'),
          require('./assets/platform.png'),
        ]);
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync(); // Hide splash screen when ready
      }
    }

    prepare();
  }, []);

  // Game loop
  useEffect(() => {
    if (!isReady) return;

    const interval = setInterval(() => {
      setPlayerY((y) => {
        const newVelocity = velocityY + gravity;
        const newY = y + newVelocity;

        // Collision detection
        if (
          newY + PLAYER_SIZE >= platformY &&
          newY + PLAYER_SIZE <= platformY + PLATFORM_HEIGHT &&
          velocityY > 0
        ) {
          setVelocityY(-15); // jump
          return y - 15;
        }

        setVelocityY(newVelocity);
        return newY;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [isReady, velocityY]);

  if (!isReady) return null;

  // Error boundary wrap
  try {
    return (
      <View style={styles.container}>
        <Player y={playerY} />
        <Platform y={platformY} />
      </View>
    );
  } catch (e) {
    console.error('Render Error:', e);
    return (
      <View style={styles.container}>
        <Text style={{ color: 'red', fontSize: 20 }}>Something went wrong</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87ceeb',
  },
});
