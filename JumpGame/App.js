import React, { useEffect, useState, useRef } from 'react';
import { Dimensions, Platform as RNPlatform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { Asset } from 'expo-asset';

import Player from './components/Player';
import PlatformBlock from './components/Platform'; 
import MenuScreen from './components/MenuScreen';
import GameOverScreen from './components/GameOverScreen';
import GameUI from './components/GameUI';
import Controls from './components/Controls';
import Background from './components/Background';

const { width, height } = Dimensions.get('window');
const PLAYER_SIZE = 60;
const PLATFORM_WIDTH = 130;
const PLATFORM_HEIGHT = 20;
const GRAVITY = 0.6;
const JUMP_VELOCITY = RNPlatform.OS === 'web' ? -18 : -12; 
const PLATFORM_X_RANGE = { min: width * 0.15, max: width * 0.55 - PLATFORM_WIDTH };
const PLATFORM_Y_GAP_RANGE = { min: 90, max: 130 };
const MAX_PLATFORM_Y = height - 150;

SplashScreen.preventAutoHideAsync();

let platformIdCounter = 0;

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
  const [score, setScore] = useState(0);
  const scoredPlatforms = useRef(new Set());

  useEffect(() => {
    async function prepare() {
      try {
        await Asset.loadAsync([
          require('./assets/player.png') // Only preload player
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

  useEffect(() => {
    if (isReady && !showMenu) {
      const initial = [];
      let y = MAX_PLATFORM_Y;
      const initialPlatformCount = RNPlatform.OS === 'web' ? 6 : 4;

      for (let i = 0; i < initialPlatformCount; i++) {
        const x = Math.random() * (width - PLATFORM_WIDTH);
        initial.push({ id: platformIdCounter++, x, y });
        const extraGap = RNPlatform.OS === 'web' ? 0 : 20;
        const gapY = Math.random() * (PLATFORM_Y_GAP_RANGE.max - PLATFORM_Y_GAP_RANGE.min) + PLATFORM_Y_GAP_RANGE.min + extraGap;
        y -= gapY;
        if (y < 0) break;
      }

      setPlatforms(initial);
      scoredPlatforms.current.clear();
      setScore(0);
      const lowest = initial.reduce((a, b) => (a.y > b.y ? a : b));
      setPlayerX(lowest.x + PLATFORM_WIDTH / 2 - PLAYER_SIZE / 2);
      setPlayerY(lowest.y - PLAYER_SIZE);
      setVelocityY(0);
    }
  }, [isReady, showMenu]);

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

        for (let p of platforms) {
          const withinX = playerX + PLAYER_SIZE > p.x && playerX < p.x + PLATFORM_WIDTH;
          const withinY = y + PLAYER_SIZE >= p.y && y + PLAYER_SIZE <= p.y + PLATFORM_HEIGHT;
          if (withinX && withinY && newVelocity > 0) {
            setVelocityY(JUMP_VELOCITY);
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

      // ✅ Screen wrap logic for both web & mobile
      setPlayerX((x) => {
        let newX = x;
        if (direction === 'left') {
          newX -= speed;
          if (newX + PLAYER_SIZE < 0) newX = width;
        } else if (direction === 'right') {
          newX += speed;
          if (newX > width) newX = -PLAYER_SIZE;
        }
        return newX;
      });

      if (playerY < height / 2) {
        const diff = height / 2 - playerY;
        scrollOffset.current += diff;
        setPlayerY(height / 2);

        setPlatforms((prev) =>
          prev.map((p) => ({ ...p, y: p.y + diff })).filter((p) => p.y < height + 100)
        );

        const topMost = Math.min(...platforms.map((p) => p.y));
        const extraGap = RNPlatform.OS === 'web' ? 0 : 20;
        const gapY = Math.random() * (PLATFORM_Y_GAP_RANGE.max - PLATFORM_Y_GAP_RANGE.min) + PLATFORM_Y_GAP_RANGE.min + extraGap;
        const newY = topMost - gapY;

        if (newY >= 0) {
          const newPlatform = {
            id: platformIdCounter++,
            x: Math.random() * (width - PLATFORM_WIDTH),
            y: newY,
          };
          setPlatforms((prev) => [newPlatform, ...prev]);
        }
      }
    }, 16);

    return () => clearInterval(interval);
  }, [isReady, showMenu, velocityY, direction, playerY, gameOver]);

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

  if (!isReady) return null;

  if (showMenu)
    return <MenuScreen onStart={() => setShowMenu(false)} />;

  if (gameOver)
    return (
      <GameOverScreen
        score={score}
        onRestart={() => {
          setShowMenu(true);
          setGameOver(false);
        }}
      />
    );

  return (
    <Background>
      <GameUI
        score={score}
        platforms={platforms}
        playerX={playerX}
        playerY={playerY}
        facing={facing}
      />
      {RNPlatform.OS !== 'web' && (
        <Controls
          onLeft={() => {
            setDirection('left');
            setFacing('left');
          }}
          onRight={() => {
            setDirection('right');
            setFacing('right');
          }}
          onRelease={() => setDirection(null)}
        />
      )}
    </Background>
  );
}
