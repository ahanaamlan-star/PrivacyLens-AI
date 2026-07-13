/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  History, 
  Search, 
  Trash2, 
  ShieldCheck, 
  ShieldAlert, 
  FileWarning, 
  ArrowRight,
  Filter,
  CheckCircle,
  XCircle,
  Database
} from 'lucide-react';
import { HistoryItem, ScanType, ThreatLevel } from '../types';

interface ScanHistoryProps {
  history: HistoryItem[];
  onClearHistory: () => void;
  onSelectHistoryItem: (item: HistoryItem) => void;
}

export default function ScanHistory({ history, onClearHistory, onSelectHistoryItem }: ScanHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [threatFilter, setThreatFilter] = useState<'all' | ThreatLevel>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | ScanType>('all');

  // Filter logic
  const filteredHistory = history.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.target.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesThreat = threatFilter === 'all' || item.threatLevel === threatFilter;
    const matchesType = typeFilter === 'all' || item.type === typeFilter;

    return matchesSearch && matchesThreat && matchesType;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 lg:px-8 py-6 text-gray-200">
      
      {/* 1. Header Filter Row */}
      <div className="glass-panel rounded-2xl border border-cyan-500/10 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search logs by sender, target, or domain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-cyber-dark/80 border border-cyan-500/15 focus:border-cyan-400 rounded-xl text-xs text-gray-200 outline-none transition-all font-sans"
          />
        </div>

        {/* Filters Selectors */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Threat Filter */}
          <div className="flex items-center gap-1.5 bg-cyber-deep/60 px-2.5 py-1.5 rounded-lg border border-cyan-500/10 text-xs">
            <Filter className="w-3.5 h-3.5 text-gray-500" />
            <select
              value={threatFilter}
              onChange={(e) => setThreatFilter(e.target.value as any)}
              className="bg-transparent text-gray-300 outline-none border-none font-mono text-[11px] cursor-pointer"
            >
              <option value="all">All Verdicts</option>
              <option value="safe" className="bg-cyber-dark">Safe only</option>
              <option value="suspicious" className="bg-cyber-dark">Suspicious only</option>
              <option value="malicious" className="bg-cyber-dark">Malicious only</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 bg-cyber-deep/60 px-2.5 py-1.5 rounded-lg border border-cyan-500/10 text-xs">
            <Database className="w-3.5 h-3.5 text-gray-500" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="bg-transparent text-gray-300 outline-none border-none font-mono text-[11px] cursor-pointer"
            >
              <option value="all">All Scanners</option>
              <option value="email" className="bg-cyber-dark">Email Scans</option>
              <option value="sms" className="bg-cyber-dark">SMS Scans</option>
              <option value="website" className="bg-cyber-dark">Website Scans</option>
              <option value="screenshot" className="bg-cyber-dark">Screenshot Scans</option>
              <option value="qr" className="bg-cyber-dark">QR Scans</option>
            </select>
          </div>

          {/* Clear Logs */}
          <button
            onClick={onClearHistory}
            disabled={history.length === 0}
            className="px-3.5 py-2 bg-rose-950/15 hover:bg-rose-950/30 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-mono transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            id="clear-logs-btn"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Logs</span>
          </button>

        </div>

      </div>

      {/* 2. Log database Table/List */}
      <div className="glass-panel rounded-2xl border border-cyan-500/10 p-6">
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/10 mb-4 text-xs font-mono">
          <div className="flex items-center gap-2 text-cyan-400">
            <History className="w-4 h-4" />
            <span>SANDBOX INCIDENT DATABASE JOURNAL ({filteredHistory.length} ENTRIES)</span>
          </div>
          <span className="text-gray-500">Stored Locally (AES Client Cache)</span>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="py-24 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
            <div className="p-4 bg-cyber-dark/40 border border-cyan-500/10 rounded-full">
              <History className="w-10 h-10 text-gray-700 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h4 className="font-display font-semibold text-white text-md">No Audit Logs Match</h4>
              <p className="text-xs text-gray-600 max-w-sm leading-relaxed mx-auto">
                No local transaction files match your active filters. Try resetting the filters or executing a fresh scan sandbox run.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredHistory.map((item) => {
              let badgeColor = 'bg-emerald-950/20 text-emerald-400 border-emerald-500/20';
              if (item.threatLevel === 'malicious') {
                badgeColor = 'bg-rose-950/20 text-rose-400 border-rose-500/20 animate-cyber-pulse';
              } else if (item.threatLevel === 'suspicious') {
                badgeColor = 'bg-amber-950/20 text-amber-400 border-amber-500/20';
              }

              return (
                <div 
                  key={item.id}
                  className="p-4 bg-cyber-deep/30 rounded-xl border border-cyan-500/5 hover:border-cyan-500/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    {/* Verdict Icon */}
                    <div className="mt-1">
                      {item.threatLevel === 'malicious' ? (
                        <ShieldAlert className="w-5 h-5 text-rose-400" />
                      ) : item.threatLevel === 'suspicious' ? (
                        <FileWarning className="w-5 h-5 text-amber-400" />
                      ) : (
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      )}
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-display font-bold text-sm text-white truncate">{item.title}</span>
                        <span className="text-[9px] font-mono px-2 py-0.5 bg-cyan-950/30 border border-cyan-500/15 rounded text-cyan-400 uppercase tracking-widest shrink-0">
                          {item.type}
                        </span>
                      </div>
                      
                      <p className="text-xs text-gray-400 font-mono truncate max-w-xl pr-4">
                        {item.target}
                      </p>

                      <div className="flex items-center gap-2 text-[10px] text-gray-500 pt-1 font-mono">
                        <span>TIMESTAMP: {new Date(item.timestamp).toLocaleString()}</span>
                        <span>•</span>
                        <span>ID: {item.id.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-cyan-500/5 pt-3.5 sm:pt-0 shrink-0">
                    <div className="text-left sm:text-right">
                      <span className={`text-md font-display font-bold ${
                        item.threatLevel === 'malicious' ? 'text-rose-400' : item.threatLevel === 'suspicious' ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {item.riskScore}%
                      </span>
                      <span className="text-[9px] font-mono text-gray-500 block uppercase">Risk Factor</span>
                    </div>

                    <span className={`text-[10px] font-mono px-2.5 py-1 rounded border uppercase tracking-wider ${badgeColor}`}>
                      {item.threatLevel}
                    </span>

                    {/* View/Analyze Explainer Button */}
                    <button
                      onClick={() => onSelectHistoryItem(item)}
                      title="Load scan context into local Explainer tool"
                      className="p-2 bg-cyber-deep/60 hover:bg-cyan-950/40 text-cyan-400 hover:text-cyan-300 border border-cyan-500/15 rounded-lg transition-colors cursor-pointer"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}
