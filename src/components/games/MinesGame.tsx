import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Award, ShieldAlert, Sparkles, HelpCircle, Bomb, Gem, Coins, ArrowRightLeft } from 'lucide-react';
import { MinesTile } from '../../types';

interface MinesGameProps {
  onEarnPoints: (points: number) => { added: number; newPoints: number; error?: string };
  onShowAd: () => void;
}

export default function MinesGame({ onEarnPoints, onShowAd }: MinesGameProps) {
  const [tiles, setTiles] = useState<MinesTile[]>([]);
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'exploded' | 'cashed_out'>('betting');
  const [pendingPoints, setPendingPoints] = useState(0);
  const [gemsFound, setGemsFound] = useState(0);
  const [claimResult, setClaimResult] = useState<{ added: number; error?: string } | null>(null);

  const totalBombs = 4;
  const gridSize = 25; // 5x5

  const startNewRound = () => {
    // Generate board
    const board: MinesTile[] = Array.from({ length: gridSize }, (_, i) => ({
      id: i,
      isMine: false,
      isRevealed: false,
      pointsValue: 0
    }));

    // Place bombs randomly
    let bombsPlaced = 0;
    while (bombsPlaced < totalBombs) {
      const idx = Math.floor(Math.random() * gridSize);
      if (!board[idx].isMine) {
        board[idx].isMine = true;
        bombsPlaced++;
      }
    }

    setTiles(board);
    setGameState('playing');
    setPendingPoints(0);
    setGemsFound(0);
    setClaimResult(null);
  };

  useEffect(() => {
    startNewRound();
  }, []);

  const handleTileClick = (idx: number) => {
    if (gameState !== 'playing' || tiles[idx].isRevealed) return;

    const updated = [...tiles];
    updated[idx].isRevealed = true;

    if (updated[idx].isMine) {
      // Exploded! Reveal all mines
      revealAll();
      setGameState('exploded');
      setPendingPoints(0);
      onShowAd();
    } else {
      // Found gem
      const foundCount = gemsFound + 1;
      setGemsFound(foundCount);
      
      // Calculate dynamic exponential points
      // Gem 1: 10, Gem 2: 15, Gem 3: 22, Gem 4: 32, Gem 5: 45...
      const scoreAdded = Math.floor(10 * Math.pow(1.4, foundCount - 1));
      setPendingPoints((p) => p + scoreAdded);
      
      setTiles(updated);
    }
  };

  const revealAll = () => {
    setTiles((prev) => prev.map((tile) => ({ ...tile, isRevealed: true })));
  };

  const handleCashOut = () => {
    if (gameState !== 'playing' || pendingPoints === 0) return;

    revealAll();
    setGameState('cashed_out');

    const result = onEarnPoints(pendingPoints);
    setClaimResult({
      added: result.added,
      error: result.error
    });

    onShowAd();
  };

  return (
    <div className="space-y-6 text-center" id="mines-game">
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-white">منجم الجواهر والقنابل</h3>
        <p className="text-xs text-gray-400">
          افتح المربعات لجمع الجواهر ورفع رصيدك المعلق، وتجنب القنابل الأربعة المخبأة! انسحب قبل الانفجار.
        </p>
      </div>

      {/* Game Header Panel */}
      <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-xs font-bold bg-[#0d0f19] p-3 rounded-xl border border-gray-800/60 items-center">
        <div className="text-right">
          <p className="text-[10px] text-gray-500">جواهر تم كشفها:</p>
          <p className="text-sm text-emerald-400 font-mono font-black">{gemsFound} 💎</p>
        </div>
        <div className="text-left">
          <p className="text-[10px] text-gray-500">النقاط المعلقة بالجولة:</p>
          <p className="text-sm text-amber-400 font-mono font-black">+{pendingPoints} نقطة</p>
        </div>
      </div>

      {/* 5x5 Mine Grid */}
      <div className="grid grid-cols-5 gap-2 max-w-sm mx-auto p-3 bg-[#0a0b12] border border-gray-900 rounded-2xl relative">
        {tiles.map((tile, idx) => {
          const isRevealed = tile.isRevealed;
          const isMine = tile.isMine;
          
          let tileStyle = 'bg-gray-900 hover:bg-gray-850 hover:border-blue-500/30';
          let icon = null;

          if (isRevealed) {
            if (isMine) {
              tileStyle = 'bg-rose-950/40 border-2 border-rose-500 text-rose-400 neon-border-rose animate-pulse';
              icon = <Bomb className="h-5 w-5 shrink-0" />;
            } else {
              tileStyle = 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 neon-border-green';
              icon = <Gem className="h-5 w-5 shrink-0" />;
            }
          }

          return (
            <button
              key={tile.id}
              onClick={() => handleTileClick(idx)}
              disabled={gameState !== 'playing' || isRevealed}
              className={`aspect-square rounded-xl border flex items-center justify-center transition-all duration-300 cursor-pointer ${tileStyle}`}
            >
              {icon}
            </button>
          );
        })}
      </div>

      {/* Control panel and outcomes */}
      <div className="max-w-xs mx-auto space-y-4">
        {gameState === 'playing' && (
          <button
            onClick={handleCashOut}
            disabled={pendingPoints === 0}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-xs rounded-xl shadow-lg shadow-amber-500/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Coins className="h-4 w-4" />
            <span>انسحب واجمع النقاط ({pendingPoints})</span>
          </button>
        )}

        {gameState === 'exploded' && (
          <div className="space-y-3">
            <div className="p-3 bg-rose-950/20 border border-rose-500/20 rounded-xl text-rose-400 text-xs text-right flex items-start gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <span>💥 انفجرت القنبلة! خسرت جميع نقاط هذه الجولة المعلقة. حاول مجدداً بحذر!</span>
            </div>
            <button
              onClick={startNewRound}
              className="w-full py-3 bg-[#121420] border border-gray-800 text-white font-bold text-xs rounded-xl hover:bg-gray-800 transition cursor-pointer"
            >
              بدء جولة جديدة
            </button>
          </div>
        )}

        {gameState === 'cashed_out' && (
          <div className="space-y-3">
            {claimResult && (
              <div className="inline-block w-full">
                {claimResult.error ? (
                  <div className="p-2.5 bg-rose-950/20 border border-rose-500/10 rounded-xl text-rose-400 text-xs text-right flex gap-1 items-start">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{claimResult.error}</span>
                  </div>
                ) : (
                  <div className="text-xs text-emerald-400 font-bold bg-emerald-500/10 py-2.5 px-4 rounded-xl border border-emerald-500/20 block w-full">
                    ✓ تم سحب الأرباح بنجاح وإضافة +{claimResult.added} نقطة!
                  </div>
                )}
              </div>
            )}
            <button
              onClick={startNewRound}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs rounded-xl hover:from-blue-500 hover:to-indigo-500 transition cursor-pointer"
            >
              بدء جولة تعدين جديدة
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
