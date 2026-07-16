import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, AlertCircle, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

interface HigherLowerProps {
  onEarnPoints: (points: number) => { added: number; newPoints: number; error?: string };
  onShowAd: () => void;
}

export default function HigherLower({ onEarnPoints, onShowAd }: HigherLowerProps) {
  const [currentNum, setCurrentNum] = useState(0);
  const [nextNum, setNextNum] = useState(0);
  const [streak, setStreak] = useState(0);
  const [guessResult, setGuessResult] = useState<'correct' | 'wrong' | null>(null);
  const [claimResult, setClaimResult] = useState<{ added: number; error?: string } | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  const generateCard = () => {
    const num = Math.floor(Math.random() * 19) + 2; // 2 to 20
    setCurrentNum(num);
    setNextNum(0);
    setGuessResult(null);
    setClaimResult(null);
    setIsLocked(false);
  };

  useEffect(() => {
    generateCard();
  }, []);

  const handleGuess = (prediction: 'higher' | 'lower') => {
    if (isLocked) return;
    setIsLocked(true);

    // Generate next number (must be different)
    let next = Math.floor(Math.random() * 20) + 1; // 1 to 20
    while (next === currentNum) {
      next = Math.floor(Math.random() * 20) + 1;
    }
    setNextNum(next);

    const isNextHigher = next > currentNum;
    const isGuessCorrect = (prediction === 'higher' && isNextHigher) || (prediction === 'lower' && !isNextHigher);

    if (isGuessCorrect) {
      setGuessResult('correct');
      setStreak((s) => s + 1);

      // Earn 15 points
      const result = onEarnPoints(15);
      setClaimResult({
        added: result.added,
        error: result.error
      });
    } else {
      setGuessResult('wrong');
      setStreak(0);
      setClaimResult(null);
    }

    onShowAd();
  };

  const handleNextCard = () => {
    setCurrentNum(nextNum);
    setNextNum(0);
    setGuessResult(null);
    setClaimResult(null);
    setIsLocked(false);
  };

  return (
    <div className="space-y-6 text-center" id="higherlower-game">
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-white">لعبة أكبر أو أصغر</h3>
        <p className="text-xs text-gray-400">
          توقع هل الرقم القادم سيكون أكبر أم أصغر من الرقم الحالي للفوز بـ 15 نقطة!
        </p>
      </div>

      {/* Streak Tracker */}
      <div className="flex justify-between items-center text-xs text-gray-400 font-bold bg-[#0d0f19] p-3 px-4 rounded-xl border border-gray-800/60 max-w-xs mx-auto">
        <span className="flex items-center gap-1">
          🔥 السلسلة الحالية: 
          <span className="text-amber-400 font-mono text-sm font-black">{streak}</span>
        </span>
        <button
          onClick={generateCard}
          className="text-gray-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>تصفير</span>
        </button>
      </div>

      {/* Card stage */}
      <div className="relative mx-auto flex h-48 w-36 items-center justify-center rounded-2xl border-2 border-indigo-500/20 bg-gradient-to-b from-[#13152a] to-[#0c0e18] p-4 shadow-2xl neon-border-cyan">
        <div className="text-center space-y-2">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">الرقم الحالي</p>
          <motion.p
            key={currentNum}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl font-black text-white font-mono filter drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]"
          >
            {currentNum}
          </motion.p>
          <p className="text-[10px] text-blue-400">بين 1 و 20</p>
        </div>

        {/* Floating results badge */}
        <AnimatePresence>
          {guessResult && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className={`absolute inset-0 rounded-2xl flex flex-col items-center justify-center z-20 backdrop-blur-sm ${
                guessResult === 'correct' 
                  ? 'bg-emerald-950/90 border border-emerald-500' 
                  : 'bg-rose-950/90 border border-rose-500'
              }`}
            >
              <p className="text-[10px] text-gray-400 font-bold mb-1">الرقم الجديد كان</p>
              <p className="text-4xl font-mono font-black text-white mb-2">{nextNum}</p>
              <div className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                guessResult === 'correct' ? 'bg-emerald-500 text-black' : 'bg-rose-500 text-white'
              }`}>
                {guessResult === 'correct' ? 'تخمين صحيح! 🎉' : 'خطأ! 💥'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Buttons */}
      <div className="max-w-xs mx-auto space-y-4">
        {guessResult ? (
          <button
            onClick={handleNextCard}
            className="w-full py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl transition cursor-pointer"
          >
            متابعة اللعب بالرقم الجديد
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleGuess('higher')}
              className="py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex flex-col items-center justify-center gap-1 shadow-lg shadow-emerald-500/15 cursor-pointer"
            >
              <TrendingUp className="h-5 w-5" />
              <span>أكبر 📈</span>
            </button>
            <button
              onClick={() => handleGuess('lower')}
              className="py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex flex-col items-center justify-center gap-1 shadow-lg shadow-rose-500/15 cursor-pointer"
            >
              <TrendingDown className="h-5 w-5" />
              <span>أصغر 📉</span>
            </button>
          </div>
        )}

        {/* Claims logs */}
        {guessResult === 'correct' && claimResult && (
          <div className="inline-block w-full">
            {claimResult.error ? (
              <div className="p-2 bg-rose-950/20 border border-rose-500/10 rounded-xl text-rose-400 text-xs flex gap-1 items-start text-right">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{claimResult.error}</span>
              </div>
            ) : (
              <div className="text-xs text-emerald-400 font-bold bg-emerald-500/10 py-2 px-4 rounded-xl border border-emerald-500/20 block w-full">
                ✓ تم إضافة +{claimResult.added} نقطة بنجاح لرصيدك!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
