/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  MessageSquare, 
  Sparkles, 
  Terminal, 
  ShieldCheck, 
  ShieldAlert, 
  FileWarning, 
  ChevronRight,
  ShieldCheck as SafeIcon
} from 'lucide-react';
import { scanSms, SCANNERS_SANDBOX_PRESETS } from '../utils/heuristics';
import { ScanResult } from '../types';

interface SmsScannerProps {
  onScanCompleted: (result: ScanResult) => void;
  onNavigateToExplainer: () => void;
}

export default function SmsScanner({ onScanCompleted, onNavigateToExplainer }: SmsScannerProps) {
  const [sender, setSender] = useState('');
  const [message, setMessage] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(null);

  const loadPreset = (presetId: string) => {
    const preset = SCANNERS_SANDBOX_PRESETS.sms.find(p => p.id === presetId);
    if (preset) {
      setSender(preset.sender);
      setMessage(preset.message);
      setCurrentResult(null);
    }
  };

  const handleScan = () => {
    if (!sender || !message) return;

    setIsScanning(true);
    setLogs([]);
    setCurrentResult(null);

    const steps = [
      'Booting PrivacyLens-SmsGuard v1.8 (Local Classifier)...',
      'Deconstructing text tokens for smishing templates...',
      'Isolating outbound links and URL redirect shorteners...',
      'Evaluating alphanumeric sender reputation factors...',
      'Matching coercive trigger words...',
      'Generating offline risk index...'
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${step}`]);
        if (idx === steps.length - 1) {
          const result = scanSms(sender, message);
          setIsScanning(false);
          setCurrentResult(result);
          onScanCompleted(result);
        }
      }, (idx + 1) * 200);
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 lg:px-8 py-6 text-gray-200">
      
      {/* 1. Sandbox Preset Bar */}
      <div className="glass-panel rounded-xl p-4 border border-white/5 space-y-2">
        <span className="text-[10px] font-mono text-cyan-400 font-bold tracking-widest block uppercase">Sandbox Smishing Scenarios</span>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => loadPreset('sms-1')}
            className="px-3.5 py-1.5 bg-rose-950/20 hover:bg-rose-900/30 border border-rose-500/20 text-rose-300 rounded-lg text-xs font-mono transition-all"
          >
            📦 Case 1: USPS Parcel Redirection
          </button>
          <button
            onClick={() => loadPreset('sms-2')}
            className="px-3.5 py-1.5 bg-rose-950/20 hover:bg-rose-900/30 border border-rose-500/20 text-rose-300 rounded-lg text-xs font-mono transition-all"
          >
            💳 Case 2: BOA Suspicious Debit Lock
          </button>
          <button
            onClick={() => loadPreset('sms-3')}
            className="px-3.5 py-1.5 bg-emerald-950/20 hover:bg-emerald-900/30 border border-emerald-500/20 text-emerald-300 rounded-lg text-xs font-mono transition-all"
          >
            💬 Case 3: Taco Lunch Friendly Ping
          </button>
        </div>
      </div>

      {/* Main Core Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column: SMS input console (Col span 7) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl border border-white/5 p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/5">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            <h3 className="font-display font-bold text-white text-md">On-Device Smishing Parser</h3>
          </div>

          <div className="space-y-4 text-left">
            {/* Sender */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Sender Identification / Number</label>
              <input
                type="text"
                placeholder="e.g. +1 (415) 555-0129, USPS-Info, or 54201"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950/45 border border-white/5 focus:border-cyan-400 rounded-xl text-sm text-gray-200 outline-none transition-colors font-mono"
              />
            </div>

            {/* Body */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">SMS Message Content</label>
              <textarea
                placeholder="Paste the raw text of the SMS thread here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full px-3 py-2.5 bg-slate-950/45 border border-white/5 focus:border-cyan-400 rounded-xl text-sm text-gray-200 outline-none transition-colors resize-none font-mono"
              />
            </div>
          </div>

          <button
            onClick={handleScan}
            disabled={isScanning || !sender || !message}
            className={`
              w-full py-4 rounded-xl font-display font-bold text-sm transition-all flex items-center justify-center gap-2
              ${!sender || !message 
                ? 'bg-gray-800 text-gray-500 border border-transparent cursor-not-allowed' 
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.15)] cursor-pointer'}
            `}
            id="run-sms-scan-btn"
          >
            {isScanning ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Scanning Local Cell Streams...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Verify SMS Text (Offline)</span>
              </>
            )}
          </button>
        </div>

        {/* Right column: Interactive Visual Phone Chassis (Col span 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Virtual Phone Screen Preview */}
          <div className="mx-auto w-[280px] h-[520px] bg-slate-950 border-4 border-slate-800 rounded-[38px] p-3 shadow-2xl relative flex flex-col justify-between">
            {/* Phone Speaker Notch */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-800 rounded-full flex items-center justify-center z-10">
              <div className="w-10 h-1 bg-slate-700 rounded-full"></div>
            </div>

            {/* Interactive Phone UI */}
            <div className="flex-1 rounded-[28px] bg-slate-950/45 border border-white/5 overflow-hidden flex flex-col justify-between pt-5 pb-3">
              
              {/* Message Header */}
              <div className="px-3 py-2 border-b border-white/5 bg-slate-950/50 flex items-center gap-2 text-left">
                <div className="w-7 h-7 bg-cyan-950/30 border border-cyan-500/20 rounded-full flex items-center justify-center">
                  <span className="text-[10px] text-cyan-400 font-mono font-bold">
                    {sender ? sender.slice(0, 2).toUpperCase() : '?'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-white font-mono truncate">{sender || 'Unknown Sender'}</p>
                  <p className="text-[8px] text-gray-500 font-mono">Offline Thread</p>
                </div>
              </div>

              {/* Chat bubble body */}
              <div className="flex-1 p-3 overflow-y-auto space-y-3 flex flex-col justify-end text-left">
                {message ? (
                  <div className="bg-gray-800/80 text-white rounded-2xl rounded-tl-none p-3 max-w-[85%] self-start text-xs leading-relaxed space-y-1 border border-white/5 font-mono break-all">
                    <span>{message}</span>
                    <span className="text-[7px] text-gray-500 block text-right">09:12 AM</span>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-600 font-mono text-[9px] flex flex-col items-center gap-1.5 self-center">
                    <MessageSquare className="w-5 h-5 text-gray-700" />
                    <span>No SMS Loaded</span>
                  </div>
                )}
                
                {/* On-device inline alert override */}
                {currentResult && (
                  <div className={`
                    rounded-xl border p-2.5 mt-2 self-stretch space-y-1.5 text-left transition-all duration-300
                    ${currentResult.threatLevel === 'malicious' 
                      ? 'bg-rose-950/20 border-rose-500/25 text-rose-300' 
                      : currentResult.threatLevel === 'suspicious' 
                      ? 'bg-amber-950/20 border-amber-500/25 text-amber-300' 
                      : 'bg-emerald-950/20 border-emerald-500/25 text-emerald-300'}
                  `}>
                    <div className="flex items-center gap-1 text-[9px] font-display font-semibold uppercase">
                      {currentResult.threatLevel === 'malicious' ? 'PHISHING VERDICT' : 'CLEAN SIGNATURE'}
                    </div>
                    <p className="text-[10px] leading-relaxed opacity-95 font-sans">
                      {currentResult.threatLevel === 'malicious' 
                        ? 'Malicious links matched (Smishing). Do NOT click.' 
                        : currentResult.threatLevel === 'suspicious'
                        ? 'Suspicious elements detected. Handle with care.'
                        : 'No scam patterns matched on-device.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Fake Input Row */}
              <div className="px-2 pt-2 border-t border-white/5 flex items-center gap-1">
                <div className="flex-1 bg-slate-950/50 rounded-full border border-white/5 px-2.5 py-1 text-[9px] text-gray-500 text-left font-mono">
                  Text Message...
                </div>
              </div>

            </div>
          </div>

          {/* Core Results Card underneath Phone (only shown when ready) */}
          {currentResult && !isScanning && (
            <div className={`
              glass-panel rounded-2xl border p-5 space-y-4 text-left transition-all duration-500
              ${currentResult.threatLevel === 'malicious' 
                ? 'border-rose-500/20 bg-radial-red-glow/5' 
                : currentResult.threatLevel === 'suspicious' 
                ? 'border-amber-500/20 bg-radial-gradient-glow/5' 
                : 'border-emerald-500/20 bg-radial-green-glow/5'}
            `}>
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">SMS Risk Scorecard</span>
                <span className={`text-sm font-display font-bold ${
                  currentResult.threatLevel === 'malicious' ? 'text-rose-400' : currentResult.threatLevel === 'suspicious' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {currentResult.riskScore}% RISK
                </span>
              </div>

              <div className="space-y-2">
                {currentResult.findings.map((f, idx) => (
                  <div key={idx} className="text-xs p-2.5 bg-slate-950/45 rounded-lg border border-white/5 text-gray-300 space-y-0.5">
                    <div className="font-display font-bold text-white flex items-center gap-2">
                      <span>{f.title}</span>
                      <span className="text-[8px] font-mono px-1 py-0.5 bg-rose-950/25 border border-rose-500/15 rounded text-rose-300 tracking-wider">
                        {f.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] opacity-85 leading-relaxed">{f.description}</p>
                  </div>
                ))}
              </div>

              {/* remedies */}
              <div className="p-3 bg-slate-950/20 rounded-xl border border-white/5 text-[11px] text-gray-400 leading-relaxed">
                <span className="font-mono text-[9px] text-cyan-400 font-semibold block uppercase mb-1">Defense remedies</span>
                {currentResult.remedies[0]}
              </div>

              <button
                onClick={onNavigateToExplainer}
                className="w-full py-2 bg-slate-950/20 hover:bg-white/5 border border-white/5 text-cyan-400 text-xs font-mono rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Explain smishing behavior inside AI Explainer</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Logging stream when loading */}
          {isScanning && (
            <div className="glass-panel rounded-2xl border border-white/10 p-4 bg-slate-950/45 text-left space-y-2">
              <span className="text-[9px] font-mono text-cyan-400 font-bold block uppercase tracking-wider">SMS-Guard Stream logs</span>
              <div className="font-mono text-[10px] text-cyan-300 space-y-1.5 max-h-32 overflow-y-auto">
                {logs.map((log, index) => <div key={index} className="truncate">{log}</div>)}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
