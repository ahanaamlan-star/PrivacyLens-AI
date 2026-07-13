/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Cpu, 
  ShieldAlert, 
  HelpCircle, 
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { ScanResult } from '../types';

interface AiResultsProps {
  latestResult: ScanResult | null;
}

export default function AiResults({ latestResult }: AiResultsProps) {
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: 'Greetings. I am PrivacyLens AI, operating on your local system sandbox. How can I assist you with on-device threat signatures, parcel scams, or SSL certificate checks today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Local rule-based chatbot dictionary
  const getLocalResponse = (input: string): string => {
    const q = input.toLowerCase();
    
    if (q.includes('quish') || q.includes('qr')) {
      return 'QR Phishing ("Quishing") involves embedding malicious links into physical or digital barcodes. Attackers paste stickers over parking meters or restaurant registers to redirect you to fraudulent login or payment gateways. Safeguard: Check the URL carefully before submitting passwords, and avoid dynamic WIFI configuration barcodes in unverified areas.';
    }
    if (q.includes('typo') || q.includes('squat') || q.includes('spoof') || q.includes('link')) {
      return 'Typosquatting targets spelling errors made by web browsers. Cyber criminals register domains similar to established brands (e.g., paypa1.com, netf1ix.info) to harvest credentials. Safeguard: Always look for official brand suffixes (.com) and check for excessive, nested subdomains designed to mask target landing nodes.';
    }
    if (q.includes('sms') || q.includes('smish') || q.includes('text') || q.includes('parcel') || q.includes('usps')) {
      return 'SMS Phishing ("Smishing") mimics legitimate notifications (e.g., USPS delivery redelivery, bank lockdowns). These messages use high urgency and direct action links (often shortened through bit.ly or tinyurl) to bypass carrier telecommunication logs. Safeguard: Real postal networks or banks never ask for credentials via SMS. Report smishing texts by copying them to 7726.';
    }
    if (q.includes('http') || q.includes('ssl') || q.includes('unsecure') || q.includes('https')) {
      return 'HTTP (unencrypted) connections pass your network packets in plain text. Anyone on your local, public, or corporate router can intercept credentials entered over standard HTTP. Always verify that websites utilize secure HTTPS protocols. Most modern browsers flag unencrypted sites with a warning badge.';
    }
    if (q.includes('password') || q.includes('credentials') || q.includes('leak')) {
      return 'Password recycling or weak credentials allows hackers to breach multiple profiles if one server leaks data. Safeguard: Utilize a secure offline password manager to create high-entropy, unique passphrases for all portals, and enable multi-factor authentication (MFA) via hardware keys or secure authenticator apps.';
    }
    if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
      return 'Hello! I am ready to break down cybersecurity terms or analyze threat alerts locally on your device. Let me know what you want to learn about (e.g. "What is quishing?", "Is HTTP safe?").';
    }

    return 'Interesting query. As your offline cybersecurity companion, I recommend verifying sender credentials, inspecting SSL protocols, avoiding shorteners, and isolating private parameters. Ask me specifically about "Smishing", "Typosquatting", "Quishing", or "HTTP security" for detailed definitions!';
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;

    const userMsg = {
      sender: 'user' as const,
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, userMsg]);
    const inputToProcess = chatInput;
    setChatInput('');
    setIsTyping(true);

    // Simulate model inference latency
    setTimeout(() => {
      const aiReply = {
        sender: 'ai' as const,
        text: getLocalResponse(inputToProcess),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => [...prev, aiReply]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 lg:px-8 py-6 text-gray-200">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Latest Scan Explainer (Col span 5) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl border border-cyan-500/10 p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-cyan-500/10">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h3 className="font-display font-bold text-white text-md">Latest Scan Deep-Dive</h3>
          </div>

          {latestResult ? (
            <div className="space-y-4 text-left">
              <div className="p-4 bg-cyber-deep/60 rounded-xl border border-cyan-500/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">Active Analysis</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                    latestResult.threatLevel === 'malicious' 
                      ? 'bg-rose-950/30 text-rose-400 border-rose-500/20' 
                      : 'bg-emerald-950/30 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {latestResult.threatLevel}
                  </span>
                </div>
                <h4 className="font-display font-bold text-white text-sm">{latestResult.title}</h4>
                <p className="text-[11px] text-gray-500 font-mono truncate">{latestResult.target}</p>
              </div>

              <div className="space-y-2.5">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Theoretical Definitions</span>
                
                {latestResult.findings.length === 0 ? (
                  <p className="text-xs text-gray-400 leading-relaxed">
                    This scan evaluated safe. The local heuristics matched standard official credentials. No malicious triggers activated.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {latestResult.findings.slice(0, 2).map((finding) => (
                      <div key={finding.id} className="p-3 bg-cyan-950/15 border border-cyan-500/10 rounded-xl space-y-1">
                        <span className="text-xs font-bold font-display text-white">{finding.title}</span>
                        <p className="text-xs text-gray-400 leading-relaxed">{finding.description}</p>
                        
                        {/* Custom educational explanation overlays based on finding category */}
                        <div className="pt-1.5 text-[10px] font-mono text-cyan-400 border-t border-cyan-500/5 flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>
                            {finding.category === 'sender' 
                              ? 'Spoofing is masked by similar lettering layouts.' 
                              : finding.category === 'link' 
                              ? 'Masked gateways hide secondary harvester forms.' 
                              : 'Stress wording triggers immediate emotional bypass.'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3 bg-cyber-deep/30 rounded-xl border border-cyan-500/5 space-y-1 text-xs">
                <span className="text-[10px] font-mono text-gray-400 uppercase block tracking-wider">Offline Model Verdict</span>
                <p className="text-gray-400">
                  Evaluated using <strong className="text-cyan-400 font-mono">{latestResult.meta.modelUsed}</strong>. Dynamic weights checked {latestResult.meta.rulesEvaluated} rules parameters on-device.
                </p>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
              <ShieldAlert className="w-8 h-8 text-gray-600 animate-pulse" />
              <div className="space-y-1">
                <span className="text-xs font-mono block">No Recent Scan Parameters</span>
                <p className="text-[11px] text-gray-600 max-w-xs leading-relaxed mx-auto">
                  Execute one of the on-device sandbox scanners first to automatically load semantic breakdowns here.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Q&A Chat Companion (Col span 7) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl border border-cyan-500/10 p-6 flex flex-col h-[520px] justify-between">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-cyan-500/10 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              <div className="text-left">
                <h4 className="font-display font-bold text-white text-sm">PrivacyLens Assistant</h4>
                <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block"></span>
                  Local Rule Engine active
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-gray-500">Zero Internet Queries</span>
          </div>

          {/* Chat Stream Bubble Area */}
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1.5 pb-4 text-left">
            {chatHistory.map((chat, idx) => {
              const isAi = chat.sender === 'ai';
              return (
                <div 
                  key={idx} 
                  className={`flex flex-col max-w-[85%] space-y-1 ${isAi ? 'self-start' : 'ml-auto items-end'}`}
                >
                  <div className={`
                    p-3.5 rounded-2xl border text-xs leading-relaxed
                    ${isAi 
                      ? 'bg-cyber-deep/80 text-gray-200 border-cyan-500/10 rounded-tl-none font-sans' 
                      : 'bg-gradient-to-r from-cyan-950/40 to-blue-950/30 text-cyan-100 border-cyan-500/20 rounded-tr-none font-mono'}
                  `}>
                    <p>{chat.text}</p>
                  </div>
                  <span className="text-[8px] text-gray-500 font-mono pl-1">
                    {isAi ? 'PrivacyLens Core' : 'User Session'} • {chat.time}
                  </span>
                </div>
              );
            })}

            {/* Simulated typing dot */}
            {isTyping && (
              <div className="bg-cyber-deep/80 border border-cyan-500/10 p-3 rounded-xl rounded-tl-none w-fit flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-200"></span>
              </div>
            )}
          </div>

          {/* Prompt quick inputs suggestions */}
          <div className="flex flex-wrap gap-2 py-3 border-t border-cyan-500/5 mb-3">
            <button 
              onClick={() => setChatInput('What is quishing?')} 
              className="px-2.5 py-1 bg-cyber-deep/60 hover:bg-cyan-950/30 border border-cyan-500/10 hover:border-cyan-500/30 rounded text-[10px] font-mono text-gray-400 hover:text-cyan-400 transition-colors"
            >
              What is quishing?
            </button>
            <button 
              onClick={() => setChatInput('How do I block parcel SMS scams?')} 
              className="px-2.5 py-1 bg-cyber-deep/60 hover:bg-cyan-950/30 border border-cyan-500/10 hover:border-cyan-500/30 rounded text-[10px] font-mono text-gray-400 hover:text-cyan-400 transition-colors"
            >
              Parcel scams help
            </button>
            <button 
              onClick={() => setChatInput('Is HTTP safe?')} 
              className="px-2.5 py-1 bg-cyber-deep/60 hover:bg-cyan-950/30 border border-cyan-500/10 hover:border-cyan-500/30 rounded text-[10px] font-mono text-gray-400 hover:text-cyan-400 transition-colors"
            >
              Is HTTP safe?
            </button>
          </div>

          {/* Form Input Submit Row */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendChat(); }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Type your cybersecurity question (e.g. what is typosquatting?)..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 px-3 py-2.5 bg-cyber-dark/80 border border-cyan-500/15 focus:border-cyan-400 rounded-xl text-xs text-gray-200 outline-none transition-all font-sans"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="p-3 bg-cyan-950/40 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
