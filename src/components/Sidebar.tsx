/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Shield, 
  LayoutDashboard, 
  Mail, 
  MessageSquare, 
  Globe, 
  Eye, 
  QrCode, 
  Sparkles, 
  History, 
  BarChart3, 
  Settings2,
  Menu,
  X,
  Cpu,
  Terminal
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  offlineStatus: boolean;
}

export default function Sidebar({ currentPage, setCurrentPage, offlineStatus }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'landing', label: 'Welcome Portal', icon: Shield, category: 'CORE' },
    { id: 'dashboard', label: 'SOC Dashboard', icon: LayoutDashboard, category: 'CORE' },
    { id: 'email-scanner', label: 'Email Scan', icon: Mail, category: 'DETECTORS' },
    { id: 'sms-scanner', label: 'SMS Smishing Scan', icon: MessageSquare, category: 'DETECTORS' },
    { id: 'website-scanner', label: 'Website URL Scan', icon: Globe, category: 'DETECTORS' },
    { id: 'local-ai-classifier', label: 'Browser AI Classifier', icon: Cpu, category: 'DETECTORS' },
    { id: 'screenshot-analyzer', label: 'Screenshot Vision', icon: Eye, category: 'DETECTORS' },
    { id: 'qr-scanner', label: 'Quishing QR Scan', icon: QrCode, category: 'DETECTORS' },
    { id: 'ai-results', label: 'Local AI Explainer', icon: Sparkles, category: 'SYSTEM' },
    { id: 'scan-history', label: 'Detection Logs', icon: History, category: 'SYSTEM' },
    { id: 'analytics', label: 'Threat Intelligence', icon: BarChart3, category: 'SYSTEM' },
    { id: 'settings', label: 'Engine Config', icon: Settings2, category: 'SYSTEM' },
  ];

  const handleNav = (id: string) => {
    setCurrentPage(id);
    setIsOpen(false);
    // Smooth scroll to top when changing page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Group items by category
  const categories = ['CORE', 'DETECTORS', 'SYSTEM'];

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-950/60 backdrop-blur-xl border-b border-white/5 px-4 flex items-center justify-between z-40">
        <div className="flex items-center gap-2" onClick={() => handleNav('landing')}>
          <Shield className="w-6 h-6 text-cyan-400" />
          <span className="font-display font-bold text-white text-md tracking-wider">
            PRIVACY<span className="text-cyan-400">LENS</span>
          </span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          id="mobile-menu-toggle"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed top-16 bottom-0 left-0 w-64 glass-panel border-r border-white/5 flex flex-col z-30 transition-transform duration-300 lg:top-0 lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Desktop Brand Header */}
        <div className="hidden lg:flex items-center gap-2.5 px-6 py-6 border-b border-white/5">
          <div className="relative p-1.5 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-lg border border-white/10">
            <Shield className="w-6 h-6 text-cyan-400" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-cyber-dark animate-ping"></span>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-white text-lg tracking-wider leading-none">
              PRIVACY<span className="text-cyan-400">LENS</span>
            </span>
            <span className="text-[9px] font-mono text-cyan-400/80 tracking-widest mt-1">
              OFFLINE AI SHIELD
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {categories.map(cat => (
            <div key={cat} className="space-y-1">
              <span className="px-3 text-[10px] font-mono text-gray-500 font-semibold tracking-widest block mb-2">
                {cat}
              </span>
              <ul className="space-y-1">
                {menuItems
                  .filter(item => item.category === cat)
                  .map(item => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => handleNav(item.id)}
                          className={`
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group relative overflow-hidden
                            ${isActive 
                              ? 'bg-gradient-to-r from-cyan-950/40 to-blue-950/20 text-white border border-cyan-500/20 shadow-[inset_0_1px_12px_rgba(6,182,212,0.15)]' 
                              : 'text-gray-400 hover:text-white hover:bg-white/3 border border-transparent'}
                          `}
                        >
                          <Icon className={`w-4 h-4 transition-colors duration-200 ${isActive ? 'text-cyan-400' : 'text-gray-400 group-hover:text-cyan-300'}`} />
                          <span className="font-sans font-medium tracking-wide">
                            {item.label}
                          </span>
                          
                          {/* Active Neon Accent Left Bar */}
                          {isActive && (
                            <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-gradient-to-b from-cyan-400 to-blue-500 rounded-r-md"></span>
                          )}
                        </button>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer Info */}
        <div className="p-4 border-t border-white/5 bg-slate-950/20 space-y-2.5">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-cyber-pulse" />
            <span className="text-[10px] font-mono text-gray-400 tracking-wider">
              Local Model Core
            </span>
          </div>
          <div className="bg-slate-950/40 rounded-md border border-white/5 p-2 text-[10px] font-mono flex items-center justify-between">
            <span className="text-gray-500">Status:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-pulse"></span>
              SECURE
            </span>
          </div>
          <div className="text-[9px] font-mono text-gray-500 text-center">
            Zero Telemetry. On-Device AI.
          </div>
        </div>
      </aside>
    </>
  );
}
