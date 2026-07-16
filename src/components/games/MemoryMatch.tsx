import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Award, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { MemoryCard } from '../../types';

interface MemoryMatchProps {
  onEarnPoints: (points: number) => { added: number; newPoints: number; error?: string };
  onShowAd: () => void;
}

const ICONS = ['🎮', '🕹️', '💣', '💎', '⚔️', '🏆', '👑', '🔫'];

export default function MemoryMatch({ onEarnPoints, onShowAd }: MemoryMatchProps) {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [claimResult, setClaimResult] = useState<{ added: number; error?: string } | null>(null);
  const [isLocking, setIsLocking] = useState(false);

  const initGame = () => {
    // Duplicate and shuffle
    const duplicatedIcons = [...ICONS, ...ICONS];
    const shuffled = duplicatedIcons
      .map((icon, index) => ({
        id: index,
        uniqueId: Math.random(),
        iconName: icon,
        isFlipped: false,
        isMatched: false
      }))
      .sort(() => Math.random() - 0.5);

    setCards(shuffled);
    setFlippedIndices([]);
    setMoves(0);
    setIsCompleted(false);
    setClaimResult(null);
    setIsLocking(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleCardClick = (clickedIndex: number) => {
    if (isLocking || cards[clickedIndex].isFlipped || cards[clickedIndex].isMatched) return;

    // Flip card
    const updatedCards = [...cards];
    updatedCards[clickedIndex].isFlipped = true;
    setCards(updatedCards);

    const newFlipped = [...flippedIndices, clickedIndex];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      setIsLocking(true);

      const [firstIdx, secondIdx] = newFlipped;
      if (cards[firstIdx].iconName === cards[secondIdx].iconName) {
        // Matched!
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[firstIdx].isMatched = true;
          matchedCards[secondIdx].isMatched = true;
          setCards(matchedCards);
          setFlippedIndices([]);
          setIsLocking(false);

          // Check if game complete
          if (matchedCards.every((card) => card.isMatched)) {
            setIsCompleted(true);
            const result = onEarnPoints(40); // 40 points reward
            setClaimResult({
              added: result.added,
              error: result.error
            });
            onShowAd();
          }
        }, 500);
      } else {
        // No match, flip back
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[firstIdx].isFlipped = false;
          resetCards[secondIdx].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
          setIsLocking(false);
        }, 1000);
      }
    }
  };

  return (
    <div className="space-y-6 text-center" id="memory-game">
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-white">تحدي الذاكرة للألعاب</h3>
        <p className="text-xs text-gray-400">
          اطبق الكروت المتشابهة لرموز الألعاب بأقل عدد من الحركات للفوز بـ 40 نقطة!
        </p>
      </div>

      {/* Stats Panel */}
      <div className="flex justify-between items-center text-xs text-gray-400 font-bold bg-[#0d0f19] p-3 px-4 rounded-xl border border-gray-800/60 max-w-sm mx-auto">
        <div className="flex items-center gap-1">
          <span>الحركات:</span>
          <span className="font-mono text-white text-sm">{moves}</span>
        </div>
        <button
          onClick={initGame}
          className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>إعادة المحاولة</span>
        </button>
      </div>

      {/* Memory Grid */}
      <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto p-2 bg-gray-950/40 border border-gray-900 rounded-2xl">
        {cards.map((card, idx) => {
          const isOpen = card.isFlipped || card.isMatched;
          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(idx)}
              className="aspect-square relative cursor-pointer group"
            >
              <div
                className={`w-full h-full rounded-xl transition-all duration-300 transform style-3d relative ${
                  isOpen 
                    ? 'rotate-y-180 bg-violet-950/40 border border-violet-500/40 shadow-lg shadow-violet-500/5' 
                    : 'bg-[#151728] border border-gray-800 hover:border-blue-500/40 hover:scale-[1.03]'
                }`}
              >
                {/* Card Back */}
                {!isOpen && (
                  <div className="absolute inset-0 flex items-center justify-center text-lg font-black text-blue-500/40 group-hover:text-blue-400/80">
                    ?
                  </div>
                )}

                {/* Card Front */}
                {isOpen && (
                  <div className="absolute inset-0 flex items-center justify-center text-2xl rotate-y-180">
                    {card.iconName}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Modal/Notice */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="max-w-sm mx-auto p-5 rounded-2xl border border-emerald-500/20 bg-emerald-950/10 text-center space-y-4"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
              <Award className="h-6 w-6 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-black text-white">مبروك! لقد قمت بحل التحدي</h4>
              <p className="text-xs text-gray-400">عدد المحاولات الإجمالي: {moves} حركة</p>
            </div>

            {claimResult && (
              <div>
                {claimResult.error ? (
                  <div className="p-2 bg-rose-950/20 border border-rose-500/10 rounded-xl text-rose-400 text-xs flex gap-1 items-start text-right">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{claimResult.error}</span>
                  </div>
                ) : (
                  <div className="text-xs text-emerald-400 font-bold bg-emerald-500/10 py-2 px-4 rounded-xl border border-emerald-500/20 inline-block">
                    ✓ تم منحك +{claimResult.added} نقطة بنجاح!
                  </div>
                )}
              </div>
            )}

            <button
              onClick={initGame}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs rounded-xl shadow hover:from-emerald-500 hover:to-teal-500 transition cursor-pointer"
            >
              العب مجدداً واجمع المزيد
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
