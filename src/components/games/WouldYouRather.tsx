import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, ChevronRight, Award, Flame, AlertCircle } from 'lucide-react';
import { WOULD_YOU_RATHER_QUESTIONS } from '../../utils';

interface WouldYouRatherProps {
  onEarnPoints: (points: number) => { added: number; newPoints: number; error?: string };
  onShowAd: () => void;
}

export default function WouldYouRather({ onEarnPoints, onShowAd }: WouldYouRatherProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | null>(null);
  const [earned, setEarned] = useState(false);
  const [claimResult, setClaimResult] = useState<{ added: number; error?: string } | null>(null);

  const currentQuestion = WOULD_YOU_RATHER_QUESTIONS[currentIndex];

  const handleSelect = (option: 'A' | 'B') => {
    if (selectedOption) return; // Prevent multi-select
    setSelectedOption(option);
    
    // Earn 15 points for answering the question
    const result = onEarnPoints(15);
    setClaimResult({
      added: result.added,
      error: result.error
    });
    setEarned(true);

    // Call ad counter
    onShowAd();
  };

  const handleNext = () => {
    if (currentIndex < WOULD_YOU_RATHER_QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setEarned(false);
      setClaimResult(null);
    } else {
      // Reached end, loop back or reset
      setCurrentIndex(0);
      setSelectedOption(null);
      setEarned(false);
      setClaimResult(null);
    }
  };

  return (
    <div className="space-y-6 text-center" id="wouldyourather-game">
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-white">لعبة لو خيروك التفاعلية</h3>
        <p className="text-xs text-gray-400">
          اختر أحد الخيارين الصعبين وشاهد توزيع تصويت مجتمع اللاعبين! (المحاولة تمنحك 15 نقطة)
        </p>
      </div>

      {/* Progress tracker */}
      <div className="flex justify-between items-center text-xs text-gray-400 font-bold bg-[#0d0f19] p-2 px-4 rounded-xl border border-gray-800/60">
        <span>السؤال {currentIndex + 1} من {WOULD_YOU_RATHER_QUESTIONS.length}</span>
        <span className="text-rose-400 font-mono">+15 نقطة</span>
      </div>

      <div className="space-y-4">
        {/* Dilemma Question Title */}
        <div className="rounded-2xl bg-gradient-to-br from-gray-950 to-[#0e0f18] p-5 border border-gray-800 text-center flex flex-col items-center gap-2">
          <HelpCircle className="h-8 w-8 text-indigo-400 animate-pulse" />
          <h4 className="text-base font-black text-white leading-relaxed">أيهما تختار بحكمة؟</h4>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option A (Red Accent) */}
          <button
            onClick={() => handleSelect('A')}
            disabled={selectedOption !== null}
            className={`relative overflow-hidden rounded-2xl border-2 p-5 text-right transition-all duration-300 flex flex-col justify-between min-h-36 ${
              selectedOption === null
                ? 'border-rose-500/20 bg-[#150e12] hover:bg-[#1a0f16] hover:scale-[1.02] cursor-pointer'
                : selectedOption === 'A'
                ? 'border-rose-500 bg-rose-950/20 shadow-lg neon-border-rose'
                : 'border-gray-900 bg-gray-950/40 opacity-40'
            }`}
          >
            <div className="text-rose-400 font-bold text-xs bg-rose-500/10 px-2 py-0.5 rounded self-start">الخيار الأول</div>
            <p className="text-sm font-semibold text-white mt-3 leading-relaxed">{currentQuestion.optionA}</p>
            
            {selectedOption && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${currentQuestion.votesA}%` }}
                className="absolute bottom-0 right-0 h-1.5 bg-rose-500"
              />
            )}
            
            {selectedOption && (
              <div className="mt-4 flex justify-between items-baseline font-mono font-bold text-rose-400 text-xl w-full">
                <span>{currentQuestion.votesA}%</span>
                <span className="text-[10px] text-gray-500">من المصوتين</span>
              </div>
            )}
          </button>

          {/* Option B (Blue Accent) */}
          <button
            onClick={() => handleSelect('B')}
            disabled={selectedOption !== null}
            className={`relative overflow-hidden rounded-2xl border-2 p-5 text-right transition-all duration-300 flex flex-col justify-between min-h-36 ${
              selectedOption === null
                ? 'border-blue-500/20 bg-[#0e121a] hover:bg-[#0f1522] hover:scale-[1.02] cursor-pointer'
                : selectedOption === 'B'
                ? 'border-blue-500 bg-blue-950/20 shadow-lg neon-border-cyan'
                : 'border-gray-900 bg-gray-950/40 opacity-40'
            }`}
          >
            <div className="text-blue-400 font-bold text-xs bg-blue-500/10 px-2 py-0.5 rounded self-start">الخيار الثاني</div>
            <p className="text-sm font-semibold text-white mt-3 leading-relaxed">{currentQuestion.optionB}</p>
            
            {selectedOption && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${currentQuestion.votesB}%` }}
                className="absolute bottom-0 right-0 h-1.5 bg-blue-500"
              />
            )}

            {selectedOption && (
              <div className="mt-4 flex justify-between items-baseline font-mono font-bold text-blue-400 text-xl w-full">
                <span>{currentQuestion.votesB}%</span>
                <span className="text-[10px] text-gray-500">من المصوتين</span>
              </div>
            )}
          </button>
        </div>

        {/* Claim status */}
        <AnimatePresence>
          {selectedOption && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="space-y-4 pt-2"
            >
              {claimResult && (
                <div className="inline-block">
                  {claimResult.error ? (
                    <div className="rounded-xl bg-rose-950/20 border border-rose-500/20 p-2.5 text-xs text-rose-400 text-right flex items-start gap-2 max-w-sm mx-auto">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{claimResult.error}</span>
                    </div>
                  ) : (
                    <div className="text-xs text-emerald-400 font-bold bg-emerald-500/10 py-2 px-4 rounded-xl border border-emerald-500/20 flex items-center justify-center gap-1.5">
                      <Award className="h-4 w-4 text-emerald-400" />
                      <span>تم إضافة +{claimResult.added} نقطة بنجاح لرصيدك!</span>
                    </div>
                  )}
                </div>
              )}

              <div>
                <button
                  onClick={handleNext}
                  className="mx-auto flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-indigo-500/15 transition cursor-pointer text-xs"
                >
                  <span>السؤال التالي</span>
                  <ChevronRight className="h-4 w-4 shrink-0" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
