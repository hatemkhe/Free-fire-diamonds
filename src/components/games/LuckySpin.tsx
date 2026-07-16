import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'motion/react';
import { Play, RotateCw, AlertTriangle, Timer, Video } from 'lucide-react';

interface LuckySpinProps {
  onEarnPoints: (points: number) => { added: number; newPoints: number; error?: string };
  lastSpinTime: string | null;
  onUpdateSpinTime: (time: string | null) => void;
  onShowInterstitialAd: (onComplete: () => void) => void;
}

interface SpinSector {
  label: string;
  value: number;
  color: string;
}

export default function LuckySpin({
  onEarnPoints,
  lastSpinTime,
  onUpdateSpinTime,
  onShowInterstitialAd
}: LuckySpinProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [claimResult, setClaimResult] = useState<{ added: number; error?: string } | null>(null);
  const [rotationDegrees, setRotationDegrees] = useState(0);

  const sectors: SpinSector[] = [
    { label: "10 نقاط", value: 10, color: "#1e1b4b" },
    { label: "25 نقطة", value: 25, color: "#065f46" },
    { label: "حاول ثانية", value: 0, color: "#7f1d1d" },
    { label: "50 نقطة", value: 50, color: "#1e1b4b" },
    { label: "150 نقطة", value: 150, color: "#854d0e" },
    { label: "15 نقطة", value: 15, color: "#0f766e" },
    { label: "كود شحن", value: 5, color: "#581c87" },
    { label: "100 نقطة", value: 100, color: "#1e3a8a" }
  ];

  const sectorAngle = 360 / sectors.length;

  useEffect(() => {
    if (!lastSpinTime) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const last = new Date(lastSpinTime).getTime();
      const elapsedSeconds = Math.floor((now - last) / 1000);
      const cooldownPeriod = 5 * 60; // 5 minutes in seconds

      if (elapsedSeconds < cooldownPeriod) {
        setCooldownRemaining(cooldownPeriod - elapsedSeconds);
      } else {
        setCooldownRemaining(0);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastSpinTime]);

  const handleSpin = () => {
    if (isSpinning || cooldownRemaining > 0) return;

    setIsSpinning(true);
    setSpinResult(null);
    setClaimResult(null);

    // Pick a random sector to win
    const winningIndex = Math.floor(Math.random() * sectors.length);
    const winningSector = sectors[winningIndex];

    // Angle configuration: full spins + align sector to top pointer
    // Pointer is at 0 degrees (top). Slices index clockwise starting at right/top.
    // Let's rotate anticlockwise or align:
    const targetAngle = 360 - (winningIndex * sectorAngle) + 1440; // 4 full circles plus target
    
    setRotationDegrees(targetAngle);

    setTimeout(() => {
      setIsSpinning(false);
      setSpinResult(winningSector.label);

      // Save spin cooldown
      onUpdateSpinTime(new Date().toISOString());

      if (winningSector.value > 0) {
        const result = onEarnPoints(winningSector.value);
        setClaimResult({
          added: result.added,
          error: result.error
        });
      } else {
        setClaimResult({
          added: 0,
          error: winningSector.label === "كود شحن" ? undefined : "حظاً أوفر في المرة القادمة!"
        });
      }
    }, 5000); // 5 seconds spin animation
  };

  const handleSkipCooldown = () => {
    onShowInterstitialAd(() => {
      // Cooldown reset callback
      onUpdateSpinTime(null);
      setCooldownRemaining(0);
      setSpinResult(null);
      setClaimResult(null);
      setRotationDegrees(0);
    });
  };

  const formatCooldown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 text-center" id="luckyspin-game">
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-white">عجلة الحظ الأسطورية</h3>
        <p className="text-xs text-gray-400">
          أدر العجلة المضيئة الآن لفرصة كسب ما يصل إلى 150 نقطة شحن فورية!
        </p>
      </div>

      {/* Wheel Stage */}
      <div className="relative mx-auto flex h-72 w-72 items-center justify-center rounded-full bg-[#0d0e16] p-4 border border-blue-500/20 shadow-2xl neon-border-cyan">
        
        {/* Pointer */}
        <div className="absolute top-1 z-30 h-0 w-0 border-l-[14px] border-r-[14px] border-t-[20px] border-l-transparent border-r-transparent border-t-rose-500 filter drop-shadow-[0_2px_5px_rgba(244,63,94,0.5)]"></div>
        
        {/* Glowing hub center */}
        <div className="absolute z-20 h-10 w-10 rounded-full bg-[#121420] border-2 border-cyan-400 flex items-center justify-center text-xs font-bold text-cyan-400 shadow-lg shadow-cyan-500/50">
          <RotateCw className={`h-4 w-4 ${isSpinning ? 'animate-spin' : ''}`} />
        </div>

        {/* Interactive SVG Wheel */}
        <svg
          className="h-full w-full rounded-full transition-transform ease-out duration-[5000ms] select-none"
          style={{ transform: `rotate(${rotationDegrees}deg)` }}
          viewBox="0 0 200 200"
        >
          {sectors.map((sector, i) => {
            const startAngle = i * sectorAngle;
            const endAngle = startAngle + sectorAngle;

            // Convert polar coordinates to Cartesian
            const radStart = (Math.PI / 180) * (startAngle - 90);
            const radEnd = (Math.PI / 180) * (endAngle - 90);

            const x1 = 100 + 100 * Math.cos(radStart);
            const y1 = 100 + 100 * Math.sin(radStart);
            const x2 = 100 + 100 * Math.cos(radEnd);
            const y2 = 100 + 100 * Math.sin(radEnd);

            const pathData = `M 100 100 L ${x1} ${y1} A 100 100 0 0 1 ${x2} ${y2} Z`;

            // Text angle
            const textAngle = startAngle + sectorAngle / 2;
            const textRad = (Math.PI / 180) * (textAngle - 90);
            const tx = 100 + 65 * Math.cos(textRad);
            const ty = 100 + 65 * Math.sin(textRad);

            return (
              <g key={i}>
                <path d={pathData} fill={sector.color} stroke="#000" strokeWidth="0.5" />
                <text
                  x={tx}
                  y={ty}
                  fill="#fff"
                  fontSize="7"
                  fontWeight="bold"
                  fontFamily="Cairo"
                  textAnchor="middle"
                  transform={`rotate(${textAngle}, ${tx}, ${ty})`}
                >
                  {sector.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Buttons & Cooldown state */}
      <div className="max-w-xs mx-auto space-y-4">
        {cooldownRemaining > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 rounded-xl bg-gray-950/60 p-3 border border-gray-800 text-amber-400 text-sm">
              <Timer className="h-4 w-4 animate-pulse" />
              <span>يجب الانتظار:</span>
              <span className="font-mono font-bold tracking-wider">{formatCooldown(cooldownRemaining)}</span>
            </div>

            <button
              onClick={handleSkipCooldown}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-rose-500/10 transition text-sm cursor-pointer"
            >
              <Video className="h-4 w-4 shrink-0" />
              <span>تخطي الانتظار بمشاهدة إعلان</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-cyan-500/20 transition text-base disabled:opacity-50 cursor-pointer"
          >
            <Play className="h-5 w-5 fill-white" />
            <span>ابدأ الدوران الآن</span>
          </button>
        )}

        {/* Claim outcomes */}
        {spinResult && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-3 rounded-xl bg-gray-950/80 border border-gray-800"
          >
            <p className="text-xs text-gray-400">لقد وقفت العجلة على:</p>
            <p className="text-lg font-black text-amber-400 my-0.5">{spinResult}</p>
            {claimResult && (
              <div className="mt-2 text-xs">
                {claimResult.error ? (
                  <p className="text-rose-400 bg-rose-950/10 py-1 px-2 rounded">{claimResult.error}</p>
                ) : (
                  <p className="text-emerald-400 font-bold">✓ تم منحك +{claimResult.added} نقطة بنجاح!</p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
