import React, { useEffect, useState, useRef } from 'react';
import { Dimensions, Platform as RNPlatform } from 'react-native';
import GameUI from './components/GameUI';
import Controls from './components/Controls';
import Background from './components/Background';

// Cross-platform screen/window size
const { width, height } =
  RNPlatform.OS === 'web' ? Dimensions.get('window') : Dimensions.get('screen');

const SCREEN_WIDTH = width;
const SCREEN_HEIGHT = height;

//----------------Constants-----------
const PLAYER_SIZE = RNPlatform.OS === 'web' ? 70 : 50;
const GRAVITY = 0.6;
const JUMP_VELOCITY = RNPlatform.OS === 'web' ? -20 : -16;

const PLATFORM_Y_GAP_RANGE = RNPlatform.OS === 'web'
  ? { min: 120, max: 150 }
  : { min: 80, max: 110 };

const MAX_PLATFORM_Y = SCREEN_HEIGHT - 150;
const TREE_WIDTH = RNPlatform.OS === 'web' ? SCREEN_WIDTH * 0.3 : SCREEN_WIDTH * 0.4;
const TREE_LEFT = (SCREEN_WIDTH - TREE_WIDTH) / 2;

let platformIdCounter = 0;

//----------------Function----------- Spawn platform type
const spawnPlatformType = (score = 0) => {
  if (score < 5) return Math.random() < 0.3 ? 'small' : 'base';
  if (score < 10) return ['base', 'small', 'fragile'][Math.floor(Math.random() * 3)];
  return ['base', 'small', 'fragile', 'moving'][Math.floor(Math.random() * 4)];
};

//----------------Function----------- Generate one platform
// Global variable to track spawn side (for mobile only)
let lastPlatformSide = 'right'; // start with right

const generatePlatform = (y, score, existingPlatforms = []) => {
  const type = spawnPlatformType(score);
  const platformWidth = RNPlatform.OS === 'web' ? 100 : 80;
  const MIN_Y_DIFF = 100;
  const MAX_ATTEMPTS = 20;
  const margin = 10;

  let newX, newY = y;
  let attempt = 0;

  const lastPlatform = existingPlatforms[existingPlatforms.length - 1];

  const isOverlappingX = (aStart, aEnd, bStart, bEnd, margin = 0) => {
    return !(aEnd + margin < bStart || aStart > bEnd + margin);
  };

  const getZigZagX = () => {
    if (RNPlatform.OS === 'web') {
      return Math.random() * (TREE_WIDTH - platformWidth) + TREE_LEFT;
    }

    // Force strict alternation on mobile
    const leftMin = margin;
    const leftMax = SCREEN_WIDTH / 2 - platformWidth - margin;
    const rightMin = SCREEN_WIDTH / 2 + margin;
    const rightMax = SCREEN_WIDTH - platformWidth - margin;

    let x;

    if (lastPlatformSide === 'right') {
      x = Math.random() * (leftMax - leftMin) + leftMin;
      lastPlatformSide = 'left';
    } else {
      x = Math.random() * (rightMax - rightMin) + rightMin;
      lastPlatformSide = 'right';
    }

    return x;
  };

  do {
    newX = getZigZagX();

    const conflict = existingPlatforms.some((p) => {
      const yTooClose = Math.abs(p.y - newY) < MIN_Y_DIFF;
      const xOverlap = isOverlappingX(p.x, p.x + platformWidth, newX, newX + platformWidth);
      return yTooClose && xOverlap;
    });

    if (!conflict) break;

    newY += 10;
    attempt++;
  } while (attempt < MAX_ATTEMPTS);

  if (attempt === MAX_ATTEMPTS) {
    newX = getZigZagX(); // fallback if stuck
  }

  return {
    id: platformIdCounter++,
    x: newX,
    y: newY,
    type,
    jumpCount: 0,
    status: 'idle',
    moving: type === 'moving',
    direction: 1,
    speed: 2,
  };
};



