import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, AlertCircle, RefreshCw, Lock, Unlock, HelpCircle, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { SafeCrackerState } from '../../types';

interface SafeCrackerProps {
  onEarnPoints: (points: number) => { added: number; newPoints: number; error?: string };
  onShowAd: () => void;
}

export default function SafeCracker({ onEarnPoints, onShowAd }: SafeCrackerProps) {
  const [targetCode, setTargetCode] = useState('');
  const [currentGuess, setCurrentGuess] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(8);
  const [history, setHistory] = useState<Array<{ guess: string; hint: string; type: 'high' | 'low' | 'correct' }>>([]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [claimResult, setClaimResult] = useState<{ added: number; error?: string } | null>(null);

  const initGame = () => {
    // Generate random 4 digit number
    const code = Math.floor(Math.random() * 9000 + 1000).toString(); // 1000 to 9999
    setTargetCode(code);
    setCurrentGuess('');
    setAttemptsLeft(8);
    setHistory([]);
    setIsUnlocked(false);
    setIsGameOver(false);
    setClaimResult(null);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleKeyPress = (num: string) => {
    if (isUnlocked || isGameOver || currentGuess.length >= 4) return;
    setCurrentGuess((prev) => prev + num);
  };

  const handleBackspace = () => {
    setCurrentGuess((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setCurrentGuess('');
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isUnlocked || isGameOver || currentGuess.length !== 4) return;

    const guessInt = parseInt(currentGuess);
    const targetInt = parseInt(targetCode);

    let newHistoryItem: { guess: string; hint: string; type: 'high' | 'low' | 'correct' };

    if (guessInt === targetInt) {
      newHistoryItem = {
        guess: currentGuess,
        hint: 'تم مطابقة الرمز بنجاح! الخزنة مفتوحة.',
        type: 'correct'
      };
      setIsUnlocked(true);
      const result = onEarnPoints(45); // 45 points
      setClaimResult({
        added: result.added,
        error: result.error
      });
      onShowAd();
    } else {
      const isHigh = guessInt > targetInt;
      newHistoryItem = {
        guess: currentGuess,
        hint: isHigh ? 'الرمز السري أصغر من تخمينك 📉' : 'الرمز السري أكبر من تخمينك 📈',
        type: isHigh ? 'high' : 'low'
      };
      
      const newAttempts = attemptsLeft - 1;
      setAttemptsLeft(newAttempts);

      if (newAttempts <= 0) {
        setIsGameOver(true);
        onShowAd();
      }
    }

    setHistory((prev) => [newHistoryItem, ...prev]);
    setCurrentGuess('');
  };

  return (
    <div className="space-y-6 text-center" id="safecracker-game">
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-white">مخترق الخزنة الإلكتروني</h3>
        <p className="text-xs text-gray-400">
          خمن الرمز المكون من 4 أرقام (بين 1000 و 9999) لفتح الخزنة وربح 45 نقطة!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl mx-auto items-stretch">
        {/* Left Side: Keypad & Input */}
        <div className="bg-[#101222] p-5 rounded-2xl border border-gray-800 flex flex-col justify-between space-y-4">
          
          {/* Safe Visual Lock State */}
          <div className="flex items-center justify-center gap-3 py-2">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center border-2 transition-all duration-500 ${
              isUnlocked 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-lg shadow-emerald-500/10' 
                : isGameOver 
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/40' 
                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            }`}>
              {isUnlocked ? <Unlock className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400">المحاولات المتبقية</p>
              <p className="text-sm font-bold text-white font-mono">{attemptsLeft} محاولات</p>
            </div>
          </div>

          {/* Current Guess Display */}
          <div className="relative">
            <div className="w-full bg-gray-950 rounded-xl p-3 text-center border border-gray-900 font-mono text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 tracking-widest min-h-12 flex items-center justify-center">
              {currentGuess.padEnd(4, '_').split('').map((char, i) => (
                <span key={i} className={`mx-1.5 ${char === '_' ? 'text-gray-800' : 'text-blue-400'}`}>
                  {char}
                </span>
              ))}
            </div>
          </div>

          {/* Graphical numeric pad */}
          <div className="grid grid-cols-3 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                onClick={() => handleKeyPress(num)}
                disabled={isUnlocked || isGameOver}
                className="py-3 bg-gray-900/60 border border-gray-800 hover:border-blue-500/30 text-white font-mono font-bold rounded-xl text-base transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleClear}
              disabled={isUnlocked || isGameOver}
              className="py-3 bg-rose-950/20 border border-rose-950/50 hover:border-rose-500/30 text-rose-400 font-bold rounded-xl text-xs transition-all active:scale-95 cursor-pointer"
            >
              مسح
            </button>
            <button
              onClick={() => handleKeyPress('0')}
              disabled={isUnlocked || isGameOver}
              className="py-3 bg-gray-900/60 border border-gray-800 hover:border-blue-500/30 text-white font-mono font-bold rounded-xl text-base transition-all active:scale-95 cursor-pointer"
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              disabled={isUnlocked || isGameOver}
              className="py-3 bg-gray-900/60 border border-gray-800 hover:border-blue-500/30 text-gray-400 font-bold rounded-xl text-xs transition-all active:scale-95 cursor-pointer"
            >
              حذف
            </button>
          </div>

          <button
            onClick={() => handleSubmit()}
            disabled={isUnlocked || isGameOver || currentGuess.length !== 4}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl transition disabled:opacity-50 cursor-pointer"
          >
            تأكيد التخمين
          </button>
        </div>

        {/* Right Side: Attempts logs / Outcomes */}
        <div className="bg-[#101222] p-5 rounded-2xl border border-gray-800 flex flex-col justify-between space-y-4">
          <div className="space-y-2 flex-1 overflow-hidden flex flex-col">
            <h4 className="text-xs font-bold text-gray-400 text-right">سجل التخمين والتشخيص:</h4>
            
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-56 text-right">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 py-12">
                  <HelpCircle className="h-8 w-8 mb-1.5 opacity-40" />
                  <p className="text-xs">لم تقم بأي محاولة بعد.</p>
                </div>
              ) : (
                history.map((item, index) => (
                  <div
                    key={index}
                    className={`p-2.5 rounded-xl border text-xs flex gap-2.5 items-center justify-between ${
                      item.type === 'correct'
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400'
                        : item.type === 'high'
                        ? 'bg-amber-950/20 border-amber-500/20 text-amber-400'
                        : 'bg-blue-950/20 border-blue-500/20 text-blue-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {item.type === 'correct' ? (
                        <Unlock className="h-4 w-4 text-emerald-400 shrink-0" />
                      ) : item.type === 'high' ? (
                        <ArrowDownCircle className="h-4 w-4 text-amber-400 shrink-0" />
                      ) : (
                        <ArrowUpCircle className="h-4 w-4 text-blue-400 shrink-0" />
                      )}
                      <span className="font-semibold leading-normal">{item.hint}</span>
                    </div>
                    <span className="font-mono font-bold bg-black/40 px-2 py-0.5 rounded text-white">{item.guess}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Actions on end states */}
          <AnimatePresence>
            {isUnlocked && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 pt-2"
              >
                {claimResult && (
                  <div className="inline-block w-full">
                    {claimResult.error ? (
                      <div className="rounded-xl bg-rose-950/20 border border-rose-500/20 p-2.5 text-xs text-rose-400 text-right flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{claimResult.error}</span>
                      </div>
                    ) : (
                      <div className="text-xs text-emerald-400 font-bold bg-emerald-500/10 py-2.5 px-4 rounded-xl border border-emerald-500/20 block w-full">
                        ✓ تم فتح الخزنة بنجاح وحصلت على +{claimResult.added} نقطة!
                      </div>
                    )}
                  </div>
                )}
                <button
                  onClick={initGame}
                  className="w-full py-2.5 bg-gray-900 border border-gray-800 text-white font-bold text-xs rounded-xl hover:bg-gray-800 transition cursor-pointer"
                >
                  إعادة تعيين الخزنة
                </button>
              </motion.div>
            )}

            {isGameOver && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 pt-2"
              >
                <div className="p-3 bg-rose-950/20 border border-rose-500/20 rounded-xl text-rose-400 text-xs text-right">
                  💥 لقد نفدت جميع محاولاتك! الرمز الصحيح كان: <span className="font-mono font-bold text-white">{targetCode}</span>
                </div>
                <button
                  onClick={initGame}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  حاول مجدداً
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
