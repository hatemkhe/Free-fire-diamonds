import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, AlertCircle, Play, ShieldAlert } from 'lucide-react';

interface PlinkoProps {
  onEarnPoints: (points: number) => { added: number; newPoints: number; error?: string };
  onShowAd: () => void;
}

interface Peg {
  x: number;
  y: number;
}

interface Bucket {
  x: number;
  width: number;
  label: string;
  points: number;
  color: string;
}

export default function Plinko({ onEarnPoints, onShowAd }: PlinkoProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDropping, setIsDropping] = useState(false);
  const [landedPoints, setLandedPoints] = useState<number | null>(null);
  const [claimResult, setClaimResult] = useState<{ added: number; error?: string } | null>(null);

  const rows = 8;
  const spacing = 32;
  const startX = 160;
  const startY = 30;

  // Set up pegs
  const pegs: Peg[] = [];
  for (let r = 2; r < rows; r++) {
    const cols = r + 1;
    const y = startY + r * spacing;
    const rowWidth = (cols - 1) * spacing;
    const leftX = startX - rowWidth / 2;
    for (let c = 0; c < cols; c++) {
      pegs.push({
        x: leftX + c * spacing,
        y: y
      });
    }
  }

  // Set up buckets
  const bucketCount = 7;
  const bucketWidth = 40;
  const bucketSpacing = 42;
  const bucketY = startY + rows * spacing + 10;
  const buckets: Bucket[] = [
    { x: startX - 3 * bucketSpacing, width: bucketWidth, label: 'x5', points: 5, color: '#ef4444' },
    { x: startX - 2 * bucketSpacing, width: bucketWidth, label: 'x15', points: 15, color: '#f97316' },
    { x: startX - 1 * bucketSpacing, width: bucketWidth, label: 'x30', points: 30, color: '#eab308' },
    { x: startX, width: bucketWidth, label: 'x75', points: 75, color: '#10b981' },
    { x: startX + 1 * bucketSpacing, width: bucketWidth, label: 'x30', points: 30, color: '#eab308' },
    { x: startX + 2 * bucketSpacing, width: bucketWidth, label: 'x15', points: 15, color: '#f97316' },
    { x: startX + 3 * bucketSpacing, width: bucketWidth, label: 'x5', points: 5, color: '#ef4444' }
  ];

  const drawPlinkoBoard = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, 320, 320);

    // Draw background grid lines very subtly
    ctx.strokeStyle = 'rgba(31, 41, 55, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 320; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 320);
      ctx.stroke();
    }

    // Draw pegs (pins)
    ctx.fillStyle = '#60a5fa'; // Glow cyan
    pegs.forEach((peg) => {
      ctx.beginPath();
      ctx.arc(peg.x, peg.y, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Outer glow
      ctx.fillStyle = 'rgba(96, 165, 250, 0.2)';
      ctx.beginPath();
      ctx.arc(peg.x, peg.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#60a5fa';
    });

    // Draw buckets
    buckets.forEach((b) => {
      ctx.fillStyle = b.color;
      // Draw a rounded card-like bucket
      ctx.fillRect(b.x - b.width / 2, bucketY, b.width, 24);
      
      // Draw bucket label
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 11px Cairo';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b.label, b.x, bucketY + 12);
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set fixed size for simplicity in rendering bounds
    canvas.width = 320;
    canvas.height = 320;

    drawPlinkoBoard(ctx);
  }, []);

  const dropBall = () => {
    if (isDropping) return;

    setIsDropping(true);
    setLandedPoints(null);
    setClaimResult(null);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Physics parameters
    let ballX = startX + (Math.random() * 6 - 3); // minor random offset at top
    let ballY = startY;
    let vx = 0;
    let vy = 1.5;
    const gravity = 0.12;
    const bounceRadius = 5;

    const animate = () => {
      // Clear and redraw background board
      drawPlinkoBoard(ctx);

      // Apply physics
      vy += gravity;
      ballX += vx;
      ballY += vy;

      // Collisions with pegs
      pegs.forEach((peg) => {
        const dx = ballX - peg.x;
        const dy = ballY - peg.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < bounceRadius + 4) {
          // Bounce off the peg
          const angle = Math.atan2(dy, dx);
          
          // Random offset for interesting paths
          const scatter = (Math.random() - 0.5) * 0.4;
          const bounceSpeed = 1.8;

          vx = Math.cos(angle + scatter) * bounceSpeed;
          vy = Math.sin(angle + scatter) * bounceSpeed;

          // Push ball out of peg to prevent stuck state
          ballX = peg.x + Math.cos(angle) * (bounceRadius + 5);
          ballY = peg.y + Math.sin(angle) * (bounceRadius + 5);
        }
      });

      // Clamp ballX inside walls
      if (ballX < 15) { ballX = 15; vx *= -0.5; }
      if (ballX > 305) { ballX = 305; vx *= -0.5; }

      // Draw the active dropping ball
      ctx.fillStyle = '#f43f5e'; // Vibrant red rose
      ctx.beginPath();
      ctx.arc(ballX, ballY, bounceRadius, 0, Math.PI * 2);
      ctx.fill();

      // Outer glow of ball
      ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
      ctx.beginPath();
      ctx.arc(ballX, ballY, bounceRadius + 4, 0, Math.PI * 2);
      ctx.fill();

      // Check landing
      if (ballY >= bucketY) {
        // Find which bucket it landed in
        let closestBucket = buckets[0];
        let minDist = Infinity;
        
        buckets.forEach((b) => {
          const d = Math.abs(ballX - b.x);
          if (d < minDist) {
            minDist = d;
            closestBucket = b;
          }
        });

        // Trigger reward
        setLandedPoints(closestBucket.points);
        setIsDropping(false);

        const result = onEarnPoints(closestBucket.points);
        setClaimResult({
          added: result.added,
          error: result.error
        });

        // Show ad popup
        onShowAd();
      } else {
        requestAnimationFrame(animate);
      }
    };

    animate();
  };

  return (
    <div className="space-y-6 text-center" id="plinko-game">
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-white">بلينكو كرات الجواهر</h3>
        <p className="text-xs text-gray-400">
          أسقط الكرة الفيزيائية لتسقط عبر الحواجز وتستقر في خانات مضاعفات النقاط بالأسفل!
        </p>
      </div>

      <div className="relative mx-auto flex items-center justify-center max-w-xs rounded-2xl border-2 border-emerald-500/10 bg-[#07090e] p-3 shadow-inner shadow-emerald-500/5">
        <canvas
          ref={canvasRef}
          className="w-full h-80 rounded-xl"
        />
      </div>

      <div className="max-w-xs mx-auto space-y-4">
        <button
          onClick={dropBall}
          disabled={isDropping}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/15 transition text-sm disabled:opacity-50 cursor-pointer"
        >
          <Play className="h-4 w-4 fill-white" />
          <span>إسقاط كرات الحظ</span>
        </button>

        <AnimatePresence>
          {landedPoints !== null && claimResult && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-3 rounded-xl bg-gray-950/80 border border-gray-800"
            >
              <p className="text-xs text-gray-400 font-semibold">استقرت الكرة في خانة:</p>
              <p className="text-lg font-black text-emerald-400 font-mono my-0.5">+{landedPoints} نقطة</p>
              
              <div className="mt-2 text-xs">
                {claimResult.error ? (
                  <div className="p-2 bg-rose-950/20 border border-rose-500/10 rounded-xl text-rose-400 text-xs flex gap-1 items-start text-right">
                    <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{claimResult.error}</span>
                  </div>
                ) : (
                  <p className="text-emerald-400 font-bold">✓ تم منحك +{claimResult.added} نقطة بنجاح!</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
