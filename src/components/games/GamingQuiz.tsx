import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, AlertCircle, Timer, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { QUIZ_QUESTIONS } from '../../utils';

interface GamingQuizProps {
  onEarnPoints: (points: number) => { added: number; newPoints: number; error?: string };
  onShowAd: () => void;
}

export default function GamingQuiz({ onEarnPoints, onShowAd }: GamingQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [claimResult, setClaimResult] = useState<{ added: number; error?: string } | null>(null);

  const currentQuestion = QUIZ_QUESTIONS[currentIndex];

  // Timer Effect
  useEffect(() => {
    if (isAnswered) return;

    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, isAnswered]);

  const handleTimeout = () => {
    setIsAnswered(true);
    setSelectedIdx(null); // No selection means timeout
    onShowAd();
  };

  const handleOptionSelect = (optionIndex: number) => {
    if (isAnswered) return;

    setSelectedIdx(optionIndex);
    setIsAnswered(true);

    const isCorrect = optionIndex === currentQuestion.correctIndex;

    if (isCorrect) {
      // Reward points
      const result = onEarnPoints(currentQuestion.pointsReward);
      setClaimResult({
        added: result.added,
        error: result.error
      });
    } else {
      setClaimResult(null);
    }

    onShowAd();
  };

  const handleNext = () => {
    if (currentIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setTimeLeft(20);
      setSelectedIdx(null);
      setIsAnswered(false);
      setClaimResult(null);
    } else {
      // Loop back or reset
      setCurrentIndex(0);
      setTimeLeft(20);
      setSelectedIdx(null);
      setIsAnswered(false);
      setClaimResult(null);
    }
  };

  return (
    <div className="space-y-6 text-center" id="gamingquiz-game">
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-white">تحدي الثلاث خيارات للألعاب</h3>
        <p className="text-xs text-gray-400">
          أجب عن الأسئلة بدقة وسرعة قبل انتهاء الوقت المسموح لجمع مكافآت نقاط ضخمة!
        </p>
      </div>

      {/* Progress & Timer Tracker */}
      <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-xs font-bold text-gray-400 bg-[#0d0f19] p-2.5 px-4 rounded-xl border border-gray-800/60 items-center">
        <div className="text-right">
          <span>السؤال {currentIndex + 1} من {QUIZ_QUESTIONS.length}</span>
        </div>
        <div className="flex items-center justify-end gap-1.5 font-mono text-sm font-black text-rose-400">
          <Timer className={`h-4 w-4 shrink-0 ${timeLeft <= 5 ? 'animate-bounce text-rose-500' : 'text-gray-400'}`} />
          <span className={timeLeft <= 5 ? 'text-rose-500' : 'text-white'}>{timeLeft}ث</span>
        </div>
      </div>

      {/* Timer progress bar */}
      <div className="max-w-sm mx-auto h-1.5 bg-gray-900 rounded-full overflow-hidden border border-gray-800/40">
        <div 
          className={`h-full transition-all duration-1000 ${timeLeft <= 5 ? 'bg-rose-500' : 'bg-blue-500'}`} 
          style={{ width: `${(timeLeft / 20) * 100}%` }}
        ></div>
      </div>

      {/* Question Card */}
      <div className="rounded-2xl bg-gradient-to-br from-gray-950 to-[#0e0f18] p-5 border border-gray-800 text-right space-y-4 max-w-sm mx-auto">
        <div className="text-blue-400 text-[10px] font-black uppercase tracking-wider bg-blue-500/10 px-2.5 py-0.5 rounded-full inline-block">
          قيمة السؤال: +{currentQuestion.pointsReward} نقطة
        </div>
        <h4 className="text-sm font-bold text-white leading-relaxed">
          {currentQuestion.question}
        </h4>
      </div>

      {/* Options Stack */}
      <div className="space-y-3 max-w-sm mx-auto text-right">
        {currentQuestion.options.map((opt, oIdx) => {
          const isSelected = selectedIdx === oIdx;
          const isCorrect = oIdx === currentQuestion.correctIndex;
          
          let btnClass = 'border-gray-800 bg-[#121420] hover:border-blue-500/30';
          let icon = null;

          if (isAnswered) {
            if (isCorrect) {
              btnClass = 'border-emerald-500 bg-emerald-950/20 text-emerald-400 font-bold shadow-lg neon-border-green';
              icon = <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />;
            } else if (isSelected && !isCorrect) {
              btnClass = 'border-rose-500 bg-rose-950/20 text-rose-400 font-bold shadow-lg neon-border-rose';
              icon = <XCircle className="h-4 w-4 text-rose-400 shrink-0" />;
            } else {
              btnClass = 'border-gray-900 bg-gray-950/40 opacity-40';
            }
          }

          return (
            <button
              key={oIdx}
              onClick={() => handleOptionSelect(oIdx)}
              disabled={isAnswered}
              className={`w-full flex items-center justify-between gap-3 p-4 rounded-xl border-2 transition-all duration-300 text-right cursor-pointer ${btnClass}`}
            >
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-[10px] bg-white/5 h-5 w-5 rounded-full flex items-center justify-center font-bold text-gray-500 shrink-0">
                  {oIdx + 1}
                </span>
                <span className="text-xs font-semibold leading-normal">{opt}</span>
              </div>
              {icon}
            </button>
          );
        })}
      </div>

      {/* Timeout state */}
      {isAnswered && selectedIdx === null && (
        <div className="max-w-sm mx-auto p-3 rounded-xl bg-rose-950/20 border border-rose-500/10 text-rose-400 text-xs text-right">
          💥 انتهى وقت الإجابة! الإجابة الصحيحة كانت: <span className="font-bold text-white">{currentQuestion.options[currentQuestion.correctIndex]}</span>
        </div>
      )}

      {/* Outcomes logs & Next buttons */}
      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="space-y-4 pt-2 max-w-sm mx-auto"
          >
            {selectedIdx === currentQuestion.correctIndex && claimResult && (
              <div>
                {claimResult.error ? (
                  <div className="p-2.5 bg-rose-950/20 border border-rose-500/10 rounded-xl text-rose-400 text-xs text-right flex gap-1 items-start">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{claimResult.error}</span>
                  </div>
                ) : (
                  <div className="text-xs text-emerald-400 font-bold bg-emerald-500/10 py-2 px-4 rounded-xl border border-emerald-500/20 block w-full">
                    ✓ إجابة صحيحة مبروك! حصلت على +{claimResult.added} نقطة!
                  </div>
                )}
              </div>
            )}

            <div>
              <button
                onClick={handleNext}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/15 transition text-xs cursor-pointer"
              >
                <span>متابعة للسؤال التالي</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