//----------------Component----------- GameEngine
export default function GameEngine({ onGameOver }) {
  const [playerY, setPlayerY] = useState(SCREEN_HEIGHT - 200);
  const [playerX, setPlayerX] = useState(SCREEN_WIDTH / 2 - PLAYER_SIZE / 2);
  const [velocityY, setVelocityY] = useState(0);
  const [direction, setDirection] = useState(null);
  const [facing, setFacing] = useState('right');
  const [platforms, setPlatforms] = useState([]);
  const [score, setScore] = useState(0);
  const [isDead, setIsDead] = useState(false);

  const scrollOffset = useRef(0);
  const scoredPlatforms = useRef(new Set());
  const velocityYRef = useRef(velocityY);
  const speed = 5;

  useEffect(() => {
    velocityYRef.current = velocityY;
  }, [velocityY]);

  useEffect(() => {
    const initial = [];
    let y = MAX_PLATFORM_Y;
    const count = RNPlatform.OS === 'web' ? 6 : 4;

    const startPlatform = {
      id: platformIdCounter++,
      x: SCREEN_WIDTH / 2 - 100 / 2,
      y,
      type: 'base',
      jumpCount: 0,
      status: 'idle',
      moving: false,
      direction: 0,
      speed: 0,
    };
    initial.push(startPlatform);
    y -= 100;

    for (let i = 1; i < count; i++) {
      const p = generatePlatform(y, 0, initial);
      initial.push(p);
      const extraGap = RNPlatform.OS === 'web' ? 0 : 20;
      const gapY = Math.random() * (PLATFORM_Y_GAP_RANGE.max - PLATFORM_Y_GAP_RANGE.min) + PLATFORM_Y_GAP_RANGE.min + extraGap;
      y -= gapY;
      if (y < 0) break;
    }

    setPlatforms(initial);
    scoredPlatforms.current.clear();
    setScore(0);
    setPlayerX(startPlatform.x + 50 - PLAYER_SIZE / 2);
    setPlayerY(startPlatform.y - PLAYER_SIZE);
    setVelocityY(0);
    setIsDead(false);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      let jumped = false;

      setPlatforms((prev) => {
        return prev
          .map((p) => {
            const withinX = playerX + PLAYER_SIZE > p.x && playerX < p.x + 100;
            const justLanded = playerY + PLAYER_SIZE <= p.y + 15 && playerY + PLAYER_SIZE + velocityYRef.current >= p.y - 5;
            const falling = velocityYRef.current > 0;

            if (withinX && justLanded && falling && !jumped) {
              jumped = true;
              const newJumpCount = p.jumpCount + 1;
              setVelocityY(JUMP_VELOCITY);

              if (!scoredPlatforms.current.has(p.id)) {
                scoredPlatforms.current.add(p.id);
                setScore((s) => s + 1);
              }

              const maxJumps = p.type === 'fragile' ? 1 : Infinity;
              if (newJumpCount >= maxJumps && p.status === 'idle') {
                return { ...p, jumpCount: newJumpCount, status: 'breaking' };
              }
              return { ...p, jumpCount: newJumpCount };
            }

            if (p.type === 'moving') {
              let newX = p.x + p.direction * p.speed;
              const movementRange = 50;
              const minX = Math.max(0, p.x - movementRange);
              const maxX = Math.min(SCREEN_WIDTH - 100, p.x + movementRange);

              if (newX < minX || newX > maxX) {
                p.direction = -p.direction;
                newX = p.x + p.direction * p.speed;
              }

              return { ...p, x: newX, direction: p.direction };
            }

            if (p.status === 'breaking') return { ...p, toRemove: true };

            return p;
          })
          .filter((p) => !p.toRemove);
      });

      setPlayerY((y) => {
        const newVelocity = velocityYRef.current + GRAVITY;
        const newY = y + newVelocity;
        if (newY > SCREEN_HEIGHT && !isDead) {
          setIsDead(true);
          return y;
        }
        setVelocityY(newVelocity);
        return newY;
      });

      setPlayerX((x) => {
        let newX = x;
        if (direction === 'left') {
          newX -= speed;
          if (newX + PLAYER_SIZE < 0) newX = SCREEN_WIDTH;
        } else if (direction === 'right') {
          newX += speed;
          if (newX > SCREEN_WIDTH) newX = -PLAYER_SIZE;
        }
        return newX;
      });

      if (playerY < SCREEN_HEIGHT / 2) {
        const diff = SCREEN_HEIGHT / 2 - playerY;
        scrollOffset.current += diff;
        setPlayerY(SCREEN_HEIGHT / 2);

        setPlatforms((prev) => {
          const scrolled = prev.map((p) => ({ ...p, y: p.y + diff })).filter((p) => p.y < SCREEN_HEIGHT + 500 || p.type === 'base');

          let topY = Math.min(...scrolled.map((p) => p.y));
          const extraGap = RNPlatform.OS === 'web' ? 0 : 20;
          const baseGap = Math.random() * (PLATFORM_Y_GAP_RANGE.max - PLATFORM_Y_GAP_RANGE.min) + PLATFORM_Y_GAP_RANGE.min + extraGap;
          const newY = topY - baseGap;

          if (newY > -100) {
            const newPlatform = generatePlatform(newY, score, scrolled);
            scrolled.unshift(newPlatform);
          }

          return scrolled;
        });
      }
    }, 16);

    return () => clearInterval(interval);
  }, [direction, playerY, score, isDead]);

  useEffect(() => {
    if (isDead) onGameOver(score);
  }, [isDead]);

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

  return (
    <Background>
      <GameUI
        score={score}
        platforms={platforms}
        playerX={playerX}
        playerY={playerY}
        facing={facing}
        playerSize={PLAYER_SIZE}
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
