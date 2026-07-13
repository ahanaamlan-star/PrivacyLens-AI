/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Globe, 
  Sparkles, 
  Terminal, 
  ShieldCheck, 
  ShieldAlert, 
  FileWarning, 
  ChevronRight,
  Lock,
  Unlock,
  AlertTriangle
} from 'lucide-react';
import { scanWebsite, SCANNERS_SANDBOX_PRESETS } from '../utils/heuristics';
import { ScanResult } from '../types';

interface WebsiteScannerProps {
  onScanCompleted: (result: ScanResult) => void;
  onNavigateToExplainer: () => void;
}

export default function WebsiteScanner({ onScanCompleted, onNavigateToExplainer }: WebsiteScannerProps) {
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(null);

  const loadPreset = (presetId: string) => {
    const preset = SCANNERS_SANDBOX_PRESETS.website.find(p => p.id === presetId);
    if (preset) {
      setUrl(preset.url);
      setCurrentResult(null);
    }
  };

  const handleScan = () => {
    if (!url) return;

    setIsScanning(true);
    setLogs([]);
    setCurrentResult(null);

    const steps = [
      'Querying URL-Net Lite offline parser...',
      'Isolating protocol scheme...',
      'Inspecting hostname syntax for brand typosquat matches...',
      'Counting subdomain nested matrices...',
      'Evaluating domain suffix against low-reputation TLD list...',
      'Assessing local DNS risk criteria...'
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${step}`]);
        if (idx === steps.length - 1) {
          const result = scanWebsite(url);
          setIsScanning(false);
          setCurrentResult(result);
          onScanCompleted(result);
        }
      }, (idx + 1) * 200);
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 lg:px-8 py-6 text-gray-200">
      
      {/* 1. Presets */}
      <div className="glass-panel rounded-xl p-4 border border-cyan-500/10 space-y-2">
        <span className="text-[10px] font-mono text-cyan-400 font-bold tracking-widest block uppercase">Sandbox URL Presets</span>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => loadPreset('web-1')}
            className="px-3.5 py-1.5 bg-rose-950/20 hover:bg-rose-900/30 border border-rose-500/20 text-rose-300 rounded-lg text-xs font-mono transition-all"
          >
            💻 Case 1: Typosquatted PayPal Portal
          </button>
          <button
            onClick={() => loadPreset('web-2')}
            className="px-3.5 py-1.5 bg-rose-950/20 hover:bg-rose-900/30 border border-rose-500/20 text-rose-300 rounded-lg text-xs font-mono transition-all"
          >
            🌐 Case 2: Raw IP-Address Portal
          </button>
          <button
            onClick={() => loadPreset('web-3')}
            className="px-3.5 py-1.5 bg-emerald-950/20 hover:bg-emerald-900/30 border border-emerald-500/20 text-emerald-300 rounded-lg text-xs font-mono transition-all"
          >
            ✅ Case 3: Official GitHub Main site
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Left column: input form */}
        <div className="glass-panel rounded-2xl border border-cyan-500/10 p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-cyan-500/10">
            <Globe className="w-5 h-5 text-cyan-400" />
            <h3 className="font-display font-bold text-white text-md">URL Integrity Analyzer</h3>
          </div>

          <div className="space-y-3.5 text-left">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Website Link URL</label>
              <input
                type="text"
                placeholder="e.g. https://secure-bank-login.xyz/portal"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2.5 bg-cyber-dark/80 border border-cyan-500/15 focus:border-cyan-400 rounded-xl text-sm text-gray-200 outline-none transition-colors font-mono"
              />
            </div>
            
            <p className="text-xs text-gray-500 leading-relaxed pl-1">
              Our URL algorithm analyses SSL handshakes (offline simulated database), typosquatting, TLD reputation scores, and structural spoof subdomains locally inside your sandbox browser memory.
            </p>
          </div>

          <button
            onClick={handleScan}
            disabled={isScanning || !url}
            className={`
              w-full py-4 rounded-xl font-display font-bold text-sm transition-all flex items-center justify-center gap-2
              ${!url 
                ? 'bg-gray-800 text-gray-500 border border-transparent cursor-not-allowed' 
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.15)] cursor-pointer'}
            `}
            id="run-web-scan-btn"
          >
            {isScanning ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Deconstructing URL Syntax...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Deconstruct URL (Offline)</span>
              </>
            )}
          </button>
        </div>

        {/* Right column: results and statistics */}
        <div className="space-y-6">
          
          {/* Terminal log stream */}
          {isScanning && (
            <div className="glass-panel rounded-2xl border border-cyan-500/15 p-4 bg-black/40 text-left space-y-2">
              <span className="text-[9px] font-mono text-cyan-400 font-bold block uppercase tracking-wider">URL Analyzer logs</span>
              <div className="font-mono text-[10px] text-cyan-300 space-y-1.5">
                {logs.map((log, index) => <div key={index} className="truncate">{log}</div>)}
              </div>
            </div>
          )}

          {/* Results Output Block */}
          {currentResult && !isScanning && (
            <div className={`
              glass-panel rounded-2xl border p-6 space-y-5 text-left transition-all duration-500
              ${currentResult.threatLevel === 'malicious' 
                ? 'border-rose-500/20 bg-radial-red-glow/5' 
                : currentResult.threatLevel === 'suspicious' 
                ? 'border-amber-500/20 bg-radial-gradient-glow/5' 
                : 'border-emerald-500/20 bg-radial-green-glow/5'}
            `}>
              
              <div className="flex items-start justify-between border-b border-cyan-500/10 pb-4">
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[9px] font-mono text-gray-500 tracking-widest uppercase">Target Web Domain</span>
                  <h4 className="font-display font-bold text-white text-md truncate font-mono">{currentResult.title.replace('URL Scanner: ', '')}</h4>
                  <p className="text-[11px] text-gray-500 font-mono truncate">{currentResult.target}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-lg font-display font-bold ${
                    currentResult.threatLevel === 'malicious' ? 'text-rose-400' : currentResult.threatLevel === 'suspicious' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {currentResult.threatLevel.toUpperCase()}
                  </span>
                  <span className="text-[9px] font-mono text-gray-500 block">Verdict</span>
                </div>
              </div>

              {/* SSL Status Pill & Domain Age inside results */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-cyber-deep/60 rounded-xl border border-cyan-500/5 flex items-center gap-3">
                  {currentResult.meta.sslVerified ? (
                    <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Unlock className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <div>
                    <span className="text-[9px] font-mono text-gray-500 block uppercase">SSL Protocol</span>
                    <span className={`text-xs font-semibold ${currentResult.meta.sslVerified ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {currentResult.meta.sslVerified ? 'HTTPS (Verified)' : 'HTTP (Unsecure)'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-cyber-deep/60 rounded-xl border border-cyan-500/5 flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <span className="text-[9px] font-mono text-gray-500 block uppercase">Domain Maturity</span>
                    <span className="text-xs font-semibold text-gray-200">
                      {currentResult.meta.domainAge || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Findings */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Heuristics Findings ({currentResult.findings.length})</span>
                
                {currentResult.findings.length === 0 ? (
                  <div className="p-3 bg-emerald-950/15 border border-emerald-500/20 rounded-xl flex items-center gap-2.5 text-emerald-400 text-xs">
                    <ShieldCheck className="w-4 h-4" />
                    <span>No structural anomalies found. Domain matches verified safe reputation scores.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentResult.findings.map((finding) => (
                      <div 
                        key={finding.id} 
                        className={`p-3 rounded-xl border flex gap-2.5 ${
                          finding.severity === 'high' 
                            ? 'bg-rose-950/15 border-rose-500/20 text-rose-300' 
                            : 'bg-amber-950/15 border-amber-500/20 text-amber-300'
                        }`}
                      >
                        <div className="mt-0.5">
                          {finding.severity === 'high' ? <ShieldAlert className="w-4 h-4 shrink-0" /> : <FileWarning className="w-4 h-4 shrink-0" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold font-display">{finding.title}</span>
                            <span className="text-[8px] font-mono px-1 py-0.5 bg-black/40 rounded border border-white/5 uppercase">
                              {finding.severity}
                            </span>
                          </div>
                          <p className="text-[11px] opacity-85 mt-0.5 leading-relaxed">{finding.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Remedies Block */}
              <div className="p-3.5 bg-cyber-deep/60 border border-cyan-500/10 rounded-xl space-y-1">
                <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider block">Suggested Safeguards</span>
                <ul className="space-y-1 list-disc list-inside">
                  {currentResult.remedies.map((r, idx) => (
                    <li key={idx} className="text-xs text-gray-300 leading-relaxed pl-1">{r}</li>
                  ))}
                </ul>
              </div>

              {/* Footer action link */}
              <button
                onClick={onNavigateToExplainer}
                className="w-full py-2 bg-cyan-950/40 hover:bg-cyan-950/60 border border-cyan-500/20 text-cyan-400 text-xs font-mono rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Explain typosquatting methods in AI Explainer</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

            </div>
          )}

          {/* Idle state */}
          {!currentResult && !isScanning && (
            <div className="glass-panel rounded-2xl border border-cyan-500/10 p-12 text-center flex flex-col items-center justify-center gap-4 h-full">
              <div className="p-4 bg-cyan-950/30 rounded-full border border-cyan-500/15">
                <Globe className="w-8 h-8 text-cyan-500" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-semibold text-white text-md">Awaiting URL Parameter</h4>
                <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
                  Provide an external web address or tap one of our pre-configured sandbox threat cases to analyze cryptographic properties.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
