import React, { useEffect, useState } from 'react';
import { Platform as RNPlatform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { Asset } from 'expo-asset';

import MenuScreen from './components/MenuScreen';
import GameOverScreen from './components/GameOverScreen';
import GameEngine from './GameEngine';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [showMenu, setShowMenu] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {
    async function prepare() {
      try {
        await Asset.loadAsync([
          require('./assets/player.png') // Preload player image
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

  if (!isReady) return null;

  if (showMenu) {
    return <MenuScreen onStart={() => setShowMenu(false)} />;
  }

  if (gameOver) {
    return (
      <GameOverScreen
        score={finalScore}
        onRestart={() => {
          setShowMenu(true);
          setGameOver(false);
        }}
      />
    );
  }

  return (
    <GameEngine
      onGameOver={(score) => {
        setFinalScore(score);
        setGameOver(true);
      }}
    />
  );
}
