import React, { useEffect, useState, useRef } from 'react';
import { Dimensions, Platform as RNPlatform } from 'react-native';

import Player from './components/Player';
import PlatformBlock from './components/Platform';
import GameUI from './components/GameUI';
import Controls from './components/Controls';
import Background from './components/Background';

const { width, height } = Dimensions.get('window');
const PLAYER_SIZE = 70;
const PLATFORM_WIDTH = 130;
const PLATFORM_HEIGHT = 20;
const GRAVITY = 0.6;
const JUMP_VELOCITY = RNPlatform.OS === 'web' ? -20 : -12;
const PLATFORM_Y_GAP_RANGE = { min: 90, max: 130 };
const MAX_PLATFORM_Y = height - 150;

const TREE_WIDTH = width * 0.3;
const TREE_LEFT = (width - TREE_WIDTH) / 2;

let platformIdCounter = 0;

const getNextPlatformType = (score) => {
  if (score < 5) return Math.random() < 0.3 ? 'small' : 'base';
  if (score < 10) return ['base', 'small', 'fragile'][Math.floor(Math.random() * 3)];
  return ['base', 'small', 'fragile', 'moving'][Math.floor(Math.random() * 4)];
};

const generatePlatform = (y, score) => {
  const type = getNextPlatformType(score);
  const moving = type === 'moving';
  return {
    id: platformIdCounter++,
    x: Math.random() * (TREE_WIDTH - PLATFORM_WIDTH) + TREE_LEFT,
    y,
    jumpCount: 0,
    type,
    moving,
    unbreakable: false,
    breakingSince: null
  };
};

export default function GameEngine({ onGameOver }) {
  const [playerY, setPlayerY] = useState(height - 200);
  const [playerX, setPlayerX] = useState(width / 2 - PLAYER_SIZE / 2);
  const [velocityY, setVelocityY] = useState(0);
  const [direction, setDirection] = useState(null);
  const [facing, setFacing] = useState('right');
  const [platforms, setPlatforms] = useState([]);
  const [score, setScore] = useState(0);
  const scrollOffset = useRef(0);
  const scoredPlatforms = useRef(new Set());

  const speed = 5;

  useEffect(() => {
    const initial = [];
    let y = MAX_PLATFORM_Y;
    const count = RNPlatform.OS === 'web' ? 6 : 4;

    const startPlatform = {
      id: platformIdCounter++,
      x: width / 2 - PLATFORM_WIDTH / 2,
      y,
      type: 'base',
      jumpCount: 0,
      moving: false,
      unbreakable: true,
      breakingSince: null
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
    setPlayerX(startPlatform.x + PLATFORM_WIDTH / 2 - PLAYER_SIZE / 2);
    setPlayerY(startPlatform.y - PLAYER_SIZE);
    setVelocityY(0);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      let jumped = false;

      setPlatforms((prev) => {
        const updatedPlatforms = prev.map((p) => {
          const withinX = playerX + PLAYER_SIZE > p.x && playerX < p.x + PLATFORM_WIDTH;
          const withinY = playerY + PLAYER_SIZE >= p.y && playerY + PLAYER_SIZE <= p.y + PLATFORM_HEIGHT + 1;

          if (withinX && withinY && velocityY > 0 && !jumped) {
            jumped = true;
            setVelocityY(JUMP_VELOCITY);

            if (!scoredPlatforms.current.has(p.id)) {
              scoredPlatforms.current.add(p.id);
              setScore((s) => s + 1);
            }

            if (p.unbreakable) return p;

            const newJumpCount = p.jumpCount + 1;
            const maxJumps = p.type === 'fragile' ? 1 : 2;

            if (newJumpCount >= maxJumps) {
              return { ...p, jumpCount: newJumpCount, breaking: true, breakingSince: Date.now() };
            }

            return { ...p, jumpCount: newJumpCount };
          }

          return p;
        }).map(p => {
          if (p.breaking && p.breakingSince && Date.now() - p.breakingSince >= 200) {
            return { ...p, toRemove: true };
          }
          return p;
        }).filter(p => !p.toRemove);

        return updatedPlatforms;
      });

      setPlayerY((y) => {
        const newVelocity = velocityY + GRAVITY;
        const newY = y + newVelocity;

        if (newY > height) {
          onGameOver(score);
          return y;
        }

        setVelocityY(newVelocity);
        return newY;
      });

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

        setPlatforms((prev) => {
          const scrolled = prev.map((p) => ({ ...p, y: p.y + diff })).filter((p) => p.y < height + 300);

          let topMostY = scrolled.length > 0 ? Math.min(...scrolled.map(p => p.y)) : height;

          const difficultyFactor = Math.min(score * 1.5, 50);
          const extraGap = RNPlatform.OS === 'web' ? 0 : 20;
          const gapY = Math.random() * (PLATFORM_Y_GAP_RANGE.max - PLATFORM_Y_GAP_RANGE.min) + PLATFORM_Y_GAP_RANGE.min + difficultyFactor + extraGap;

          const newY = topMostY - gapY;

          if (newY > -100) {
            const newPlatform = generatePlatform(newY, score);
            scrolled.unshift(newPlatform);
          }

          while (scrolled.length < 5) {
            const extraY = topMostY - 100;
            const extraPlatform = generatePlatform(extraY, score);
            scrolled.unshift(extraPlatform);
            topMostY = extraY;
          }

          return scrolled;
        });
      }

    }, 16);

    return () => clearInterval(interval);
  }, [velocityY, direction, playerY]);

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
