/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ScanType = 'email' | 'sms' | 'website' | 'screenshot' | 'qr';

export type ThreatLevel = 'safe' | 'suspicious' | 'malicious';

export interface ScanFinding {
  id: string;
  category: 'header' | 'sender' | 'content' | 'link' | 'metadata' | 'malicious_pattern' | 'visual_spoofing';
  severity: 'info' | 'low' | 'medium' | 'high';
  title: string;
  description: string;
  location?: string; // e.g. "Line 3", "Domain suffix", "Bounding Box"
}

export interface ScanResult {
  id: string;
  type: ScanType;
  title: string;
  target: string; // The email body, phone number, URL, etc.
  timestamp: string;
  riskScore: number; // 0 to 100
  threatLevel: ThreatLevel;
  findings: ScanFinding[];
  remedies: string[];
  meta: {
    scanTimeMs: number;
    modelUsed: string;
    rulesEvaluated: number;
    entropy?: number;
    sslVerified?: boolean;
    domainAge?: string;
  };
}

export interface SecurityScorecard {
  overallScore: number;
  totalScans: number;
  threatsBlocked: number;
  safeScans: number;
  scansByDay: { day: string; count: number; threats: number }[];
  scansByType: Record<ScanType, { total: number; threats: number }>;
}

export interface ScannerSettings {
  sensitivity: 'low' | 'recommended' | 'paranoid';
  enableHeuristics: boolean;
  enableDeepLinkDecoding: boolean;
  enableVisualSpoofingDetection: boolean;
  offlineDatabaseVersion: string;
  autoPurgeDays: number;
  alertOnMaliciousQr: boolean;
}

export interface HistoryItem {
  id: string;
  type: ScanType;
  title: string;
  target: string;
  timestamp: string;
  threatLevel: ThreatLevel;
  riskScore: number;
}
