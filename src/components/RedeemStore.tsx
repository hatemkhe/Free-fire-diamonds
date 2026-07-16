import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Coins, ShieldCheck, AlertTriangle, ArrowRight, Loader, Zap, CheckCircle2 } from 'lucide-react';
import { RedeemItem } from '../types';

interface RedeemStoreProps {
  userPoints: number;
  playerId: string;
  onDeductPoints: (points: number) => void;
}

export default function RedeemStore({ userPoints, playerId, onDeductPoints }: RedeemStoreProps) {
  const [selectedReward, setSelectedReward] = useState<RedeemItem | null>(null);
  const [redeemState, setRedeemState] = useState<'idle' | 'insufficient' | 'confirming' | 'processing' | 'success'>('idle');
  const [progressText, setProgressText] = useState('');
  const [progress, setProgress] = useState(0);

  const rewards: RedeemItem[] = [
    {
      id: 'reward-1',
      diamonds: 110,
      pointsCost: 1000,
      imageUrl: '💎',
      gameName: 'Free Fire Diamonds',
      badge: 'الأكثر شعبية 🔥',
      originalPrice: '1.99$'
    },
    {
      id: 'reward-2',
      diamonds: 310,
      pointsCost: 2500,
      imageUrl: '💎💎',
      gameName: 'Free Fire Diamonds',
      badge: 'أفضل عرض ⚡',
      originalPrice: '4.99$'
    },
    {
      id: 'reward-3',
      diamonds: 520,
      pointsCost: 4000,
      imageUrl: '💎💎💎',
      gameName: 'Free Fire Diamonds',
      badge: 'قيمة فائقة 🌟',
      originalPrice: '9.99$'
    }
  ];

  const handleRedeemClick = (reward: RedeemItem) => {
    setSelectedReward(reward);
    if (userPoints < reward.pointsCost) {
      setRedeemState('insufficient');
    } else {
      setRedeemState('confirming');
    }
  };

  const startRedeemSimulation = () => {
    if (!selectedReward) return;
    setRedeemState('processing');
    setProgress(0);
    setProgressText('جاري فتح قناة اتصال آمنة مع سيرفرات Garena...');

    const steps = [
      { p: 15, t: 'تم الاتصال بالخادم الرئيسي لقاعدة البيانات...' },
      { p: 40, t: `التحقق من صحة معرف اللاعب UID: ${playerId}...` },
      { p: 65, t: `توليد ترخيص شحن لـ ${selectedReward.diamonds} جوهرة مجاناً...` },
      { p: 85, t: 'مزامنة رصيد النقاط وخصم قيمة المكافأة...' },
      { p: 100, t: 'اكتملت العملية! بانتظار الموافقة النهائية للشبكة...' }
    ];

    let currentStepIndex = 0;
    const interval = setInterval(() => {
      if (currentStepIndex < steps.length) {
        setProgress(steps[currentStepIndex].p);
        setProgressText(steps[currentStepIndex].t);
        currentStepIndex++;
      } else {
        clearInterval(interval);
        onDeductPoints(selectedReward.pointsCost);
        setRedeemState('success');
      }
    }, 1500);
  };

  return (
    <div className="space-y-6" id="redeem-store-section">
      {/* Header and Alert */}
      <div className="text-right space-y-2">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Flame className="h-6 w-6 text-orange-500 animate-pulse" />
          متجر الاستبدال الفوري
        </h2>
        <p className="text-xs text-gray-400">
          استبدل نقاطك الترفيهية بجواهر فري فاير حقيقية تشحن مباشرة لحسابك عبر معرفك الخاص.
        </p>
      </div>

      {/* User Balance Card */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-5 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-xl border border-cyan-500/20 shadow-inner">
            💎
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-500">المعرف الحالي المستخدم للشحن</p>
            <p className="text-sm font-mono font-bold text-white tracking-wider">{playerId}</p>
          </div>
        </div>
        <div className="text-left">
          <p className="text-[10px] text-slate-500">رصيد نقاطك الحالي</p>
          <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 font-mono">
            {userPoints.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Grid of Rewards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {rewards.map((reward) => {
          const isAffordable = userPoints >= reward.pointsCost;
          return (
            <div
              key={reward.id}
              className={`relative overflow-hidden rounded-2xl border bg-slate-900 p-6 text-right transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between ${
                isAffordable 
                  ? 'border-emerald-500/40 neon-border-green shadow-lg shadow-emerald-500/5' 
                  : 'border-slate-800 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5'
              }`}
            >
              {reward.badge && (
                <div className="absolute top-3 right-3 bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full">
                  {reward.badge}
                </div>
              )}

              {/* Reward Details */}
              <div className="space-y-4 pt-4">
                <div className="text-center py-6 text-4xl filter drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                  {reward.imageUrl}
                </div>
                
                <div className="text-center space-y-1">
                  <h3 className="text-xl font-extrabold text-white">
                    {reward.diamonds} جوهرة فري فاير
                  </h3>
                  <p className="text-xs text-slate-400">{reward.gameName}</p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs">
                  <span className="text-slate-500 line-through">السعر الأصلي: {reward.originalPrice}</span>
                  <span className="text-emerald-400 font-bold bg-emerald-500/5 px-2 py-0.5 rounded">وفر 100%</span>
                </div>
              </div>

              {/* Price and Action Button */}
              <div className="mt-6 space-y-3">
                <div className="flex items-baseline justify-center gap-1.5 bg-slate-950 py-3 rounded-xl border border-slate-800">
                  <span className="text-xl font-black text-white font-mono">{reward.pointsCost}</span>
                  <span className="text-xs font-semibold text-slate-400">نقطة</span>
                </div>

                <button
                  onClick={() => handleRedeemClick(reward)}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isAffordable
                      ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white shadow-lg shadow-cyan-500/20'
                      : 'bg-slate-800 hover:bg-slate-750 text-slate-400 border border-slate-700'
                  }`}
                >
                  <Zap className="h-4 w-4 shrink-0" />
                  <span>طلب استبدال فوري</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety Guidelines footer inside store */}
      <div className="rounded-xl bg-slate-950 p-4 border border-slate-800/80 flex gap-3 text-right shadow-md">
        <ShieldCheck className="h-6 w-6 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-white">شروط وضمانات عمليات الشحن</h4>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            جميع الجواهر يتم شحنها بشكل قانوني 100% ومصرح به من متجر Garena الرسمي. نحن لا نطلب كلمة مرور حسابك في اللعبة أبداً. بمجرد استبدال الجوائز، سيتم فحص المعرف وتعبئة حسابك مباشرة دون أي خطر أو حظر.
          </p>
        </div>
      </div>

      {/* Modals & Dialogs */}
      <AnimatePresence>
        {selectedReward && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm">
            {redeemState === 'insufficient' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 text-right shadow-2xl neon-border-rose"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 mx-auto mb-4 border border-rose-500/20">
                  <AlertTriangle className="h-6 w-6 animate-bounce" />
                </div>
                
                <h3 className="text-lg font-bold text-white text-center mb-2">
                  رصيد نقاطك غير كافٍ!
                </h3>
                
                <p className="text-xs text-slate-300 text-center leading-relaxed mb-6">
                  نقاطك الحالية هي (<span className="font-mono text-cyan-400">{userPoints}</span>) نقطة، بينما تتطلب هذه الجائزة (<span className="font-mono text-white">{selectedReward.pointsCost}</span>) نقطة.
                  <br />
                  <span className="text-cyan-300 font-semibold mt-2 block">
                    العب المزيد واجمع النقاط لشحن الجواهر فوراً!
                  </span>
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedReward(null)}
                    className="flex-1 py-3 bg-slate-950 border border-slate-850 rounded-xl font-bold text-xs hover:bg-slate-800 transition text-center text-white cursor-pointer"
                  >
                    حسناً، فهمت
                  </button>
                </div>
              </motion.div>
            )}

            {redeemState === 'confirming' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 text-right shadow-2xl neon-border-green"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mx-auto mb-4 border border-emerald-500/20">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                
                <h3 className="text-lg font-bold text-white text-center mb-2">
                  تأكيد طلب الاستبدال
                </h3>
                
                <p className="text-xs text-slate-300 text-center leading-relaxed mb-6">
                  هل أنت متأكد من استبدال <span className="font-bold text-white">{selectedReward.diamonds} جوهرة</span> مقابل <span className="font-mono text-emerald-400">{selectedReward.pointsCost} نقطة</span>؟
                  <br />
                  سيتم الشحن تلقائياً للمعرف: <span className="font-mono font-bold text-cyan-400">{playerId}</span>
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={startRedeemSimulation}
                    className="flex-grow py-3 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white rounded-xl font-bold text-xs transition cursor-pointer"
                  >
                    تأكيد الشحن الفوري
                  </button>
                  <button
                    onClick={() => setSelectedReward(null)}
                    className="py-3 px-6 bg-slate-950 border border-slate-850 text-slate-400 rounded-xl font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              </motion.div>
            )}

            {redeemState === 'processing' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 text-right shadow-2xl neon-border-cyan"
              >
                <div className="text-center space-y-4">
                  <Loader className="h-10 w-10 text-cyan-400 animate-spin mx-auto" />
                  
                  <h3 className="text-lg font-bold text-white">
                    جاري معالجة الطلب...
                  </h3>
                  
                  <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                    <div 
                      className="bg-cyan-500 h-2.5 rounded-full transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>

                  <p className="text-xs text-cyan-400 font-medium font-mono min-h-6 animate-pulse">
                    {progressText}
                  </p>
                  
                  <p className="text-[10px] text-slate-500">
                    يرجى عدم إغلاق هذه الصفحة لتجنب انقطاع التوصيل بقناة الاتصال المؤمنة.
                  </p>
                </div>
              </motion.div>
            )}

            {redeemState === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 text-right shadow-2xl neon-border-green"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mx-auto mb-4 border border-emerald-500/20">
                  <CheckCircle2 className="h-8 w-8 animate-bounce text-emerald-400" />
                </div>
                
                <h3 className="text-xl font-extrabold text-white text-center mb-2">
                  تم إرسال الطلب بنجاح!
                </h3>
                
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2 mb-6">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">الجائزة المستبدلة:</span>
                    <span className="font-bold text-white">{selectedReward.diamonds} جوهرة</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">معرف الشحن الـ UID:</span>
                    <span className="font-mono font-bold text-cyan-400">{playerId}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">حالة العملية:</span>
                    <span className="text-emerald-400 font-bold">بانتظار موافقة السيرفر (قيد التنفيذ)</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 text-center leading-relaxed mb-6">
                  بسبب الضغط الكبير على السيرفر، قد تستغرق عملية مراجعة وتأكيد إرسال الجواهر لحسابك من <span className="text-white font-bold">10 دقائق إلى ساعتين</span> كحد أقصى. سيصلك إشعار Booyah! في اللعبة عند إيداع الجواهر بنجاح.
                </p>

                <button
                  onClick={() => {
                    setSelectedReward(null);
                    setRedeemState('idle');
                  }}
                  className="w-full py-3 bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-bold text-sm rounded-xl hover:from-cyan-500 hover:to-purple-500 transition-all cursor-pointer"
                >
                  الرجوع للوحة التحكم
                </button>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
