import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, AlertCircle, Play, Timer } from 'lucide-react';

interface AdBannerProps {
  type: 'header' | 'footer' | 'interstitial';
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdBanner({ type, isOpen = false, onClose }: AdBannerProps) {
  const [countdown, setCountdown] = useState(5);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (type === 'interstitial' && isOpen) {
      setCountdown(5);
      setCanClose(false);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanClose(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [type, isOpen]);

  if (type === 'interstitial') {
    return (
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md ad-banner-popup">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl neon-border-cyan text-slate-100"
            >
              {/* Badge */}
              <div className="absolute top-3 right-3 bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-widest">
                AD / إعلان ممول
              </div>

              {/* Close Button / Countdown */}
              <div className="absolute top-3 left-3">
                {canClose ? (
                  <button
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white transition-all cursor-pointer border border-slate-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 rounded-full bg-slate-950 px-3 py-1 font-mono text-xs font-bold text-cyan-400 border border-slate-800">
                    <Timer className="h-4 w-4 animate-spin text-cyan-400" />
                    <span>يمكن التخطي بعد {countdown} ثوانٍ</span>
                  </div>
                )}
              </div>

              {/* Ad Content */}
              <div className="mt-8 text-center space-y-4">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Play className="h-10 w-10 fill-cyan-400 animate-pulse" />
                </div>
                
                <h3 className="text-xl font-black text-white italic">
                  فرصة العمر: شحن <span className="text-cyan-400">5000</span> جوهرة فري فاير مجاناً!
                </h3>
                
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  احصل على مكافأة ترحيبية إضافية تصل إلى 5000 جوهرة فري فاير وسكنات نادرة عند تحميل لعبة 'عصر الأبطال' اليوم والتسجيل بالمعرف الخاص بك.
                </p>

                {/* Simulated Game Ad Preview */}
                <div className="rounded-xl bg-slate-950 border border-slate-800/80 p-3 flex items-center justify-between gap-4 text-right">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-tr from-cyan-600 to-purple-600 flex items-center justify-center font-bold text-lg text-white shadow-md">
                      ⚔️
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">صراع الجبابرة: ألعاب القوة</h4>
                      <p className="text-[10px] text-slate-500">4.8 ★ | أكثر من 10 مليون تحميل</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      alert("رائع! جاري تحويلك للمتجر لتحميل اللعبة والحصول على المكافآت.");
                      if (onClose) onClose();
                    }}
                    className="bg-white hover:bg-cyan-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-lg transition-all cursor-pointer"
                  >
                    تنزيل الآن
                  </button>
                </div>

                <div className="pt-2 text-[10px] text-slate-500">
                  ملاحظة: يدعم موقعنا المطورين المستقلين عبر الإعلانات لمواصلة شحن الجوائز الحقيقية للاعبين.
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  }

  // Header and Footer Banners
  return (
    <div 
      className={`ad-banner relative w-full overflow-hidden border border-dashed border-slate-800 bg-slate-900/50 py-3.5 px-4 text-center rounded-xl transition-all hover:bg-slate-900 group ${
        type === 'header' ? 'my-4 border-cyan-900/40 hover:border-cyan-500/40' : 'my-6 border-purple-900/40 hover:border-purple-500/40'
      }`}
      id={`ad-banner-${type}`}
    >
      <div className="absolute top-1 right-2 bg-slate-950 text-slate-400 font-mono text-[8px] px-2 py-0.5 rounded font-bold uppercase border border-slate-800">
        SPONSORED / مساحة إعلانية
      </div>
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-right mt-1">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-sm border border-cyan-500/20">
            🎁
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">
              {type === 'header' 
                ? 'موسم الشحن الأكبر! تخفيض 80% على حزم الجواهر الذهبية اليوم فقط' 
                : 'هل تبحث عن بطاقات جوجل بلاي مجانية؟ العب وشارك في سحب اليوم!'}
            </h4>
            <p className="text-[10px] text-slate-500">انقر هنا لتسجيل الاشتراك والمطالبة ببطاقتك المجانية فوراً.</p>
          </div>
        </div>
        
        <button
          onClick={() => alert("سيتم فتح صفحة العرض الممول في نافذة جديدة. شكراً لدعمك لموقعنا!")}
          className="bg-slate-800 hover:bg-cyan-500/20 hover:scale-105 text-slate-300 hover:text-cyan-400 border border-slate-700 hover:border-cyan-500/30 text-xs font-bold px-4 py-1.5 rounded transition-all cursor-pointer"
        >
          عرض التفاصيل
        </button>
      </div>
    </div>
  );
}
