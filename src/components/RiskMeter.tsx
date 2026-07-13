/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';

interface RiskMeterProps {
  score: number; // 0 to 100
}

export default function RiskMeter({ score }: RiskMeterProps) {
  // Semi-circle SVG settings
  const radius = 80;
  const strokeWidth = 14;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * Math.PI; // For semi-circle
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let label = 'SECURE';
  let colorClass = 'text-green-400';
  let glowColor = 'rgba(34, 197, 94, 0.4)';
  let gradientId = 'gauge-safe';

  if (score >= 70) {
    label = 'CRITICAL RISK';
    colorClass = 'text-red-500';
    glowColor = 'rgba(239, 68, 68, 0.5)';
    gradientId = 'gauge-malicious';
  } else if (score >= 35) {
    label = 'ALERT / ELEVATED';
    colorClass = 'text-amber-400';
    glowColor = 'rgba(251, 191, 36, 0.4)';
    gradientId = 'gauge-suspicious';
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-56 h-36 flex items-center justify-center select-none">
        {/* Outer glow aura */}
        <div 
          className="absolute inset-0 rounded-full transition-all duration-500 blur-2xl" 
          style={{ backgroundColor: glowColor, opacity: 0.15 }}
        />

        <svg className="w-52 h-32 transform -rotate-180" viewBox="0 0 160 100">
          <defs>
            <linearGradient id="gauge-bg" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            
            <linearGradient id="gauge-safe" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>

            <linearGradient id="gauge-suspicious" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>

            <linearGradient id="gauge-malicious" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#b91c1c" />
            </linearGradient>
          </defs>

          {/* Background Arc */}
          <path
            d="M 10,90 A 70,70 0 0,1 150,90"
            fill="none"
            stroke="url(#gauge-bg)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Active Colored Arc */}
          <motion.path
            d="M 10,90 A 70,70 0 0,1 150,90"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />

          {/* Digital tick lines */}
          <line x1="80" y1="20" x2="80" y2="25" stroke="#475569" strokeWidth="2" />
          <line x1="45" y1="35" x2="49" y2="39" stroke="#475569" strokeWidth="2" />
          <line x1="115" y1="35" x2="111" y2="39" stroke="#475569" strokeWidth="2" />
        </svg>

        {/* Core Center Display */}
        <div className="absolute bottom-2 flex flex-col items-center">
          <motion.span 
            key={score}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-display font-bold tracking-tight text-white leading-none"
          >
            {score}
            <span className="text-sm font-sans text-gray-500 font-normal">%</span>
          </motion.span>
          <span className="text-[10px] font-mono text-gray-500 tracking-widest mt-1">
            THREAT LEVEL
          </span>
          <span className={`text-xs font-display font-semibold tracking-wider ${colorClass} mt-0.5`}>
            {label}
          </span>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-2 max-w-[240px] leading-relaxed">
        {score < 35 
          ? 'On-device engine reports low ambient threat vectors. System protected.' 
          : score < 70 
          ? 'Isolated alerts require attention. Review suspicious SMS & URL history.' 
          : 'High-severity malicious patterns active. Execute corrective steps now.'}
      </p>
    </div>
  );
}
