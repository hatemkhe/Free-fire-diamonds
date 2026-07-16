import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Gamepad2, Award, ArrowRight, X, Play, ShieldAlert } from 'lucide-react';

// Import our 10 games
import ScratchCard from './games/ScratchCard';
import LuckySpin from './games/LuckySpin';
import WouldYouRather from './games/WouldYouRather';
import MemoryMatch from './games/MemoryMatch';
import SafeCracker from './games/SafeCracker';
import Plinko from './games/Plinko';
import HigherLower from './games/HigherLower';
import CoinClicker from './games/CoinClicker';
import GamingQuiz from './games/GamingQuiz';
import MinesGame from './games/MinesGame';

interface EarnPointsProps {
  onEarnPoints: (points: number) => { added: number; newPoints: number; error?: string };
  lastSpinTime: string | null;
  onUpdateSpinTime: (time: string | null) => void;
  onShowInterstitialAd: (onComplete: () => void) => void;
}

interface GameItem {
  id: string;
  title: string;
  description: string;
  pointsRange: string;
  category: string;
  icon: string;
  glowClass: string;
  difficulty: 'سهل' | 'متوسط' | 'حماسي' | 'ذكاء';
}

export default function EarnPoints({
  onEarnPoints,
  lastSpinTime,
  onUpdateSpinTime,
  onShowInterstitialAd
}: EarnPointsProps) {
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  const gamesList: GameItem[] = [
    {
      id: 'scratch',
      title: 'امسح واربح (Scratch Card)',
      description: 'اكشط الطبقة الفضية السحرية بالماوس أو الإصبع للكشف عن كنز من نقاط ألعاب فري فاير عشوائياً!',
      pointsRange: '+15 إلى +44 نقطة',
      category: 'حظ وسرعة ⚡',
      icon: '✨',
      glowClass: 'neon-border-purple text-violet-400 border-violet-500/20',
      difficulty: 'سهل'
    },
    {
      id: 'spin',
      title: 'عجلة الحظ (Lucky Spin)',
      description: 'أدر عجلة الروليت المضيئة لفرصة ربح جوائز كبرى تصل إلى 150 نقطة فورية كل 5 دقائق!',
      pointsRange: '0 إلى +150 نقطة',
      category: 'عجلة حظ 🎡',
      icon: '🎡',
      glowClass: 'neon-border-cyan text-cyan-400 border-cyan-500/20',
      difficulty: 'سهل'
    },
    {
      id: 'wouldyou',
      title: 'لو خيروك (Would You Rather)',
      description: 'أجب عن أصعب الخيارات والتساؤلات الحماسية لمجتمعات الألعاب والتقنية واكسب النقاط فوراً!',
      pointsRange: '+15 نقطة مضمونة',
      category: 'تفاعلي 🗣️',
      icon: '🗣️',
      glowClass: 'neon-border-rose text-rose-400 border-rose-500/20',
      difficulty: 'حماسي'
    },
    {
      id: 'memory',
      title: 'تحدي الذاكرة (Memory Match)',
      description: 'طابق بطاقات الألعاب المتشابهة بأقل حركات ممكنة لتنشيط الذاكرة وكسب النقاط الشحن الكبيرة!',
      pointsRange: '+40 نقطة كبرى',
      category: 'تركيز وذكاء 🧠',
      icon: '🧠',
      glowClass: 'neon-border-purple text-purple-400 border-purple-500/20',
      difficulty: 'ذكاء'
    },
    {
      id: 'safe',
      title: 'فك الخزنة (Safe Cracker)',
      description: 'خمن الرقم السري لفتح الخزنة الحديدية المحصنة بالاعتماد على تلميحات أعلى أو أقل بحنكة!',
      pointsRange: '+45 نقطة شحن',
      category: 'تخمين وذكاء 🕵️',
      icon: '🔐',
      glowClass: 'neon-border-cyan text-blue-400 border-blue-500/20',
      difficulty: 'ذكاء'
    },
    {
      id: 'plinko',
      title: 'بلينكو الكرات (Plinko)',
      description: 'أسقط كرة الحظ الفيزيائية لتصطدم بالدبابيس العشوائية وتسقط في خانات مضاعفات النقاط الذهبية!',
      pointsRange: '+5 إلى +75 نقطة',
      category: 'فيزياء وحظ 🎯',
      icon: '🎯',
      glowClass: 'neon-border-green text-emerald-400 border-emerald-500/20',
      difficulty: 'متوسط'
    },
    {
      id: 'higher',
      title: 'أكبر أو أصغر (Higher/Lower)',
      description: 'توقع هل الرقم القادم سيكون أعلى أم أقل من الرقم المعروض لبناء سلسلة فوز مضاعفة!',
      pointsRange: '+15 نقطة عن كل فوز',
      category: 'توقعات وترقب 📊',
      icon: '📊',
      glowClass: 'neon-border-cyan text-blue-400 border-blue-500/20',
      difficulty: 'متوسط'
    },
    {
      id: 'clicker',
      title: 'مطور النقرات التلقائي (Coin Clicker)',
      description: 'اضغط العملة العملاقة لتوليد الكنوز، واشترِ روبوتات توليد النقود آلياً وحولها لرصيد شحن حقيقي!',
      pointsRange: 'لا نهائي ♾️',
      category: 'تطوير ونقر 🪙',
      icon: '🪙',
      glowClass: 'neon-border-rose text-orange-400 border-orange-500/20',
      difficulty: 'سهل'
    },
    {
      id: 'quiz',
      title: 'الأسئلة والخيارات الثلاثة (3-Option Quiz)',
      description: 'أجب عن أسئلة معلومات عامة وجيمينج حماسية خاضعة لعداد تنازلي سريع (20 ثانية) لإثبات معرفتك!',
      pointsRange: '+40 إلى +90 نقطة',
      category: 'ثقافة وألعاب 📝',
      icon: '📝',
      glowClass: 'neon-border-purple text-indigo-400 border-indigo-500/20',
      difficulty: 'ذكاء'
    },
    {
      id: 'mines',
      title: 'المنجم والقنبلة (Minesweeper)',
      description: 'اكشف الجواهر الثمينة لرفع رصيد النقاط، واحذر القنابل الموقوتة! يمكنك الانسحاب وجني الأرباح بأي وقت.',
      pointsRange: 'تراكمي لـ +100 نقطة',
      category: 'مخاطرة وتعدين 💣',
      icon: '💣',
      glowClass: 'neon-border-green text-emerald-400 border-emerald-500/20',
      difficulty: 'حماسي'
    }
  ];

  const handleOpenGame = (gameId: string) => {
    setActiveGameId(gameId);
  };

  const handleCloseGame = () => {
    setActiveGameId(null);
  };

  return (
    <div className="space-y-6" id="earn-points-section">
      {/* Tab Header Description */}
      <div className="text-right space-y-2">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Gamepad2 className="h-6 w-6 text-blue-500 animate-pulse" />
          طرق جمع النقاط
        </h2>
        <p className="text-xs text-gray-400">
          اختر أحد الألعاب التفاعلية العشرة أدناه لجمع النقاط مجاناً وبسرعة لتتمكن من استبدالها فوراً بجواهر فري فاير!
        </p>
      </div>

      {/* Bento Grid of 10 Games */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {gamesList.map((game) => (
          <div
            key={game.id}
            className={`group relative overflow-hidden rounded-2xl border bg-slate-900 p-5 text-right transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between ${game.glowClass}`}
          >
            {/* Top decorative elements */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-3">
              <span className="text-xs font-bold bg-slate-950 px-2.5 py-1 rounded-full text-slate-400 border border-slate-800">{game.category}</span>
              <div className="flex items-center gap-1.5 text-xs">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  game.difficulty === 'سهل' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                  game.difficulty === 'متوسط' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                  game.difficulty === 'حماسي' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                }`}>
                  {game.difficulty}
                </span>
                <span className="text-xs font-black text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {game.pointsRange}
                </span>
              </div>
            </div>

            {/* Core Details */}
            <div className="space-y-2 mb-4 flex-1">
              <div className="flex items-start gap-3">
                <span className="text-3xl filter drop-shadow-[0_2px_10px_rgba(6,182,212,0.3)] shrink-0 mt-0.5">
                  {game.icon}
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-white group-hover:text-cyan-400 transition-colors">
                    {game.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1.5">{game.description}</p>
                </div>
              </div>
            </div>

            {/* CTA Play Button */}
            <button
              onClick={() => handleOpenGame(game.id)}
              className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-400 border border-slate-800 hover:border-cyan-500/40 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-cyan-500/5"
            >
              <Play className="h-3.5 w-3.5 fill-current shrink-0" />
              <span>العب الآن واجمع النقاط</span>
            </button>
          </div>
        ))}
      </div>

      {/* FULL SCREEN MODAL FOR RUNNING THE SELECTED GAME */}
      <AnimatePresence>
        {activeGameId && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/95 p-4 md:p-6 backdrop-blur-md overflow-y-auto">
            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl md:p-8 my-8 neon-border-purple"
              id="active-game-modal"
            >
              {/* Header glowing line */}
              <div className="absolute top-0 right-0 left-0 h-[3px] bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500"></div>

              {/* Close Button */}
              <button
                onClick={handleCloseGame}
                className="absolute top-4 left-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-white transition-all cursor-pointer border border-slate-800 z-50 shadow-md"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Game Router Container */}
              <div className="mt-4">
                {activeGameId === 'scratch' && (
                  <ScratchCard 
                    onEarnPoints={onEarnPoints} 
                    onShowAd={() => onShowInterstitialAd(() => {})} 
                  />
                )}
                {activeGameId === 'spin' && (
                  <LuckySpin
                    onEarnPoints={onEarnPoints}
                    lastSpinTime={lastSpinTime}
                    onUpdateSpinTime={onUpdateSpinTime}
                    onShowInterstitialAd={onShowInterstitialAd}
                  />
                )}
                {activeGameId === 'wouldyou' && (
                  <WouldYouRather
                    onEarnPoints={onEarnPoints}
                    onShowAd={() => onShowInterstitialAd(() => {})}
                  />
                )}
                {activeGameId === 'memory' && (
                  <MemoryMatch
                    onEarnPoints={onEarnPoints}
                    onShowAd={() => onShowInterstitialAd(() => {})}
                  />
                )}
                {activeGameId === 'safe' && (
                  <SafeCracker
                    onEarnPoints={onEarnPoints}
                    onShowAd={() => onShowInterstitialAd(() => {})}
                  />
                )}
                {activeGameId === 'plinko' && (
                  <Plinko
                    onEarnPoints={onEarnPoints}
                    onShowAd={() => onShowInterstitialAd(() => {})}
                  />
                )}
                {activeGameId === 'higher' && (
                  <HigherLower
                    onEarnPoints={onEarnPoints}
                    onShowAd={() => onShowInterstitialAd(() => {})}
                  />
                )}
                {activeGameId === 'clicker' && (
                  <CoinClicker
                    onEarnPoints={onEarnPoints}
                    onShowAd={() => onShowInterstitialAd(() => {})}
                  />
                )}
                {activeGameId === 'quiz' && (
                  <GamingQuiz
                    onEarnPoints={onEarnPoints}
                    onShowAd={() => onShowInterstitialAd(() => {})}
                  />
                )}
                {activeGameId === 'mines' && (
                  <MinesGame
                    onEarnPoints={onEarnPoints}
                    onShowAd={() => onShowInterstitialAd(() => {})}
                  />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
