import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Coins, ShoppingBag, Zap, Cpu, AlertCircle, Award } from 'lucide-react';

interface CoinClickerProps {
  onEarnPoints: (points: number) => { added: number; newPoints: number; error?: string };
  onShowAd: () => void;
  // Let's lift/persist or use local state for Clicker values
}

export default function CoinClicker({ onEarnPoints, onShowAd }: CoinClickerProps) {
  const [clickerCoins, setClickerCoins] = useState(() => {
    return Number(localStorage.getItem('cc_coins') || '0');
  });
  const [autoClickers, setAutoClickers] = useState(() => {
    return Number(localStorage.getItem('cc_auto') || '0');
  });
  const [superClickers, setSuperClickers] = useState(() => {
    return Number(localStorage.getItem('cc_super') || '0');
  });
  const [clickValue, setClickValue] = useState(1);
  const [clicksCount, setClicksCount] = useState(0);

  const [claimResult, setClaimResult] = useState<{ added: number; error?: string } | null>(null);
  const [clickAnimations, setClickAnimations] = useState<Array<{ id: number; x: number; y: number }>>([]);

  // Upgrades prices
  const autoClickerCost = Math.floor(50 * Math.pow(1.5, autoClickers));
  const superClickerCost = Math.floor(250 * Math.pow(1.7, superClickers));

  // Save values to localStorage
  useEffect(() => {
    localStorage.setItem('cc_coins', clickerCoins.toString());
    localStorage.setItem('cc_auto', autoClickers.toString());
    localStorage.setItem('cc_super', superClickers.toString());
  }, [clickerCoins, autoClickers, superClickers]);

  // Click power calculation
  useEffect(() => {
    setClickValue(1 + superClickers * 3);
  }, [superClickers]);

  // Passive income generation (runs every second)
  useEffect(() => {
    if (autoClickers === 0) return;

    const interval = setInterval(() => {
      // Each autoclicker generates 2 coins per second
      setClickerCoins((c) => c + autoClickers * 2);
    }, 1000);

    return () => clearInterval(interval);
  }, [autoClickers]);

  const handleCoinClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setClickerCoins((c) => c + clickValue);
    setClicksCount((cnt) => cnt + 1);

    // Click effect coordinates
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now() + Math.random();

    setClickAnimations((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setClickAnimations((prev) => prev.filter((anim) => anim.id !== id));
    }, 800);

    // Every 15 clicks, trigger an ad counter
    if (clicksCount > 0 && clicksCount % 15 === 0) {
      onShowAd();
    }
  };

  const buyAutoClicker = () => {
    if (clickerCoins >= autoClickerCost) {
      setClickerCoins((c) => c - autoClickerCost);
      setAutoClickers((a) => a + 1);
    }
  };

  const buySuperClicker = () => {
    if (clickerCoins >= superClickerCost) {
      setClickerCoins((c) => c - superClickerCost);
      setSuperClickers((s) => s + 1);
    }
  };

  const handleConvertPoints = () => {
    // 500 Coins -> 20 Points
    if (clickerCoins < 500) return;

    const bundles = Math.floor(clickerCoins / 500);
    const cost = bundles * 500;
    const rewardPoints = bundles * 20;

    setClickerCoins((c) => c - cost);

    const result = onEarnPoints(rewardPoints);
    setClaimResult({
      added: result.added,
      error: result.error
    });

    onShowAd();
  };

  return (
    <div className="space-y-6 text-center" id="coinclicker-game">
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-white">مطور النقرات التلقائي (Coin Clicker)</h3>
        <p className="text-xs text-gray-400">
          انقر العملة لتجميع كنز اللعبة، واشترِ ترقيات لإنتاج الذهب ذاتياً، ثم حوله إلى نقاط حقيقية!
        </p>
      </div>

      {/* Balance panel */}
      <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
        <div className="bg-[#0b0c16] p-3 rounded-xl border border-gray-800 flex items-center justify-between">
          <Coins className="h-5 w-5 text-amber-400 shrink-0" />
          <div className="text-left">
            <p className="text-[9px] text-gray-500">رصيدك بالعملات</p>
            <p className="text-sm font-black text-white font-mono">{clickerCoins}</p>
          </div>
        </div>
        <div className="bg-[#0b0c16] p-3 rounded-xl border border-gray-800 flex items-center justify-between">
          <Cpu className="h-5 w-5 text-indigo-400 shrink-0" />
          <div className="text-left">
            <p className="text-[9px] text-gray-500">الإنتاج التلقائي/ثانية</p>
            <p className="text-sm font-black text-white font-mono">+{autoClickers * 2}</p>
          </div>
        </div>
      </div>

      {/* Main Clicker Coin Card */}
      <div className="flex flex-col items-center py-4">
        <button
          onClick={handleCoinClick}
          className="relative h-44 w-44 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 border-8 border-yellow-300 flex items-center justify-center shadow-2xl active:scale-95 transition-all outline-none select-none hover:shadow-amber-500/10 cursor-pointer"
        >
          {/* Internal details of the gold coin */}
          <div className="absolute inset-2 rounded-full border-4 border-dashed border-yellow-200/40 flex items-center justify-center">
            <span className="text-6xl font-black text-yellow-950/80 font-serif">$</span>
          </div>

          {/* Click numbers animations */}
          <AnimatePresence>
            {clickAnimations.map((anim) => (
              <motion.span
                key={anim.id}
                initial={{ opacity: 1, scale: 1, y: 0 }}
                animate={{ opacity: 0, scale: 1.4, y: -80 }}
                exit={{ opacity: 0 }}
                style={{ left: anim.x, top: anim.y }}
                className="absolute z-30 font-mono font-black text-xl text-yellow-100 select-none pointer-events-none"
              >
                +{clickValue}
              </motion.span>
            ))}
          </AnimatePresence>
        </button>
        <p className="text-[10px] text-gray-500 mt-2">القوة الحالية للنقرة: +{clickValue} عملة</p>
      </div>

      {/* Convert to Points Action Button */}
      {clickerCoins >= 500 && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-xs mx-auto p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-center space-y-2"
        >
          <div className="flex justify-between items-center text-xs">
            <span className="text-indigo-300 font-bold">يمكنك تحويل العملات لنقاط!</span>
            <span className="text-gray-500 font-mono">500 عملة = 20 نقطة</span>
          </div>
          <button
            onClick={handleConvertPoints}
            className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-xs rounded-lg transition-all shadow-md shadow-amber-500/10 cursor-pointer"
          >
            تحويل {Math.floor(clickerCoins / 500) * 500} عملة إلى +{Math.floor(clickerCoins / 500) * 20} نقطة
          </button>
        </motion.div>
      )}

      {claimResult && (
        <div className="max-w-xs mx-auto">
          {claimResult.error ? (
            <div className="p-2.5 bg-rose-950/20 border border-rose-500/10 rounded-xl text-rose-400 text-xs text-right flex gap-1 items-start">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{claimResult.error}</span>
            </div>
          ) : (
            <div className="text-xs text-emerald-400 font-bold bg-emerald-500/10 py-2 px-4 rounded-xl border border-emerald-500/20 block w-full">
              ✓ تم شحن محفظتك بـ +{claimResult.added} نقطة حقيقية!
            </div>
          )}
        </div>
      )}

      {/* Upgrades Shop Section */}
      <div className="bg-[#101222] p-4 rounded-2xl border border-gray-800 text-right space-y-3 max-w-sm mx-auto">
        <h4 className="text-xs font-bold text-gray-400 flex items-center gap-1.5 border-b border-gray-800/80 pb-2">
          <ShoppingBag className="h-4 w-4 text-blue-400" />
          متجر شراء الترقيات التلقائية:
        </h4>

        <div className="space-y-2">
          {/* Upgrade 1: Auto-Clicker */}
          <div className="flex items-center justify-between gap-3 p-2 bg-gray-950/40 rounded-xl border border-gray-900">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-500/10 text-blue-400 rounded-lg flex items-center justify-center">
                <Cpu className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">البوت المطور التلقائي</p>
                <p className="text-[9px] text-gray-400">ينتج +2 عملة تلقائياً كل ثانية (لديك: {autoClickers})</p>
              </div>
            </div>
            <button
              onClick={buyAutoClicker}
              disabled={clickerCoins < autoClickerCost}
              className={`text-[10px] font-black px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                clickerCoins >= autoClickerCost
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-500'
              }`}
            >
              {autoClickerCost} $
            </button>
          </div>

          {/* Upgrade 2: Super-Clicker */}
          <div className="flex items-center justify-between gap-3 p-2 bg-gray-950/40 rounded-xl border border-gray-900">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-amber-500/10 text-amber-400 rounded-lg flex items-center justify-center">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">الضربة الخارقة المضاعفة</p>
                <p className="text-[9px] text-gray-400">يزيد قوة النقرة الواحدة بـ +3 عملات (لديك: {superClickers})</p>
              </div>
            </div>
            <button
              onClick={buySuperClicker}
              disabled={clickerCoins < superClickerCost}
              className={`text-[10px] font-black px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                clickerCoins >= superClickerCost
                  ? 'bg-amber-500 text-black'
                  : 'bg-gray-800 text-gray-500'
              }`}
            >
              {superClickerCost} $
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
