import React, { useEffect, useState, useRef } from 'react';
import { Dimensions, Platform as RNPlatform } from 'react-native';
import GameUI from './components/GameUI';
import Controls from './components/Controls';
import Background from './components/Background';

const { width, height } = Dimensions.get('window');

//----------------Constants-----------
const PLAYER_SIZE = RNPlatform.OS === 'web' ? 70 : 50;
const GRAVITY = 0.6;
const JUMP_VELOCITY = RNPlatform.OS === 'web' ? -20 : -12;

const PLATFORM_Y_GAP_RANGE = RNPlatform.OS === 'web'
  ? { min: 120, max: 150 }
  : { min: 80, max: 110 };

const MAX_PLATFORM_Y = height - 150;
const TREE_WIDTH = RNPlatform.OS === 'web' ? width * 0.3 : width * 0.4;
const TREE_LEFT = (width - TREE_WIDTH) / 2;

let platformIdCounter = 0;

//----------------Function----------- Spawn platform type (simplified)
const spawnPlatformType = (score = 0) => {
  if (score < 5) return Math.random() < 0.3 ? 'small' : 'base';
  if (score < 10) return ['base', 'small', 'fragile'][Math.floor(Math.random() * 3)];
  return ['base', 'small', 'fragile', 'moving'][Math.floor(Math.random() * 4)];
};

//----------------Function----------- Generate one platform
const generatePlatform = (y, score) => {
  const type = spawnPlatformType(score);
  return {
    id: platformIdCounter++,
    x: Math.random() * (TREE_WIDTH - 100) + TREE_LEFT,
    y,
    type,
    jumpCount: 0,
    status: 'idle',
    moving: type === 'moving',
    direction: 1,    // start moving right
    speed: 2,        // movement speed in pixels per frame
  };
};

//----------------Component----------- GameEngine
export default function GameEngine({ onGameOver }) {
  const [playerY, setPlayerY] = useState(height - 200);
  const [playerX, setPlayerX] = useState(width / 2 - PLAYER_SIZE / 2);
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

  //----------------Effect----------- Initialize game
  useEffect(() => {
    const initial = [];
    let y = MAX_PLATFORM_Y;
    const count = RNPlatform.OS === 'web' ? 6 : 4;

    const startPlatform = {
      id: platformIdCounter++,
      x: width / 2 - 100 / 2,
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
      const p = generatePlatform(y, 0);
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

  //----------------Effect----------- Game loop
  useEffect(() => {
    const interval = setInterval(() => {
      let jumped = false;

      //----------------Update platforms
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

            // Move moving platforms horizontally
            if (p.type === 'moving') {
              let newX = p.x + p.direction * p.speed;

              // Horizontal movement bounds relative to original x
              const movementRange = 50;
              const minX = Math.max(0, p.x - movementRange);
              const maxX = Math.min(width - 100, p.x + movementRange);

              // Reverse direction if out of bounds
              if (newX < minX || newX > maxX) {
                p.direction = -p.direction;
                newX = p.x + p.direction * p.speed;
              }

              return { ...p, x: newX, direction: p.direction };
            }

            if (p.status === 'breaking') {
              return { ...p, toRemove: true };
            }

            return p;
          })
          .filter((p) => !p.toRemove);
      });

      //----------------Apply gravity
      setPlayerY((y) => {
        const newVelocity = velocityYRef.current + GRAVITY;
        const newY = y + newVelocity;

        if (newY > height && !isDead) {
          setIsDead(true);
          return y;
        }

        setVelocityY(newVelocity);
        return newY;
      });

      //----------------Move player horizontally
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

      //----------------Scroll up logic
      if (playerY < height / 2) {
        const diff = height / 2 - playerY;
        scrollOffset.current += diff;
        setPlayerY(height / 2);

        setPlatforms((prev) => {
          const scrolled = prev.map((p) => ({ ...p, y: p.y + diff })).filter((p) => p.y < height + 500 || p.type === 'base');

          let topY = Math.min(...scrolled.map((p) => p.y));
          const extraGap = RNPlatform.OS === 'web' ? 0 : 20;
          const baseGap = Math.random() * (PLATFORM_Y_GAP_RANGE.max - PLATFORM_Y_GAP_RANGE.min) + PLATFORM_Y_GAP_RANGE.min + extraGap;
          const newY = topY - baseGap;

          if (newY > -100) {
            const newPlatform = generatePlatform(newY, score);
            scrolled.unshift(newPlatform);
          }

          return scrolled;
        });
      }
    }, 16);

    return () => clearInterval(interval);
  }, [direction, playerY, score, isDead]);

  //----------------Effect----------- Handle death
  useEffect(() => {
    if (isDead) {
      onGameOver(score);
    }
  }, [isDead]);

  //----------------Effect----------- Keyboard control (web only)
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

  //----------------Render-----------
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
