/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Shield, ShieldAlert, Cpu, RefreshCw, Radio, Wifi, WifiOff, Smartphone } from 'lucide-react';

interface HeaderProps {
  currentPage: string;
  totalScans: number;
  threatsDetected: number;
  onResetData: () => void;
  isOnline?: boolean;
  pwaInstallable?: boolean;
  onInstallPwa?: () => void;
}

export default function Header({ 
  currentPage, 
  totalScans, 
  threatsDetected, 
  onResetData,
  isOnline = true,
  pwaInstallable = false,
  onInstallPwa
}: HeaderProps) {
  // Convert current page ID to beautiful display titles
  const getPageDetails = () => {
    switch (currentPage) {
      case 'landing':
        return {
          title: 'Cybersecurity Gateway',
          subtitle: 'Zero Cloud Transmission On-Device Verification Suite'
        };
      case 'dashboard':
        return {
          title: 'SOC Command Center',
          subtitle: 'Active real-time telemetry from on-device local rule matchers'
        };
      case 'email-scanner':
        return {
          title: 'Email Phishing Analyzer',
          subtitle: 'Parse full-text email headers, sender tags, and links locally'
        };
      case 'sms-scanner':
        return {
          title: 'SMS & Smishing Shield',
          subtitle: 'Filter delivery frauds, banking locks, and short-redirect tags'
        };
      case 'website-scanner':
        return {
          title: 'Website Typosquat Scanner',
          subtitle: 'Check DNS spelling traps, SSL presence, and nested subdomains'
        };
      case 'screenshot-analyzer':
        return {
          title: 'Vision OCR screen scanner',
          subtitle: 'On-device spatial analysis with real-time target bounding boxes'
        };
      case 'qr-scanner':
        return {
          title: 'QR Code Quishing Guard',
          subtitle: 'Decode dynamic QR actions, WIFI logins, and masked redirects'
        };
      case 'ai-results':
        return {
          title: 'Local AI Security Explainer',
          subtitle: 'Break down findings, threat definitions, and remediation actions'
        };
      case 'scan-history':
        return {
          title: 'Incident Log Vault',
          subtitle: 'Local audit trail of all verified emails, text strings, and files'
        };
      case 'analytics':
        return {
          title: 'Threat Intelligence Matrix',
          subtitle: 'Correlate malicious patterns, threat distribution, and risk factors'
        };
      case 'settings':
        return {
          title: 'Offline Model Configuration',
          subtitle: 'Tweak sensitivity parameters, heuristic models, and offline databases'
        };
      default:
        return {
          title: 'PrivacyLens AI Core',
          subtitle: 'Privacy-first cyber defense ecosystem'
        };
    }
  };

  const { title, subtitle } = getPageDetails();

  return (
    <header className="lg:pl-64 pt-16 lg:pt-0 pb-4 border-b border-white/5 bg-slate-950/35 backdrop-blur-md sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Title Block */}
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-6 bg-cyan-500 rounded-full inline-block"></span>
            <h1 className="text-xl lg:text-2xl font-display font-bold text-white tracking-wide">
              {title}
            </h1>
          </div>
          <p className="text-xs text-gray-400 mt-1 pl-3.5 font-sans">
            {subtitle}
          </p>
        </div>

        {/* Stats and Controls */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Privacy Pill */}
          <div className="bg-cyan-950/20 border border-cyan-500/20 rounded-full px-3.5 py-1.5 flex items-center gap-2 text-xs text-cyan-400 font-mono">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>0% TRANSMITTED</span>
          </div>

          {/* Network Connection Pill */}
          {isOnline ? (
            <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-full px-3.5 py-1.5 flex items-center gap-2 text-xs text-emerald-400 font-mono">
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span>ONLINE — HYBRID CORES</span>
            </div>
          ) : (
            <div className="bg-amber-950/20 border border-amber-500/20 rounded-full px-3.5 py-1.5 flex items-center gap-2 text-xs text-amber-400 font-mono animate-pulse">
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              <span>OFFLINE — LOCAL ENGINES ACTIVE</span>
            </div>
          )}

          {/* Install PWA Prompt Pill */}
          {pwaInstallable && onInstallPwa && (
            <button
              onClick={onInstallPwa}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)] animate-pulse cursor-pointer"
              title="Install PrivacyLens on your home screen for full offline security scanner support"
              id="pwa-install-header-btn"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>INSTALL APP</span>
            </button>
          )}

          {/* Incidents Pill */}
          <div className={`
            border rounded-full px-3.5 py-1.5 flex items-center gap-2 text-xs font-mono
            ${threatsDetected > 0 
              ? 'bg-rose-950/20 border-rose-500/20 text-rose-400' 
              : 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400'}
          `}>
            {threatsDetected > 0 ? (
              <>
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{threatsDetected} PATTERNS INTERCEPTED</span>
              </>
            ) : (
              <>
                <Shield className="w-3.5 h-3.5" />
                <span>CORE SHIELD ACTIVE</span>
              </>
            )}
          </div>

          {/* Reset Sandboxed Data Button */}
          <button
            onClick={onResetData}
            title="Restore presets and refresh sandbox"
            className="p-2 bg-slate-900/30 hover:bg-white/5 text-gray-400 hover:text-cyan-400 border border-white/5 rounded-lg transition-all flex items-center gap-1.5 text-xs font-mono"
            id="reset-sandbox-data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Sandbox</span>
          </button>
        </div>

      </div>
    </header>
  );
}
