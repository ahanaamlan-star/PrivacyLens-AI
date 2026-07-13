/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Mail, 
  Sparkles, 
  Terminal, 
  ShieldCheck, 
  ShieldAlert, 
  FileWarning, 
  ChevronRight,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import { scanEmail, SCANNERS_SANDBOX_PRESETS } from '../utils/heuristics';
import { ScanResult } from '../types';

interface EmailScannerProps {
  onScanCompleted: (result: ScanResult) => void;
  onNavigateToExplainer: () => void;
}

export default function EmailScanner({ onScanCompleted, onNavigateToExplainer }: EmailScannerProps) {
  const [senderEmail, setSenderEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(null);
  const [copied, setCopied] = useState(false);

  // Load a quick preset email sandbox case
  const loadPreset = (presetId: string) => {
    const preset = SCANNERS_SANDBOX_PRESETS.email.find(p => p.id === presetId);
    if (preset) {
      setSenderEmail(preset.senderEmail);
      setSubject(preset.subject);
      setBody(preset.body);
      setCurrentResult(null); // Reset previous outputs
    }
  };

  const handleScan = () => {
    if (!senderEmail || !body) return;

    setIsScanning(true);
    setLogs([]);
    setCurrentResult(null);

    // Simulate cyber console logging steps
    const steps = [
      'Initializing PrivacyLens-BERT v4.2 Local Inference...',
      'Isolating email header & envelope signatures...',
      'Evaluating sender domain reputation indexes...',
      `Parsing sender authenticity matching for: "${senderEmail}"`,
      'Running tokenizers on body syntax & urgency triggers...',
      'Decoding hyperlinked destination endpoints...',
      'Computing off-cloud heuristic weights...',
      'Finalizing on-device audit scorecard...'
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${step}`]);
        if (idx === steps.length - 1) {
          // Finish scanning
          const result = scanEmail(subject, body, senderEmail);
          setIsScanning(false);
          setCurrentResult(result);
          onScanCompleted(result); // sync with app global state
        }
      }, (idx + 1) * 200);
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(currentResult, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 lg:px-8 py-6 text-gray-200">
      
      {/* 1. Presets Panel */}
      <div className="glass-panel rounded-xl p-4 border border-white/5 space-y-2">
        <span className="text-[10px] font-mono text-cyan-400 font-bold tracking-widest block uppercase">Sandbox Testing Cases</span>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => loadPreset('em-1')}
            className="px-3.5 py-1.5 bg-rose-950/20 hover:bg-rose-900/30 border border-rose-500/20 text-rose-300 rounded-lg text-xs font-mono transition-all"
          >
            🔥 Case 1: Netflix Account Suspended
          </button>
          <button
            onClick={() => loadPreset('em-2')}
            className="px-3.5 py-1.5 bg-rose-950/20 hover:bg-rose-900/30 border border-rose-500/20 text-rose-300 rounded-lg text-xs font-mono transition-all"
          >
            🚨 Case 2: Chase Card Fraud Alert
          </button>
          <button
            onClick={() => loadPreset('em-3')}
            className="px-3.5 py-1.5 bg-emerald-950/20 hover:bg-emerald-900/30 border border-emerald-500/20 text-emerald-300 rounded-lg text-xs font-mono transition-all"
          >
            ✅ Case 3: DevMind Tech Newsletter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Left Column: Input Fields */}
        <div className="glass-panel rounded-2xl border border-white/5 p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/5">
            <Mail className="w-5 h-5 text-cyan-400" />
            <h3 className="font-display font-bold text-white text-md">Local Email Editor Sandbox</h3>
          </div>

          <div className="space-y-3.5">
            {/* Sender */}
            <div className="space-y-1 text-left">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Sender Email Address</label>
              <input
                type="email"
                placeholder="e.g. security-paypal@update-assist.com"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950/45 border border-white/5 focus:border-cyan-400 rounded-xl text-sm text-gray-200 outline-none transition-colors font-mono"
              />
            </div>

            {/* Subject */}
            <div className="space-y-1 text-left">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Email Subject</label>
              <input
                type="text"
                placeholder="e.g. Urgent Action Required: Account locked"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950/45 border border-white/5 focus:border-cyan-400 rounded-xl text-sm text-gray-200 outline-none transition-colors"
              />
            </div>

            {/* Body */}
            <div className="space-y-1 text-left">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Email Body / Content</label>
              <textarea
                placeholder="Paste the full email text here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={7}
                className="w-full px-3 py-2.5 bg-slate-950/45 border border-white/5 focus:border-cyan-400 rounded-xl text-sm text-gray-200 outline-none transition-colors resize-none font-sans"
              />
            </div>
          </div>

          {/* Scan Button */}
          <button
            onClick={handleScan}
            disabled={isScanning || !senderEmail || !body}
            className={`
              w-full py-4 rounded-xl font-display font-bold text-sm transition-all flex items-center justify-center gap-2
              ${!senderEmail || !body 
                ? 'bg-gray-800 text-gray-500 border border-transparent cursor-not-allowed' 
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.15)] cursor-pointer'}
            `}
            id="run-email-scan-btn"
          >
            {isScanning ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Executing Local Heuristics...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Verify Email Securely (Offline)</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Console Logs & Scanner Outputs */}
        <div className="space-y-6">
          
          {/* Scanning Terminal Logs */}
          {isScanning && (
            <div className="glass-panel rounded-2xl border border-white/10 p-5 bg-slate-950/45 space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Terminal className="w-4 h-4" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider">BERT Inference Logs</span>
                </div>
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping"></span>
              </div>
              <div className="font-mono text-[11px] text-cyan-300/90 space-y-1.5 h-44 overflow-y-auto pr-1 text-left">
                {logs.map((log, index) => (
                  <div key={index} className="truncate">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results Output Block */}
          {currentResult && !isScanning && (
            <div className={`
              glass-panel rounded-2xl border p-6 space-y-6 relative overflow-hidden transition-all duration-500
              ${currentResult.threatLevel === 'malicious' 
                ? 'border-rose-500/20 bg-radial-red-glow/5' 
                : currentResult.threatLevel === 'suspicious' 
                ? 'border-amber-500/20 bg-radial-gradient-glow/5' 
                : 'border-emerald-500/20 bg-radial-green-glow/5'}
            `}>
              
              {/* Header result banner */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/5">
                <div className="text-left space-y-0.5">
                  <span className="text-[10px] font-mono text-gray-500 tracking-wider">EVALUATION METRICS</span>
                  <h4 className="font-display font-bold text-white text-md truncate">{currentResult.title}</h4>
                  <p className="text-xs text-gray-400 truncate">{currentResult.target}</p>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <span className={`text-xl font-display font-bold ${
                    currentResult.threatLevel === 'malicious' ? 'text-rose-400' : currentResult.threatLevel === 'suspicious' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {currentResult.riskScore}%
                  </span>
                  <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Risk Index</span>
                </div>
              </div>

              {/* Warnings/Findings Accordion */}
              <div className="space-y-3.5 text-left">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Security Findings ({currentResult.findings.length})</span>
                
                {currentResult.findings.length === 0 ? (
                  <div className="p-3 bg-emerald-950/15 border border-emerald-500/20 rounded-xl flex items-center gap-2.5 text-emerald-400">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-sans">No anomalous parameters matched. Standard signature evaluated.</span>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-44 overflow-y-auto pr-1">
                    {currentResult.findings.map((finding) => (
                      <div 
                        key={finding.id} 
                        className={`p-3 rounded-xl border flex gap-2.5 ${
                          finding.severity === 'high' 
                            ? 'bg-rose-950/15 border-rose-500/20 text-rose-300' 
                            : finding.severity === 'medium' 
                            ? 'bg-amber-950/15 border-amber-500/20 text-amber-300' 
                            : 'bg-cyan-950/15 border-cyan-500/10 text-cyan-300'
                        }`}
                      >
                        <div className="mt-0.5">
                          {finding.severity === 'high' ? (
                            <ShieldAlert className="w-4 h-4 shrink-0" />
                          ) : (
                            <FileWarning className="w-4 h-4 shrink-0" />
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold font-display">{finding.title}</span>
                            <span className="text-[8px] font-mono px-1.5 py-0.5 bg-black/40 rounded border border-white/5 tracking-wider uppercase">
                              {finding.severity}
                            </span>
                          </div>
                          <p className="text-[11px] opacity-85 leading-relaxed">{finding.description}</p>
                          {finding.location && (
                            <span className="text-[9px] font-mono opacity-50 block">Target: {finding.location}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Remedies Block */}
              <div className="space-y-2.5 text-left bg-slate-950/20 p-4 rounded-xl border border-white/5">
                <span className="text-[10px] font-mono text-cyan-400 font-semibold uppercase tracking-wider block">Mitigation Advice</span>
                <ul className="space-y-1.5 list-disc list-inside">
                  {currentResult.remedies.map((remedy, idx) => (
                    <li key={idx} className="text-xs text-gray-300 leading-relaxed pl-1">
                      <span className="font-sans">{remedy}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between border-t border-white/5 pt-4 text-xs font-mono">
                <button
                  onClick={handleCopy}
                  className="p-2 bg-slate-950/20 hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-lg text-gray-400 hover:text-cyan-400 transition-all flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied Report' : 'Copy JSON'}</span>
                </button>
                
                <button
                  onClick={onNavigateToExplainer}
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>Explain with AI</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* Idle Placeholder */}
          {!currentResult && !isScanning && (
            <div className="glass-panel rounded-2xl border border-white/5 p-12 text-center flex flex-col items-center justify-center gap-4 h-full">
              <div className="p-4 bg-white/5 rounded-full border border-white/10">
                <Mail className="w-8 h-8 text-cyan-500" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-semibold text-white text-md">Awaiting Email Parameters</h4>
                <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
                  Submit a custom sender address and email text or select one of the sandbox cases to execute on-device local pattern models.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
