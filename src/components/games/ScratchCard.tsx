import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, RefreshCw, Award, ShieldAlert } from 'lucide-react';

interface ScratchCardProps {
  onEarnPoints: (points: number) => { added: number; newPoints: number; error?: string };
  onShowAd: () => void;
}

export default function ScratchCard({ onEarnPoints, onShowAd }: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isScratched, setIsScratched] = useState(false);
  const [revealedPoints, setRevealedPoints] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [claimResult, setClaimResult] = useState<{ added: number; error?: string } | null>(null);

  const initScratchCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high resolution or match container
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width || 320;
    canvas.height = rect.height || 180;

    // Generate random points reward for this card
    const randomReward = Math.floor(Math.random() * 30) + 15; // 15 to 44 points
    setRevealedPoints(randomReward);
    setIsScratched(false);
    setClaimed(false);
    setClaimResult(null);

    // Draw the gray scratch layer
    ctx.fillStyle = '#374151'; // Dark gray
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw pattern/glowing text on top
    ctx.font = 'bold 16px Cairo';
    ctx.fillStyle = '#6b7280';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('░ امسح هنا لكشف الجائزة ░', canvas.width / 2, canvas.height / 2);

    // Add diagonal lines for design
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 2;
    for (let i = -canvas.height; i < canvas.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + canvas.height, canvas.height);
      ctx.stroke();
    }
  };

  useEffect(() => {
    initScratchCard();
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Check if touch or mouse
    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || isScratched || claimed) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    // Check progress
    checkScratchPercentage();
  };

  const checkScratchPercentage = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;
    let transparentCount = 0;

    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] === 0) {
        transparentCount++;
      }
    }

    const totalPixels = pixels.length / 4;
    const percentage = (transparentCount / totalPixels) * 100;

    if (percentage > 55 && !isScratched) {
      setIsScratched(true);
      // Reveal everything
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleClaim = () => {
    if (claimed) return;
    setClaimed(true);
    const result = onEarnPoints(revealedPoints);
    setClaimResult({
      added: result.added,
      error: result.error
    });
    // Trigger ad view counter
    onShowAd();
  };

  return (
    <div className="space-y-6 text-center" id="scratch-game">
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-white">بطاقة الكشط السحرية</h3>
        <p className="text-xs text-gray-400">
          حرك إصبعك أو الماوس لمسح الطبقة الفضية واكشف عن نقاطك المخبأة!
        </p>
      </div>

      <div className="relative mx-auto flex items-center justify-center max-w-sm rounded-2xl border-2 border-violet-500/20 bg-[#0c0e18] p-4 neon-border-purple">
        {/* Underneath layer containing reward */}
        <div className="absolute inset-4 flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-violet-950/40 to-indigo-950/40 border border-violet-500/10 z-0">
          <Award className="h-12 w-12 text-violet-400 animate-bounce mb-1" />
          <p className="text-xs text-gray-400 font-semibold">لقد ربحت</p>
          <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-amber-400 font-mono tracking-tight my-1">
            {revealedPoints}
          </p>
          <p className="text-xs text-violet-300">نقطة مجانية!</p>
        </div>

        {/* Scratchable Canvas layer on top */}
        <canvas
          ref={canvasRef}
          onMouseDown={() => setIsDrawing(true)}
          onMouseUp={() => setIsDrawing(false)}
          onMouseLeave={() => setIsDrawing(false)}
          onMouseMove={draw}
          onTouchStart={() => setIsDrawing(true)}
          onTouchEnd={() => setIsDrawing(false)}
          onTouchMove={draw}
          className={`relative z-10 w-full h-44 rounded-xl cursor-crosshair transition-opacity duration-500 ${
            isScratched ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        />
      </div>

      <div className="space-y-4">
        {isScratched && !claimed && (
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={handleClaim}
            className="mx-auto flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-violet-500/20 transition cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>جمع المكافأة والمطالبة بالنقاط</span>
          </motion.button>
        )}

        {claimed && claimResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {claimResult.error ? (
              <div className="mx-auto max-w-sm rounded-xl bg-rose-950/30 border border-rose-500/20 p-3 text-right">
                <div className="flex gap-2 text-rose-400 text-xs">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>{claimResult.error}</p>
                </div>
              </div>
            ) : (
              <div className="text-xs text-emerald-400 font-bold bg-emerald-500/10 py-2.5 px-4 rounded-xl border border-emerald-500/20 inline-block">
                ✓ تم إضافة {claimResult.added} نقطة بنجاح إلى محفظتك!
              </div>
            )}

            <button
              onClick={initScratchCard}
              className="mx-auto flex items-center justify-center gap-1.5 text-xs font-bold text-gray-400 hover:text-white transition cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>امسح بطاقة أخرى</span>
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
