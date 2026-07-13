/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import AnimatedBackground from './components/AnimatedBackground';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Landing from './views/Landing';
import Dashboard from './views/Dashboard';
import EmailScanner from './views/EmailScanner';
import SmsScanner from './views/SmsScanner';
import WebsiteScanner from './views/WebsiteScanner';
import LocalAiClassifier from './views/LocalAiClassifier';
import ScreenshotAnalyzer from './views/ScreenshotAnalyzer';
import QrScanner from './views/QrScanner';
import AiResults from './views/AiResults';
import ScanHistory from './views/ScanHistory';
import Analytics from './views/Analytics';
import Settings from './views/Settings';
import { ScanResult, ScannerSettings, HistoryItem } from './types';

// Preset sample incidents so the application is beautifully seeded on the first boot
const DEFAULT_INCIDENTS: HistoryItem[] = [
  {
    id: 'scan-eml-8s7d1b',
    type: 'email',
    title: 'Account Suspended - Action Required Immediately',
    target: 'netflix-support@update-verification.xyz',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    threatLevel: 'malicious',
    riskScore: 85
  },
  {
    id: 'scan-sms-9s3f4g',
    type: 'sms',
    title: 'SMS from USPS-Alerts',
    target: 'USPS-Alerts',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
    threatLevel: 'malicious',
    riskScore: 90
  },
  {
    id: 'scan-web-4k2h5l',
    type: 'website',
    title: 'URL Scanner: github.com',
    target: 'https://github.com/google/ai-studio',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
    threatLevel: 'safe',
    riskScore: 10
  },
  {
    id: 'scan-qr-2b8n1m',
    type: 'qr',
    title: 'QR Action: WIFI automatic credentials trigger',
    target: 'WIFI:S:HotelGuest_Secure;P:88239120;;',
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(), // 2 days ago
    threatLevel: 'suspicious',
    riskScore: 45
  }
];

