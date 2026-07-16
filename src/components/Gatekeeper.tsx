import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, ShieldAlert, Sparkles, AlertCircle, Gamepad2 } from 'lucide-react';

interface GatekeeperProps {
  onLogin: (name: string, playerId: string) => void;
}

export default function Gatekeeper({ onLogin }: GatekeeperProps) {
  const [step, setStep] = useState<1 | 2>(1); // 1: Google Auth, 2: Player ID
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-configured simulation accounts
  const mockAccounts = [
    { email: 'bhiakhememssa@gmail.com', name: 'Gamer Master' },
    { email: 'pro_freefire@gmail.com', name: 'FF_Legend_99' },
  ];

  const handleCustomGoogleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail) {
      setError('يرجى إدخال بريد إلكتروني صالح.');
      return;
    }
    
    // Extract a name from email
    const namePart = googleEmail.split('@')[0];
    const computedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    
    setIsGoogleLoading(true);
    setError('');
    setTimeout(() => {
      setIsGoogleLoading(false);
      setGoogleName(computedName);
      setStep(2);
    }, 1500);
  };

  const handleAccountSelect = (email: string, name: string) => {
    setIsGoogleLoading(true);
    setError('');
    setTimeout(() => {
      setIsGoogleLoading(false);
      setGoogleEmail(email);
      setGoogleName(name);
      setStep(2);
    }, 1200);
  };

  const handlePlayerIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerId || playerId.trim().length < 5) {
      setError('يرجى إدخال معرف لاعب صالح (UID يتكون من 5 أرقام على الأقل).');
      return;
    }
    if (!/^\d+$/.test(playerId)) {
      setError('معرف اللاعب يجب أن يحتوي على أرقام فقط.');
      return;
    }
    
    // Success! Log the user in
    onLogin(googleName || 'لاعب مجهول', playerId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/98 px-4 backdrop-blur-xl">
      {/* Background neon elements */}
      <div className="bg-glow top-1/4 left-1/4 bg-cyan-600"></div>
      <div className="bg-glow bottom-1/4 right-1/4 bg-purple-600"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl neon-border-purple md:p-8 text-right"
        id="auth-gatekeeper-card"
      >
        {/* Glow bar at top */}
        <div className="absolute top-0 right-0 left-0 h-[3px] bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500"></div>

        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-md">
            <Gamepad2 className="h-9 w-9 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-white md:text-3xl italic">
            بوابة شحن الجواهر
          </h2>
          <p className="mt-2 text-xs text-slate-400">
            المنصة الترفيهية رقم #1 لجمع النقاط وشحن الهدايا والألعاب مجاناً
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="mt-6 space-y-6"
            >
              <div className="rounded-lg bg-cyan-500/5 p-3 border border-cyan-500/10 flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 leading-relaxed">
                  لحماية حسابك ومطابقة هويتك عند استبدال الجوائز، يتطلب الموقع تسجيل الدخول الآمن بحساب Google.
                </p>
              </div>

              {/* Accounts list simulation */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  اختر حساب Google للمتابعة السريعة:
                </label>
                {mockAccounts.map((acc, index) => (
                  <button
                    key={index}
                    disabled={isGoogleLoading}
                    onClick={() => handleAccountSelect(acc.email, acc.name)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-850 text-right transition group cursor-pointer"
                  >
                    <div className="h-8 w-8 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-sm border border-cyan-500/20">
                      {acc.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate group-hover:text-cyan-400 transition">{acc.name}</p>
                      <p className="text-xs text-slate-500 truncate">{acc.email}</p>
                    </div>
                    <div className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20">نشط</div>
                  </button>
                ))}
              </div>

              {/* Or separator */}
              <div className="relative flex py-2 items-center text-xs text-slate-500">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-3">أو اكتب بريدك الإلكتروني يدوياً</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              {/* Custom Google Sign In form */}
              <form onSubmit={handleCustomGoogleSignIn} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">
                    البريد الإلكتروني لحساب Google:
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="username@gmail.com"
                      disabled={isGoogleLoading}
                      value={googleEmail}
                      onChange={(e) => setGoogleEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-left text-sm text-white placeholder-slate-700 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                      dir="ltr"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-rose-400 text-xs bg-rose-950/20 p-3 rounded-lg border border-rose-950/50">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isGoogleLoading}
                  className="relative w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-500 hover:to-blue-500 focus:outline-none transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isGoogleLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span>جاري الاتصال بـ Google...</span>
                    </div>
                  ) : (
                    <>
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                      </svg>
                      <span>الدخول السريع بحساب Google</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="mt-6 space-y-6"
            >
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="h-10 w-10 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold border border-cyan-500/20">
                  ✓
                </div>
                <div>
                  <p className="text-xs text-slate-500">مرحباً بك، لقد تم التحقق</p>
                  <p className="text-sm font-bold text-white">{googleName}</p>
                </div>
              </div>

              <form onSubmit={handlePlayerIdSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-300 block mb-2">
                    أدخل معرف اللاعب الخاص بك (Player ID / UID):
                  </label>
                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                    هذا المعرف سيتم استخدامه لشحن الجواهر والهدايا لحسابك في اللعبة مباشرة (مثال: 531849103)
                  </p>
                  <input
                    type="text"
                    required
                    maxLength={15}
                    placeholder="مثال: 531849103"
                    value={playerId}
                    onChange={(e) => setPlayerId(e.target.value)}
                    className="w-full text-center rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-lg font-bold text-purple-400 placeholder-slate-700 tracking-widest focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all font-mono"
                    dir="ltr"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-rose-400 text-xs bg-rose-950/20 p-3 rounded-lg border border-rose-950/50">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-3 text-base font-bold text-white shadow-lg shadow-purple-500/20 hover:from-purple-500 hover:to-pink-500 focus:outline-none transition-all cursor-pointer"
                >
                  <Sparkles className="h-5 w-5" />
                  <span>دخول وتفعيل لوحة التحكم</span>
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 text-center text-[10px] text-gray-500">
          منصة مشفرة ومؤمنة بالكامل. جميع عمليات الشحن تتم مراجعتها يدوياً وتلقائياً خلال 10 دقائق من طلب الاستبدال.
        </div>
      </motion.div>
    </div>
  );
}
