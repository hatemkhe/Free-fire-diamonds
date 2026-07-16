import React, { useState, useEffect } from 'react';
// تعديل مسار الاستيراد لضمان التوافق الكامل مع حزمة framer-motion على خوادم الاستضافة
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gamepad2, 
  Coins, 
  Gift, 
  LogOut, 
  User, 
  Sparkles, 
  AlertTriangle, 
  Flame, 
  ShieldCheck, 
  TrendingDown,
  Info
} from 'lucide-react';

import Gatekeeper from './components/Gatekeeper';
import EarnPoints from './components/EarnPoints';
import RedeemStore from './components/RedeemStore';
import AdBanner from './components/AdBanner';
import { addPointsWithDiminishingReturns } from './utils';

export default function App() {
  const [user, setUser] = useState<{
    name: string;
    playerId: string;
    points: number;
    lastSpinTime: string | null;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'earn' | 'redeem'>('earn');
  const [playAttemptsCount, setPlayAttemptsCount] = useState(0);
  const [isInterstitialOpen, setIsInterstitialOpen] = useState(false);
  const [adCallback, setAdCallback] = useState<(() => void) | null>(null);

  // Success/Warning Notification Toast
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'warning' | 'error';
  } | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedName = localStorage.getItem('gaming_username');
    const savedPlayerId = localStorage.getItem('gaming_player_id');
    const savedPoints = localStorage.getItem('gaming_points');
    const savedSpin = localStorage.getItem('gaming_last_spin');

    if (savedName && savedPlayerId) {
      setUser({
        name: savedName,
        playerId: savedPlayerId,
        points: savedPoints ? parseFloat(savedPoints) : 0,
        lastSpinTime: savedSpin || null
      });
    }
  }, []);

  // Sync points to localStorage whenever it changes
  const savePointsToLocalStorage = (newPoints: number) => {
    localStorage.setItem('gaming_points', newPoints.toString());
  };

  const handleLogin = (name: string, playerId: string) => {
    localStorage.setItem('gaming_username', name);
    localStorage.setItem('gaming_player_id', playerId);
    localStorage.setItem('gaming_points', '0'); // start with 0 points
    
    setUser({
      name,
      playerId,
      points: 0,
      lastSpinTime: null
    });
    
    showToast('تم تسجيل الدخول بنجاح! مرحباً بك في بوابتك المفضلة.', 'success');
  };

  const handleLogout = () => {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟ ستفقد رصيدك الحالي غير المحفوظ بالسحابة.')) {
      localStorage.clear();
      setUser(null);
      setActiveTab('earn');
      setPlayAttemptsCount(0);
    }
  };

  const handleEarnPoints = (rawReward: number) => {
    if (!user) return { added: 0, newPoints: 0 };

    const currentPoints = user.points;
    const { added, newPoints, error } = addPointsWithDiminishingReturns(currentPoints, rawReward);

    setUser((prev) => {
      if (!prev) return null;
      return { ...prev, points: newPoints };
    });
    savePointsToLocalStorage(newPoints);

    // Show custom notifications highlighting the secret diminishing returns
    if (error) {
      showToast(error, 'error');
    } else if (currentPoints >= 990) {
      showToast(`⚠️ تم كشف نشاط فائق! تم تقليص عائد الفوز إلى 0.01 لعدم تجاوز سقف الأمان. ربحت +${added} نقطة.`, 'warning');
    } else if (currentPoints >= 950) {
      showToast(`⚠️ تفعيل بروتوكول حماية السيرفر (معدل العائد 1%): تم إضافة +${added} نقطة فقط.`, 'warning');
    } else if (currentPoints >= 900) {
      showToast(`⚠️ انخفاض تدريجي لتوزيع الجوائز (معدل العائد 10%): ربحت +${added} نقطة فقط!`, 'warning');
    } else {
      showToast(`🎉 مبروك الفوز باللعبة! تم شحن محفظتك بـ +${added} نقطة كاملة.`, 'success');
    }

    return { added, newPoints, error };
  };

  const handleDeductPoints = (cost: number) => {
    if (!user) return;
    const nextPoints = Math.max(0, Number((user.points - cost).toFixed(2)));
    setUser((prev) => {
      if (!prev) return null;
      return { ...prev, points: nextPoints };
    });
    savePointsToLocalStorage(nextPoints);
  };

  const handleUpdateSpinTime = (time: string | null) => {
    setUser((prev) => {
      if (!prev) return null;
      return { ...prev, lastSpinTime: time };
    });
    if (time) {
      localStorage.setItem('gaming_last_spin', time);
    } else {
      localStorage.removeItem('gaming_last_spin');
    }
  };

  const showToast = (message: string, type: 'success' | 'warning' | 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Automated Interstitial Ad triggering logic
  const handleShowAdTrigger = (onComplete?: () => void) => {
    const nextCount = playAttemptsCount + 1;
    setPlayAttemptsCount(nextCount);

    if (nextCount > 0 && nextCount % 3 === 0) {
      // Trigger ad
      if (onComplete) setAdCallback(() => onComplete);
      setIsInterstitialOpen(true);
    } else {
      if (onComplete) onComplete();
    }
  };

  const handleCloseInterstitial = () => {
    setIsInterstitialOpen(false);
    if (adCallback) {
      adCallback();
      setAdCallback(null);
    }
    showToast("رائع! حصلت على محاولة إضافية لمواصلة جمع الكنوز.", "success");
  };

  const handleTabChange = (tab: 'earn' | 'redeem') => {
    if (tab === activeTab) return;
    
    // Simulate transition interstitial ad on navigation as requested!
    handleShowAdTrigger(() => {
      setActiveTab(tab);
    });
  };

  // If not authenticated, force gatekeeper
  if (!user) {
    return <Gatekeeper onLogin={handleLogin} />;
  }

  // Determine current yield rate based on score
  let yieldRate = "100% كاملة";
  let yieldColor = "text-emerald-400";
  if (user.points >= 990) {
    yieldRate = "0.01 نقطة (حماية قصوى)";
    yieldColor = "text-rose-500 animate-pulse";
  } else if (user.points >= 950) {
    yieldRate = "1% (منخفض جداً)";
    yieldColor = "text-rose-400";
  } else if (user.points >= 900) {
    yieldRate = "10% (متناقص تدريجي)";
    yieldColor = "text-amber-400";
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans relative">
      {/* Background neon blur tags */}
      <div className="bg-glow top-20 right-10 bg-cyan-600"></div>
      <div className="bg-glow bottom-20 left-10 bg-purple-600"></div>

      {/* HEADER SECTION WITH AD BANNER */}
      <header className="border-b border-purple-900/30 bg-slate-900/80 backdrop-blur shadow-xl sticky top-0 z-40 px-6 py-3 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-black text-xl">
              🎮
            </div>
            <div className="text-right">
              <div className="flex flex-col">
                <span className="text-[10px] text-cyan-400 font-bold tracking-tighter uppercase leading-none mb-1">Gaming Rewards</span>
                <span className="text-lg font-black italic tracking-tight text-white leading-none">
                  جواهر<span className="text-purple-500 font-sans font-black">لوت</span>
                  <span className="text-[9px] bg-cyan-600/20 text-cyan-400 border border-cyan-500/40 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider mr-2 not-italic font-sans align-middle">شحن فوري</span>
                </span>
              </div>
            </div>
          </div>

          {/* User Profile Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5">
            <div className="flex items-center gap-2 bg-slate-800/40 p-1.5 px-3 rounded-xl border border-slate-800">
              <User className="h-4 w-4 text-cyan-400 shrink-0" />
              <div className="text-right">
                <p className="text-[9px] text-slate-500">حساب اللاعب</p>
                <p className="text-xs font-bold text-white truncate max-w-28">{user.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-800/40 p-1.5 px-3 rounded-xl border border-slate-800">
              <ShieldCheck className="h-4 w-4 text-purple-400 shrink-0" />
              <div className="text-right">
                <p className="text-[9px] text-slate-500">معرف الشحن UID</p>
                <p className="text-xs font-mono font-bold text-purple-400 tracking-wider">{user.playerId}</p>
              </div>
            </div>

            {/* Glowing Points Balance */}
            <div className="flex items-center gap-3 bg-slate-800/60 px-4 py-2 rounded-xl border border-slate-700 shadow-inner">
              <Coins className="h-5 w-5 text-yellow-500 shrink-0 animate-bounce" />
              <div className="text-right">
                <p className="text-[9px] text-yellow-500 font-bold uppercase leading-none mb-0.5">Balance</p>
                <motion.p 
                  key={user.points}
                  initial={{ scale: 0.9, opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-lg font-black text-white font-mono leading-none"
                >
                  {user.points.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </motion.p>
              </div>
              <div className="w-6 h-6 bg-yellow-500/10 rounded-full flex items-center justify-center border border-yellow-500/30">
                <span className="text-yellow-500 font-bold italic text-xs">P</span>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="p-2 bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 border border-slate-700 hover:border-rose-900/40 transition-colors rounded-lg cursor-pointer"
              title="تسجيل الخروج"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-4 md:py-6">
        
        {/* Header Ad banner */}
        <AdBanner type="header" />

        {/* Global Warning notice about secret logic to make it immersive */}
        {user.points >= 900 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl bg-slate-900 p-4 border border-slate-800 text-right flex gap-3 items-start shadow-xl"
          >
            <AlertTriangle className="h-6 w-6 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <TrendingDown className="h-4 w-4 text-amber-400" />
                تحذير: نظام حماية مكافآت السيرفر نشط حالياً!
              </h4>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                لقد اقترب رصيدك من سقف استبدال الهدايا لليوم (الهدف 1000 نقطة). لتفادي إساءة الاستخدام والبرامج المؤتمتة، تم تفعيل نظام التعدين المتناقص. معدل كسب النقاط الفعلي الخاص بك حالياً هو: <span className={`font-bold ${yieldColor}`}>{yieldRate}</span>.
              </p>
            </div>
          </motion.div>
        )}

        {/* Dynamic View Tab Navigation */}
        <div className="relative flex justify-center p-1.5 bg-slate-900 border border-slate-800/80 rounded-xl max-w-sm mx-auto mb-6 shadow-xl">
          <button
            onClick={() => handleTabChange('earn')}
            className={`flex-grow py-2.5 px-4 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'earn'
                ? 'bg-cyan-600/20 border border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.25)] font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gamepad2 className="h-4 w-4" />
            <span>طرق جمع النقاط</span>
          </button>
          <button
            onClick={() => handleTabChange('redeem')}
            className={`flex-grow py-2.5 px-4 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'redeem'
                ? 'bg-purple-600/20 border border-purple-500/50 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.25)] font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gift className="h-4 w-4" />
            <span>متجر الاستبدال</span>
          </button>
        </div>

        {/* Tab View Transition */}
        <div className="min-h-96">
          {activeTab === 'earn' ? (
            <EarnPoints
              onEarnPoints={handleEarnPoints}
              lastSpinTime={user.lastSpinTime}
              onUpdateSpinTime={handleUpdateSpinTime}
              onShowInterstitialAd={handleShowAdTrigger}
            />
          ) : (
            <RedeemStore
              userPoints={user.points}
              playerId={user.playerId}
              onDeductPoints={handleDeductPoints}
            />
          )}
        </div>

        {/* Footer Ad banner */}
        <AdBanner type="footer" />
      </main>

      {/* FOOTER */}
      <footer className="border-t border-purple-900/30 bg-slate-900/60 py-6 px-4 text-center text-xs text-slate-400 mt-8">
        <div className="max-w-7xl mx-auto space-y-3">
          <p className="font-bold text-slate-300 flex items-center justify-center gap-1.5">
            <span>حقوق النشر محفوظة © 2026 جواهر لوت</span>
            <span className="text-[9px] bg-cyan-500/10 text-cyan-400 px-1.5 rounded border border-cyan-500/20">آمن وموثوق</span>
          </p>
          <p className="max-w-2xl mx-auto text-[10px] text-slate-500 leading-relaxed">
            موقع جواهر لوت عبارة عن منصة تسلية تفاعلية للمستخدمين لجمع النقاط الترفيهية عبر الألعاب المصغرة. جميع العمليات والشحنات ممولة بواسطة المساهمات الإعلانية وتخضع لشروط وأحكام شبكة Garena للتوزيع.
          </p>
        </div>
      </footer>

      {/* FULL SCREEN INTERSTITIAL AD POPUP */}
      <AdBanner
        type="interstitial"
        isOpen={isInterstitialOpen}
        onClose={handleCloseInterstitial}
      />

      {/* TOAST NOTIFICATION POPUP */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '50%' }}
            animate={{ opacity: 1, y: 0, x: '50%' }}
            exit={{ opacity: 0, y: 50, x: '50%' }}
            className="fixed bottom-6 right-1/2 transform translate-x-1/2 z-50 w-full max-w-sm px-4 select-none pointer-events-none"
          >
            <div className={`p-4 rounded-xl border shadow-xl text-right flex gap-2.5 items-start ${
              toast.type === 'success' 
                ? 'bg-emerald-950/95 border-emerald-500 text-emerald-400' 
                : toast.type === 'warning'
                ? 'bg-amber-950/95 border-amber-500 text-amber-400'
                : 'bg-rose-950/95 border-rose-500 text-rose-400'
            }`}>
              {toast.type === 'success' && <Sparkles className="h-5 w-5 shrink-0 mt-0.5 animate-pulse" />}
              {toast.type === 'warning' && <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 animate-pulse" />}
              {toast.type === 'error' && <Info className="h-5 w-5 shrink-0 mt-0.5 animate-pulse" />}
              <p className="text-xs leading-relaxed font-semibold">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
