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

const JUMP_VELOCITY = -18;
const PLATFORM_X_RANGE = {
  min: width * 0.25,
  max: width * 0.75 - PLATFORM_WIDTH,
};
const PLATFORM_Y_GAP_RANGE = {
  min: 90,
  max: 130,
};
const MAX_PLATFORM_Y = height - 150;

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [showMenu, setShowMenu] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [playerY, setPlayerY] = useState(height - 200);
  const [playerX, setPlayerX] = useState(width / 2 - PLAYER_SIZE / 2);
  const [velocityY, setVelocityY] = useState(0);
  const [direction, setDirection] = useState(null);
  const [facing, setFacing] = useState('right');
  const [platforms, setPlatforms] = useState([]);
  const scrollOffset = useRef(0);
  const speed = 5;

  // 🟩 Score logic
  const [score, setScore] = useState(0);
  const scoredPlatforms = useRef(new Set());

  //--------------- Load Assets ---------------
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

  //--------------- Generate Initial Platforms ---------------
  useEffect(() => {
    if (isReady && !showMenu) {
      const initial = [];
      let y = MAX_PLATFORM_Y;

      for (let i = 0; i < 6; i++) {
        const x = RNPlatform.OS === 'web'
          ? Math.random() * (PLATFORM_X_RANGE.max - PLATFORM_X_RANGE.min) + PLATFORM_X_RANGE.min
          : Math.random() * (width - PLATFORM_WIDTH);

        initial.push({ id: i, x, y }); // give each platform an id
        const gapY = Math.random() * (PLATFORM_Y_GAP_RANGE.max - PLATFORM_Y_GAP_RANGE.min) + PLATFORM_Y_GAP_RANGE.min;
        y -= gapY;
        if (y < 0) break;
      }

      setPlatforms(initial);
      scoredPlatforms.current.clear(); // 🟩 reset score state
      setScore(0);

      const lowest = initial.reduce((a, b) => (a.y > b.y ? a : b));
      setPlayerX(lowest.x + PLATFORM_WIDTH / 2 - PLAYER_SIZE / 2);
      setPlayerY(lowest.y - PLAYER_SIZE);
      setVelocityY(0);
    }
  }, [isReady, showMenu]);

  //--------------- Game Loop ---------------
  useEffect(() => {
    if (!isReady || showMenu || gameOver) return;

    const interval = setInterval(() => {
      setPlayerY((y) => {
        const newVelocity = velocityY + GRAVITY;
        const newY = y + newVelocity;

        if (newY > height) {
          setGameOver(true);
          return y;
        }

        // Platform collision
        for (let p of platforms) {
          const withinX = playerX + PLAYER_SIZE > p.x && playerX < p.x + PLATFORM_WIDTH;
          const withinY = y + PLAYER_SIZE >= p.y && y + PLAYER_SIZE <= p.y + PLATFORM_HEIGHT;
          if (withinX && withinY && newVelocity > 0) {
            setVelocityY(JUMP_VELOCITY);

            // 🟩 If platform not already scored, add score
            if (!scoredPlatforms.current.has(p.id)) {
              scoredPlatforms.current.add(p.id);
              setScore((s) => s + 1);
            }

            return y - 15;
          }
        }

        setVelocityY(newVelocity);
        return newY;
      });

      // Horizontal movement
      setPlayerX((x) => {
        if (direction === 'left') return Math.max(0, x - speed);
        if (direction === 'right') return Math.min(width - PLAYER_SIZE, x + speed);
        return x;
      });

      // Scroll + generate new platforms
      if (playerY < height / 2) {
        const diff = height / 2 - playerY;
        scrollOffset.current += diff;
        setPlayerY(height / 2);

        setPlatforms((prev) =>
          prev
            .map((p) => ({ ...p, y: p.y + diff }))
            .filter((p) => p.y < height + 100)
        );

        const topMost = Math.min(...platforms.map((p) => p.y));
        const gapY = Math.random() * (PLATFORM_Y_GAP_RANGE.max - PLATFORM_Y_GAP_RANGE.min) + PLATFORM_Y_GAP_RANGE.min;
        const newY = topMost - gapY;

        if (newY >= 0) {
          const newPlatform = {
            id: Date.now(), // unique ID
            x: RNPlatform.OS === 'web'
              ? Math.random() * (PLATFORM_X_RANGE.max - PLATFORM_X_RANGE.min) + PLATFORM_X_RANGE.min
              : Math.random() * (width - PLATFORM_WIDTH),
            y: newY,
          };
          setPlatforms((prev) => [newPlatform, ...prev]);
        }
      }
    }, 16);

    return () => clearInterval(interval);
  }, [isReady, showMenu, velocityY, direction, playerY, gameOver]);

  //--------------- Keyboard Controls ---------------
  useEffect(() => {
    if (RNPlatform.OS === 'web') {
      const handleKeyDown = (e) => {
        if (e.key === 'ArrowLeft') {
          setDirection('left');
          setFacing('left');
        } else if (e.key === 'ArrowRight') {
          setDirection('right');
          setFacing('right');
        }
      };
      const handleKeyUp = (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          setDirection(null);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }
  }, []);

  //--------------- UI: Menu / Game Over ---------------
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
        <Text style={styles.score}>Score: {score}</Text>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => {
            setShowMenu(true);
            setGameOver(false);
          }}
        >
          <Text style={styles.startText}>Back to Menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  //--------------- Game UI ---------------
  return (
    <View style={styles.container}>
      <Text style={styles.scoreText}>Score: {score}</Text>
      <Player x={playerX} y={playerY} facing={facing} />
      {platforms.map((p) => (
        <PlatformBlock key={p.id} x={p.x} y={p.y} />
      ))}

      {RNPlatform.OS !== 'web' && (
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPressIn={() => {
              setDirection('left');
              setFacing('left');
            }}
            onPressOut={() => setDirection(null)}
          >
            <Text style={styles.controlText}>◀</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlButton}
            onPressIn={() => {
              setDirection('right');
              setFacing('right');
            }}
            onPressOut={() => setDirection(null)}
          >
            <Text style={styles.controlText}>▶</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

//--------------- Styles ---------------
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
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#33c37d',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginTop: 20,
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
  score: {
    fontSize: 24,
    marginTop: 10,
    fontWeight: 'bold',
  },
  scoreText: {
    position: 'absolute',
    top: 40,
    left: 20,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    zIndex: 10,
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
