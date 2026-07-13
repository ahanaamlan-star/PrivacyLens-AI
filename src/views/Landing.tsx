/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Cpu, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  Database, 
  AlertTriangle,
  ServerOff,
  CheckCircle,
  EyeOff
} from 'lucide-react';

interface LandingProps {
  onEnterApp: () => void;
}

export default function Landing({ onEnterApp }: LandingProps) {
  // Assessment Quiz State
  const [answers, setAnswers] = useState({
    smsLinks: false,
    publicQr: false,
    reusePasswords: false,
    unsecureWifi: false,
    emailInvoice: false,
  });

  const [assessed, setAssessed] = useState(false);
  const [assessedScore, setAssessedScore] = useState(0);

  const toggleAnswer = (key: keyof typeof answers) => {
    setAnswers(prev => ({ ...prev, [key]: !prev[key] }));
    setAssessed(false); // reset assessment until they recalculate
  };

  const calculateRisk = () => {
    let score = 15; // base safe score
    if (answers.smsLinks) score += 20;
    if (answers.publicQr) score += 15;
    if (answers.reusePasswords) score += 25;
    if (answers.unsecureWifi) score += 15;
    if (answers.emailInvoice) score += 10;
    
    setAssessedScore(score);
    setAssessed(true);
  };

  const features = [
    {
      icon: Cpu,
      title: "On-Device Local Inference",
      desc: "All calculations, models, and regex parameters are executed locally in your browser sandboxed sandbox. No API keys or remote nodes queried."
    },
    {
      icon: EyeOff,
      title: "Zero PII Transmitted",
      desc: "Phishing content, confidential emails, SMS contact tokens, and screenshots remain locked inside local memory. Impossible to be harvested."
    },
    {
      icon: ServerOff,
      title: "100% Offline Resilience",
      desc: "No internet needed. The heuristics matching engine functions perfectly inside offline cellular zones, secure bunkers, or high-security networks."
    },
    {
      icon: Sparkles,
      title: "Multi-Model Categorization",
      desc: "Leverages lightweight, custom-tuned classifiers specialized in delivery fraud, financial coercion, and typosquatting domain patterns."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between text-gray-200">
      
      {/* Hero Header Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-8 py-12 flex flex-col lg:flex-row items-center gap-12">
        
        {/* Left column: High-end display introduction */}
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-950/40 border border-cyan-500/20 rounded-full text-xs font-mono text-cyan-400">
            <ShieldCheck className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>PRIVACYLENS AI v2.4 OFF-CLOUD SUITE</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white leading-none tracking-tight">
            On-Device AI <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500 bg-clip-text text-transparent">
              Cybersecurity Shield
            </span>
          </h2>

          <p className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Detect sophisticated email phishing, smishing texts, typosquatting URLs, malicious QR codes, and suspicious screenshots entirely locally. Zero data uploaded. Zero trust leaks.
          </p>

          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-4">
            <button
              onClick={onEnterApp}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-display font-semibold rounded-xl transition-all duration-300 shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_40px_rgba(6,182,212,0.45)] transform hover:-translate-y-0.5 flex items-center justify-center gap-2.5 cursor-pointer"
              id="boot-core-btn"
            >
              <span>Boot Offline SOC Core</span>
              <ArrowRight className="w-5 h-5 text-white" />
            </button>
            <a
              href="#risk-assessment"
              className="px-6 py-4 bg-cyber-deep/60 hover:bg-cyan-950/40 border border-cyan-500/15 hover:border-cyan-500/30 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
            >
              <span>Verify Personal Risk</span>
            </a>
          </div>

          {/* Mini Dashboard Metrics teaser */}
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto lg:mx-0 pt-6">
            <div className="bg-cyber-deep/30 border border-cyan-500/5 rounded-lg p-3 text-center">
              <span className="text-xl font-bold font-display text-white">0%</span>
              <p className="text-[10px] text-gray-500 font-mono tracking-wider mt-1 uppercase">Cloud Sync</p>
            </div>
            <div className="bg-cyber-deep/30 border border-cyan-500/5 rounded-lg p-3 text-center">
              <span className="text-xl font-bold font-display text-white">&lt; 15ms</span>
              <p className="text-[10px] text-gray-500 font-mono tracking-wider mt-1 uppercase">Latency</p>
            </div>
            <div className="bg-cyber-deep/30 border border-cyan-500/5 rounded-lg p-3 text-center">
              <span className="text-xl font-bold font-display text-white">100%</span>
              <p className="text-[10px] text-gray-500 font-mono tracking-wider mt-1 uppercase">Local Control</p>
            </div>
          </div>
        </div>

        {/* Right column: Interactive Sandbox Habits Assessment Card */}
        <div id="risk-assessment" className="flex-1 w-full max-w-lg">
          <div className="glass-panel rounded-2xl border border-cyan-500/15 shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-cyan-400 font-bold tracking-widest block">ASSESSMENT TOOL</span>
              <h3 className="text-xl font-display font-bold text-white">Your Ambient Threat Scorecard</h3>
              <p className="text-xs text-gray-400">Toggle your frequent digital activities to simulate your risk vector:</p>
            </div>

            {/* Checklist elements */}
            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 p-3 bg-cyber-deep/55 hover:bg-cyber-deep/85 rounded-xl border border-cyan-500/5 cursor-pointer select-none transition-colors">
                <input 
                  type="checkbox" 
                  checked={answers.smsLinks} 
                  onChange={() => toggleAnswer('smsLinks')}
                  className="mt-1 accent-cyan-500" 
                />
                <div className="text-left">
                  <span className="text-sm font-medium text-gray-200">I tap package delivery tracking URLs in SMS text alerts</span>
                  <p className="text-[11px] text-gray-500">Often leads to package delivery redirection scams (smishing).</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-cyber-deep/55 hover:bg-cyber-deep/85 rounded-xl border border-cyan-500/5 cursor-pointer select-none transition-colors">
                <input 
                  type="checkbox" 
                  checked={answers.publicQr} 
                  onChange={() => toggleAnswer('publicQr')}
                  className="mt-1 accent-cyan-500" 
                />
                <div className="text-left">
                  <span className="text-sm font-medium text-gray-200">I scan public terminal QR stickers for quick payments</span>
                  <p className="text-[11px] text-gray-500">Vulnerable to physical sticker overlays (Quishing QR traps).</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-cyber-deep/55 hover:bg-cyber-deep/85 rounded-xl border border-cyan-500/5 cursor-pointer select-none transition-colors">
                <input 
                  type="checkbox" 
                  checked={answers.reusePasswords} 
                  onChange={() => toggleAnswer('reusePasswords')}
                  className="mt-1 accent-cyan-500" 
                />
                <div className="text-left">
                  <span className="text-sm font-medium text-gray-200">I reuse critical passwords across multiple standard accounts</span>
                  <p className="text-[11px] text-gray-500">Increases vulnerability if one third-party service leaks data.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-cyber-deep/55 hover:bg-cyber-deep/85 rounded-xl border border-cyan-500/5 cursor-pointer select-none transition-colors">
                <input 
                  type="checkbox" 
                  checked={answers.unsecureWifi} 
                  onChange={() => toggleAnswer('unsecureWifi')}
                  className="mt-1 accent-cyan-500" 
                />
                <div className="text-left">
                  <span className="text-sm font-medium text-gray-200">I connect to public airport or coffee shop WIFI without a VPN</span>
                  <p className="text-[11px] text-gray-500">Allows active man-in-the-middle sniffing of HTTP web requests.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-cyber-deep/55 hover:bg-cyber-deep/85 rounded-xl border border-cyan-500/5 cursor-pointer select-none transition-colors">
                <input 
                  type="checkbox" 
                  checked={answers.emailInvoice} 
                  onChange={() => toggleAnswer('emailInvoice')}
                  className="mt-1 accent-cyan-500" 
                />
                <div className="text-left">
                  <span className="text-sm font-medium text-gray-200">I open billing refund PDFs from unknown corporate mailboxes</span>
                  <p className="text-[11px] text-gray-500">Common hook used by invoice phishing nodes with payload macros.</p>
                </div>
              </label>
            </div>

            {/* Calculate Button and Output */}
            <div className="pt-2 flex flex-col gap-4">
              <button
                onClick={calculateRisk}
                className="w-full py-3.5 bg-cyan-950/50 hover:bg-cyan-900/60 text-cyan-300 font-mono text-xs border border-cyan-500/30 rounded-xl transition-all"
                id="calculate-risk-btn"
              >
                COMPILE PERSONAL RISK FACTORS
              </button>

              {assessed && (
                <div className={`p-4 rounded-xl border flex gap-3 transition-all duration-300 ${
                  assessedScore > 50 
                    ? 'bg-rose-950/20 border-rose-500/30 text-rose-300' 
                    : assessedScore > 25 
                    ? 'bg-amber-950/20 border-amber-500/30 text-amber-300' 
                    : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                }`}>
                  <div className="mt-0.5">
                    {assessedScore > 35 ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 text-left space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-sm">Threat Assessment: {assessedScore}% Risk</span>
                      <span className="text-[10px] font-mono tracking-widest font-semibold uppercase">
                        {assessedScore > 50 ? 'CRITICAL' : assessedScore > 25 ? 'ELEVATED' : 'SECURE'}
                      </span>
                    </div>
                    <p className="text-xs opacity-90 leading-relaxed">
                      {assessedScore > 50 
                        ? 'High-risk configurations matched. You are vulnerable to credential theft and parcel redirects. PrivacyLens can secure these vectors.' 
                        : assessedScore > 25 
                        ? 'Elevated vulnerability footprint. Minor adjustments in links checking and Wi-Fi policies will harden your defense.' 
                        : 'Secure posture. Continue employing safety constraints and verify suspicious messages via on-device shields.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

      </main>

      {/* Feature grid detailing Local-only aspects */}
      <section className="bg-cyber-deep/45 border-t border-cyan-500/5 py-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center space-y-2 mb-12">
            <h3 className="text-2xl font-display font-bold text-white">Built Around Absolute Privacy</h3>
            <p className="text-sm text-gray-400 max-w-lg mx-auto">
              Legacy security apps query servers to index your inputs. PrivacyLens AI performs every evaluation on your device sandboxed container.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="glass-panel rounded-xl p-5 border border-cyan-500/10 space-y-3.5 hover:border-cyan-500/25 transition-all">
                  <div className="p-2.5 bg-cyan-950/40 rounded-lg w-fit border border-cyan-500/20">
                    <Icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h4 className="font-display font-semibold text-white text-md tracking-wide">{feat.title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer copyright */}
      <footer className="py-6 border-t border-cyan-500/5 text-center text-xs text-gray-500 font-mono">
        <div>PrivacyLens AI Companion | No Data Collection. Sandbox Executed.</div>
      </footer>

    </div>
  );
}