const DEFAULT_SETTINGS: ScannerSettings = {
  sensitivity: 'recommended',
  enableHeuristics: true,
  enableDeepLinkDecoding: true,
  enableVisualSpoofingDetection: true,
  offlineDatabaseVersion: 'v2026.07.12',
  autoPurgeDays: 30,
  alertOnMaliciousQr: true
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [settings, setSettings] = useState<ScannerSettings>(DEFAULT_SETTINGS);
  const [latestResult, setLatestResult] = useState<ScanResult | null>(null);

  // PWA and Offline Network States
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState<boolean>(false);

  // Monitor Network connection state and capture PWA installation prompts
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if the application is already launched in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (navigator as any).standalone === true;
    if (isStandalone) {
      setIsPwaInstalled(true);
    }

    // Listener for successful PWA installation
    const handleAppInstalled = () => {
      setIsPwaInstalled(true);
      setDeferredPrompt(null);
      console.log('[PWA] PrivacyLens AI was installed successfully!');
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Trigger browser-level PWA Installation workflow
  const handleInstallPwa = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] Install choice outcome: ${outcome}`);
    if (outcome === 'accepted') {
      setIsPwaInstalled(true);
      setDeferredPrompt(null);
    }
  };

  // Load states on mount
  useEffect(() => {
    const cachedHistory = localStorage.getItem('privacylens_history');
    if (cachedHistory) {
      setHistory(JSON.parse(cachedHistory));
    } else {
      // Seed default sandbox data for demonstration
      localStorage.setItem('privacylens_history', JSON.stringify(DEFAULT_INCIDENTS));
      setHistory(DEFAULT_INCIDENTS);
    }

    const cachedSettings = localStorage.getItem('privacylens_settings');
    if (cachedSettings) {
      setSettings(JSON.parse(cachedSettings));
    }
  }, []);

  // Save updates helper
  const updateHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    localStorage.setItem('privacylens_history', JSON.stringify(newHistory));
  };

  // 1. Add a new on-device scan result
  const handleScanCompleted = (result: ScanResult) => {
    setLatestResult(result);
    
    // Convert full scan result to lightweight history tracker
    const newHistoryItem: HistoryItem = {
      id: result.id,
      type: result.type,
      title: result.title,
      target: result.target,
      timestamp: result.timestamp,
      threatLevel: result.threatLevel,
      riskScore: result.riskScore
    };

    const updated = [newHistoryItem, ...history];
    updateHistory(updated);
  };

  // 2. Select a scan from log list to explore
  const handleSelectHistoryItem = (item: HistoryItem) => {
    // Reconstruct a simple temporary ScanResult to explore inside Explainer view
    const mockFullResult: ScanResult = {
      id: item.id,
      type: item.type,
      title: item.title,
      target: item.target,
      timestamp: item.timestamp,
      riskScore: item.riskScore,
      threatLevel: item.threatLevel,
      findings: [
        {
          id: 'reconstructed-finding',
          category: 'metadata',
          severity: item.threatLevel === 'malicious' ? 'high' : item.threatLevel === 'suspicious' ? 'medium' : 'info',
          title: `Reconstructed Log File`,
          description: `This transaction log was recovered from local database storage. Re-run scan inside the specific tool to run deep real-time heuristics again.`
        }
      ],
      remedies: [
        item.threatLevel === 'malicious' 
          ? 'Maintain safety checks. Do NOT submit accounts or credentials.' 
          : 'Clean record. Standard vigilance is recommended.'
      ],
      meta: {
        scanTimeMs: 12,
        modelUsed: 'PrivacyLens Local-DB v2.4',
        rulesEvaluated: 14
      }
    };

    setLatestResult(mockFullResult);
    setCurrentPage('ai-results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 3. Clear/Reset History logs
  const handleClearHistory = () => {
    if (confirm('Are you sure you want to purge all local scanner logs? This cannot be undone.')) {
      updateHistory([]);
      setLatestResult(null);
    }
  };

  // 4. Update Engine Configuration
  const handleUpdateSettings = (newSettings: Partial<ScannerSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('privacylens_settings', JSON.stringify(updated));
  };

  // 5. Restore presets (Global Sandbox reset)
  const handleResetSandbox = () => {
    localStorage.setItem('privacylens_history', JSON.stringify(DEFAULT_INCIDENTS));
    setHistory(DEFAULT_INCIDENTS);
    setLatestResult(null);
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem('privacylens_settings', JSON.stringify(DEFAULT_SETTINGS));
    alert('Local sandbox database reverted to default secure profiles.');
  };

  // Calculation parameters for Dashboard and Header
  const totalScans = history.length;
  const threatsDetected = history.filter(item => item.threatLevel === 'malicious').length;
  const safeScans = history.filter(item => item.threatLevel === 'safe').length;

  // Aggregate current risk level based on last 5 entries average risk score
  const recentHistory = history.slice(0, 5);
  const avgRisk = recentHistory.length === 0 
    ? 15 
    : Math.round(recentHistory.reduce((sum, item) => sum + item.riskScore, 0) / recentHistory.length);

  // Dynamic View Switch Router
  const renderCurrentView = () => {
    switch (currentPage) {
      case 'landing':
        return <Landing onEnterApp={() => setCurrentPage('dashboard')} />;
      case 'dashboard':
        return (
          <Dashboard
            totalScans={totalScans}
            threatsDetected={threatsDetected}
            safeScans={safeScans}
            riskScore={avgRisk}
            recentScans={history}
            sensitivity={settings.sensitivity}
            onNavigate={(page) => setCurrentPage(page)}
          />
        );
      case 'email-scanner':
        return (
          <EmailScanner
            onScanCompleted={handleScanCompleted}
            onNavigateToExplainer={() => setCurrentPage('ai-results')}
          />
        );
      case 'sms-scanner':
        return (
          <SmsScanner
            onScanCompleted={handleScanCompleted}
            onNavigateToExplainer={() => setCurrentPage('ai-results')}
          />
        );
      case 'website-scanner':
        return (
          <WebsiteScanner
            onScanCompleted={handleScanCompleted}
            onNavigateToExplainer={() => setCurrentPage('ai-results')}
          />
        );
      case 'local-ai-classifier':
        return (
          <LocalAiClassifier
            onScanCompleted={handleScanCompleted}
            onNavigateToExplainer={() => setCurrentPage('ai-results')}
          />
        );
      case 'screenshot-analyzer':
        return (
          <ScreenshotAnalyzer
            onScanCompleted={handleScanCompleted}
            onNavigateToExplainer={() => setCurrentPage('ai-results')}
          />
        );
      case 'qr-scanner':
        return (
          <QrScanner
            onScanCompleted={handleScanCompleted}
            onNavigateToExplainer={() => setCurrentPage('ai-results')}
          />
        );
      case 'ai-results':
        return <AiResults latestResult={latestResult} />;
      case 'scan-history':
        return (
          <ScanHistory
            history={history}
            onClearHistory={handleClearHistory}
            onSelectHistoryItem={handleSelectHistoryItem}
          />
        );
      case 'analytics':
        return (
          <Analytics
            history={history}
            totalScans={totalScans}
            threatsDetected={threatsDetected}
          />
        );
      case 'settings':
        return (
          <Settings
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onClearCache={handleClearHistory}
            isOnline={isOnline}
            pwaInstallable={!!deferredPrompt}
            isPwaInstalled={isPwaInstalled}
            onInstallPwa={handleInstallPwa}
          />
        );
      default:
        return <Landing onEnterApp={() => setCurrentPage('dashboard')} />;
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col font-sans selection:bg-cyan-500/30 selection:text-white">
      
      {/* Absolute floating matrix gradient backgrounds */}
      <AnimatedBackground />

      {/* Main Framework Wrap layout */}
      <div className="flex-1 flex flex-col lg:flex-row">
        
        {/* Persistent Cyber sidebar */}
        <Sidebar 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          offlineStatus={true}
        />

        {/* Dynamic Workspace container */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Top header navigation contextual info bar */}
          <Header
            currentPage={currentPage}
            totalScans={totalScans}
            threatsDetected={threatsDetected}
            onResetData={handleResetSandbox}
            isOnline={isOnline}
            pwaInstallable={!!deferredPrompt}
            onInstallPwa={handleInstallPwa}
          />

          {/* Active Workspace Viewport */}
          <div className="flex-1 pb-12">
            {renderCurrentView()}
          </div>
        </div>

      </div>

    </div>
  );
}
