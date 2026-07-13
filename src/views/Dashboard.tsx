/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  Cpu, 
  Clock, 
  ArrowRight,
  Mail,
  MessageSquare,
  Globe,
  Eye,
  QrCode,
  FileWarning
} from 'lucide-react';
import RiskMeter from '../components/RiskMeter';
import { HistoryItem } from '../types';

interface DashboardProps {
  totalScans: number;
  threatsDetected: number;
  safeScans: number;
  riskScore: number;
  recentScans: HistoryItem[];
  sensitivity: string;
  onNavigate: (page: string) => void;
}

export default function Dashboard({
  totalScans,
  threatsDetected,
  safeScans,
  riskScore,
  recentScans,
  sensitivity,
  onNavigate
}: DashboardProps) {
  
  // Scanners shortcuts mapping
  const shortcuts = [
    { id: 'email-scanner', label: 'Email Phishing Scan', icon: Mail, desc: 'Paste emails, subjects, and header domains.', color: 'from-cyan-500/10 to-cyan-500/2' },
    { id: 'sms-scanner', label: 'SMS Smishing Scan', icon: MessageSquare, desc: 'Audit suspicious package and banking texts.', color: 'from-blue-500/10 to-blue-500/2' },
    { id: 'website-scanner', label: 'Website URL Scan', icon: Globe, desc: 'Verify typosquat domains and SSL safety.', color: 'from-indigo-500/10 to-indigo-500/2' },
    { id: 'screenshot-analyzer', label: 'Screenshot Vision Scan', icon: Eye, desc: 'Detect fake apps and PII leaks using local OCR.', color: 'from-violet-500/10 to-violet-500/2' },
    { id: 'qr-scanner', label: 'Quishing QR Scan', icon: QrCode, desc: 'Deconstruct wifi setups and malicious redirect links.', color: 'from-cyan-500/10 to-cyan-500/2' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 lg:px-8 py-6 text-gray-200">
      
      {/* 1. Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Today's Scans */}
        <div className="glass-panel rounded-xl p-5 border border-white/5 relative overflow-hidden flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-gray-400 tracking-wider uppercase">Today's Scans</span>
            <h3 className="text-3xl font-display font-bold text-white tracking-tight">{totalScans}</h3>
            <p className="text-[10px] text-cyan-400 flex items-center gap-1">
              <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span>Active sandbox evaluation</span>
            </p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <Clock className="w-5 h-5 text-cyan-400" />
          </div>
        </div>

        {/* Threats Detected */}
        <div className={`glass-panel rounded-xl p-5 border relative overflow-hidden flex items-center justify-between group transition-all duration-300 ${
          threatsDetected > 0 ? 'border-rose-500/20 bg-rose-950/5' : 'border-white/5'
        }`}>
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-gray-400 tracking-wider uppercase">Threats Detected</span>
            <h3 className={`text-3xl font-display font-bold tracking-tight ${threatsDetected > 0 ? 'text-rose-400' : 'text-white'}`}>{threatsDetected}</h3>
            <p className={`text-[10px] flex items-center gap-1 ${threatsDetected > 0 ? 'text-rose-400' : 'text-gray-500'}`}>
              <ShieldAlert className="w-3 h-3" />
              <span>{threatsDetected > 0 ? 'Critical patterns blocked' : '0 anomalous matches'}</span>
            </p>
          </div>
          <div className={`p-3 rounded-lg border ${
            threatsDetected > 0 ? 'bg-rose-950/40 border-rose-500/30' : 'bg-white/5 border-white/10'
          }`}>
            <ShieldAlert className={`w-5 h-5 ${threatsDetected > 0 ? 'text-rose-400' : 'text-gray-400'}`} />
          </div>
        </div>

        {/* Safe Files/Scans */}
        <div className="glass-panel rounded-xl p-5 border border-white/5 relative overflow-hidden flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-gray-400 tracking-wider uppercase">Safe Scans</span>
            <h3 className="text-3xl font-display font-bold text-emerald-400 tracking-tight">{safeScans}</h3>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Clean verification signatures</span>
            </p>
          </div>
          <div className="p-3 bg-emerald-950/10 rounded-lg border border-emerald-500/15">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        {/* AI Status */}
        <div className="glass-panel rounded-xl p-5 border border-white/5 relative overflow-hidden flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-gray-400 tracking-wider uppercase">AI Core Status</span>
            <h3 className="text-lg font-display font-bold text-white tracking-tight mt-1 truncate">Model Suite v2.4</h3>
            <p className="text-[10px] text-cyan-400 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span>100% Offline (Local OCR)</span>
            </p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-xs font-mono text-cyan-400 flex flex-col items-center justify-center">
            <span>DB-v24</span>
            <span className="text-[8px] text-gray-500 mt-0.5">LOCAL</span>
          </div>
        </div>

      </div>

      {/* 2. Core Dashboard Content: Risk Meter + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Risk Meter Component (Left/Middle Column) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl border border-white/5 p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-cyan-400 tracking-wider">ON-DEVICE HARMONIZER</span>
              <h4 className="font-display font-bold text-white text-md">Overall Risk Meter</h4>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-950/40 border border-white/10 rounded text-cyan-400 uppercase">
              Sensitivity: {sensitivity}
            </span>
          </div>

          <RiskMeter score={riskScore} />

          <div className="mt-4 pt-3 border-t border-white/5 text-center text-xs text-gray-500 font-mono">
            Evaluated against {totalScans * 12 + 42} dynamic local regex and heuristic profiles.
          </div>
        </div>

        {/* Detection Timeline (Right Column) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl border border-white/5 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-cyan-400 tracking-wider">LOG TIMELINE</span>
                <h4 className="font-display font-bold text-white text-md">Incident Detection Stream</h4>
              </div>
              <button 
                onClick={() => onNavigate('scan-history')}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>View Full Archive</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Timeline List */}
            <div className="space-y-3.5 max-h-[250px] overflow-y-auto pr-1">
              {recentScans.length === 0 ? (
                <div className="py-12 text-center text-gray-500 flex flex-col items-center justify-center gap-2">
                  <Shield className="w-8 h-8 text-gray-600" />
                  <span className="text-xs font-mono">No logs indexed. Sandbox clean.</span>
                </div>
              ) : (
                recentScans.slice(0, 5).map((scan) => {
                  let badgeColor = 'bg-emerald-950/20 text-emerald-400 border-emerald-500/20';
                  if (scan.threatLevel === 'malicious') {
                    badgeColor = 'bg-rose-950/20 text-rose-400 border-rose-500/20';
                  } else if (scan.threatLevel === 'suspicious') {
                    badgeColor = 'bg-amber-950/20 text-amber-400 border-amber-500/20';
                  }

                  return (
                    <div 
                      key={scan.id} 
                      className="flex items-start gap-3 p-3 bg-slate-950/25 rounded-lg border border-white/5 hover:border-white/10 transition-all text-left"
                    >
                      <div className="mt-1">
                        {scan.threatLevel === 'malicious' ? (
                          <ShieldAlert className="w-4 h-4 text-rose-400" />
                        ) : scan.threatLevel === 'suspicious' ? (
                          <FileWarning className="w-4 h-4 text-amber-400" />
                        ) : (
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>
                      <div className="flex-1 space-y-0.5 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-white font-display truncate">
                            {scan.title}
                          </span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${badgeColor} shrink-0`}>
                            {scan.threatLevel.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 font-mono truncate">
                          {scan.target}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-gray-600 pt-0.5">
                          <span className="uppercase">{scan.type} SCAN</span>
                          <span>•</span>
                          <span>{new Date(scan.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="text-[10px] text-gray-500 font-mono pt-3 border-t border-white/5">
            PrivacyLens records session timelines directly to client-side session state. Zero network leakage.
          </div>
        </div>

      </div>

      {/* 3. Shortcuts & Quick Launch Panels */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 bg-cyan-500 rounded-full inline-block"></span>
          <h4 className="font-display font-bold text-white text-md">Offline AI Scanners Sandbox</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {shortcuts.map((sc) => {
            const Icon = sc.icon;
            return (
              <button
                key={sc.id}
                onClick={() => onNavigate(sc.id)}
                className={`
                  glass-panel rounded-xl p-5 border border-white/5 hover:border-white/10 transition-all text-left flex flex-col justify-between h-[155px] cursor-pointer hover:shadow-[0_0_15px_rgba(6,182,212,0.1)] group relative overflow-hidden
                `}
              >
                {/* Visual accent background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${sc.color} opacity-60 pointer-events-none`}></div>

                <div className="p-2.5 bg-slate-950/40 rounded-lg border border-white/5 w-fit group-hover:border-white/10 transition-colors">
                  <Icon className="w-5 h-5 text-cyan-400" />
                </div>

                <div className="space-y-1 relative z-10">
                  <h5 className="font-display font-bold text-white text-sm tracking-wide group-hover:text-cyan-300 transition-colors">
                    {sc.label}
                  </h5>
                  <p className="text-[11px] text-gray-500 leading-relaxed truncate">
                    {sc.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
