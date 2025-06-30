import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  TouchableOpacity,
  Platform as RNPlatform,
} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { Asset } from 'expo-asset';
import Player from './components/Player';
import PlatformBlock from './components/Platform';

const { width, height } = Dimensions.get('window');
const PLAYER_SIZE = 60;
const PLATFORM_WIDTH = 100;
const PLATFORM_HEIGHT = 20;
const GRAVITY = 0.6;
const JUMP_VELOCITY = -15;
const MAX_JUMP_HEIGHT = 250;

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [showMenu, setShowMenu] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [playerY, setPlayerY] = useState(height - 200);
  const [playerX, setPlayerX] = useState(width / 2 - PLAYER_SIZE / 2);
  const [velocityY, setVelocityY] = useState(0);
  const [direction, setDirection] = useState(null); // 'left' or 'right'
  const [platforms, setPlatforms] = useState([]);
  const speed = 5;

  const scrollOffset = useRef(0); // how far the game has scrolled

  // Load assets
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
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  // Generate initial platforms and place player on the lowest one
  useEffect(() => {
    if (isReady && !showMenu) {
      const initial = [];
      let y = height - 100;

      for (let i = 0; i < 6; i++) {
        const x = Math.random() * (width - PLATFORM_WIDTH);
        initial.push({ x, y });
        y -= Math.random() * 120 + 80;
      }

      setPlatforms(initial);

      // Place player centered on lowest platform
      const lowest = initial.reduce((a, b) => (a.y > b.y ? a : b));
      setPlayerX(lowest.x + PLATFORM_WIDTH / 2 - PLAYER_SIZE / 2);
      setPlayerY(lowest.y - PLAYER_SIZE);
      setVelocityY(0); // start stationary
    }
  }, [isReady, showMenu]);


  // Game loop
  useEffect(() => {
    if (!isReady || showMenu || gameOver) return;

    const interval = setInterval(() => {
      setPlayerY((y) => {
        const newVelocity = velocityY + GRAVITY;
        const newY = y + newVelocity;

        // Game over check
        if (newY > height) {
          setGameOver(true);
          return y;
        }

        // Collision detection
        for (let p of platforms) {
          const withinX = playerX + PLAYER_SIZE > p.x && playerX < p.x + PLATFORM_WIDTH;
          const withinY = y + PLAYER_SIZE >= p.y && y + PLAYER_SIZE <= p.y + PLATFORM_HEIGHT;
          if (withinX && withinY && newVelocity > 0) {
            setVelocityY(JUMP_VELOCITY);
            return y - 15;
          }
        }

        setVelocityY(newVelocity);
        return newY;
      });

      setPlayerX((x) => {
        if (direction === 'left') return Math.max(0, x - speed);
        if (direction === 'right') return Math.min(width - PLAYER_SIZE, x + speed);
        return x;
      });

      // Scroll platforms down if player is high
      if (playerY < height / 2) {
        const diff = height / 2 - playerY;
        scrollOffset.current += diff;
        setPlayerY(height / 2);
        setPlatforms((prev) =>
          prev
            .map((p) => ({ ...p, y: p.y + diff }))
            .filter((p) => p.y < height + 100) // keep only visible
        );

        // Generate new platforms at top
        const topMost = Math.min(...platforms.map((p) => p.y));
        if (topMost > 0) {
          const newPlatform = {
            x: Math.random() * (width - PLATFORM_WIDTH),
            y: topMost - (Math.random() * 120 + 80),
          };
          setPlatforms((prev) => [newPlatform, ...prev]);
        }
      }
    }, 16);

    return () => clearInterval(interval);
  }, [isReady, showMenu, velocityY, direction, playerY, gameOver]);

  if (!isReady) return null;

  if (showMenu) {
    return (
      <View style={styles.menuContainer}>
        <Text style={styles.title}>🪂 Doodle Jump</Text>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => {
            setShowMenu(false);
            setGameOver(false);
            setPlayerY(height - 200);
            setVelocityY(0);
            scrollOffset.current = 0;
          }}
        >
          <Text style={styles.startText}>Start Game</Text>
        </TouchableOpacity>
        <Text style={styles.instructions}>Tap arrows or use keys ← →</Text>
      </View>
    );
  }

  if (gameOver) {
    return (
      <View style={styles.menuContainer}>
        <Text style={styles.title}>☠ Game Over</Text>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => {
            setShowMenu(true);
            setGameOver(false);
          }}
        >
          <Text style={styles.startText}>Back to Menu</Text>
        </TouchableOpacity>
        <Text style={styles.instructions}>You fell off the screen</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Player x={playerX} y={playerY} />
      {platforms.map((p, index) => (
        <PlatformBlock key={index} x={p.x} y={p.y} />
      ))}

      {/* Mobile Controls */}
      {RNPlatform.OS !== 'web' && (
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPressIn={() => setDirection('left')}
            onPressOut={() => setDirection(null)}
          >
            <Text style={styles.controlText}>◀</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlButton}
            onPressIn={() => setDirection('right')}
            onPressOut={() => setDirection(null)}
          >
            <Text style={styles.controlText}>▶</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87ceeb',
  },
  menuContainer: {
    flex: 1,
    backgroundColor: '#87ceeb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  startButton: {
    backgroundColor: '#33c37d',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginBottom: 20,
  },
  startText: {
    fontSize: 20,
    color: '#fff',
  },
  instructions: {
    fontSize: 16,
    color: '#333',
    marginTop: 10,
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  controlButton: {
    backgroundColor: '#00000088',
    padding: 20,
    borderRadius: 40,
  },
  controlText: {
    fontSize: 24,
    color: '#fff',
  },
});
