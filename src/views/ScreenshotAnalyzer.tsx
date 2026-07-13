/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, DragEvent, ChangeEvent, useEffect } from 'react';
import { 
  Eye, 
  Sparkles, 
  Terminal, 
  ShieldCheck, 
  ShieldAlert, 
  FileWarning, 
  UploadCloud, 
  Layers,
  ChevronRight,
  Info,
  Lock,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Trash2,
  Cpu,
  Globe,
  Mail,
  MessageSquare,
  CreditCard,
  ShoppingBag,
  Clock,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ScanResult, ThreatLevel, ScanFinding } from '../types';

interface ScreenshotAnalyzerProps {
  onScanCompleted: (result: ScanResult) => void;
  onNavigateToExplainer: () => void;
}

interface OCRBox {
  id: string;
  x: number; // Percentage coordinate from left (0 - 100)
  y: number; // Percentage coordinate from top (0 - 100)
  width: number;
  height: number;
  text: string;
  label: string;
  severity: 'info' | 'low' | 'medium' | 'high';
  description: string;
}

// Predefined Scenario Cases matching the 5 required categories
const SCREENSHOT_PRESETS = [
  {
    id: 'banking',
    label: '🏦 Banking Website Spoof',
    imageName: 'chase-online-secure-validation.png',
    title: 'Chase Bank Verification Spoof',
    category: 'banking',
    ocrText: 'Chase Online Security Center.\n\nIrregular activity detected. For your security, your account access has been temporarily restricted.\n\nTo re-activate card and billing services immediately, please verify your credentials, login passcode, and debit card PIN on our encrypted node within 24 hours.\n\nVerify billing now: http://verification-chase-online-ssl.xyz/signin',
    riskScore: 88,
    confidenceScore: 94,
    boxes: [
      {
        id: 'b1',
        x: 8, y: 12, width: 84, height: 12,
        text: 'Chase Online Security Center',
        label: 'Fake Branding',
        severity: 'medium' as const,
        description: 'Impersonates official Chase brand identifiers. Designed to deceive victims into trusting the host environment.'
      },
      {
        id: 'b2',
        x: 10, y: 32, width: 80, height: 16,
        text: 'Access restricted. Verify card within 24 hours.',
        label: 'Urgency Language',
        severity: 'high' as const,
        description: 'Coercive urgency pressure meant to provoke impulsive action and bypass security validation.'
      },
      {
        id: 'b3',
        x: 15, y: 55, width: 70, height: 18,
        text: 'Verify credentials, login passcode, and card PIN',
        label: 'Credential Harvesting',
        severity: 'high' as const,
        description: 'Requests highly sensitive security answers, passwords, and ATM PIN codes.'
      },
      {
        id: 'b4',
        x: 12, y: 80, width: 76, height: 12,
        text: 'http://verification-chase-online-ssl.xyz',
        label: 'Suspicious URL',
        severity: 'high' as const,
        description: 'Low-reputation .xyz domain matching brand typosquatting profiles.'
      }
    ]
  },
  {
    id: 'shopping',
    label: '🛍️ Shopping Reward Fraud',
    imageName: 'amazon-unlocked-rewards-claim.png',
    title: 'Amazon Unlocked Voucher Lure',
    category: 'shopping',
    ocrText: 'Amazon Unlocked Customer Rewards Portal.\n\nCongratulations! Your shopping profile won a $1,000 Amazon Promo Gift Card voucher.\n\nClaim immediately before promotional token expires: http://amazon-rewards-claim.club\n\nTo release, please confirm credit card number, expiration, and CVV for a $1.00 delivery verification fee.',
    riskScore: 91,
    confidenceScore: 95,
    boxes: [
      {
        id: 's1',
        x: 5, y: 10, width: 90, height: 14,
        text: 'Amazon Unlocked Customer Rewards',
        label: 'Fake Branding',
        severity: 'high' as const,
        description: 'Deceptive use of corporate trademark in unverified or low-cost domain environments.'
      },
      {
        id: 's2',
        x: 10, y: 30, width: 80, height: 15,
        text: 'Congratulations! Won a $1,000 Amazon Promo Gift Card',
        label: 'Payment Fraud Indicator',
        severity: 'high' as const,
        description: 'High-value financial incentive or reward scheme designed to lower skepticism.'
      },
      {
        id: 's3',
        x: 15, y: 50, width: 70, height: 15,
        text: 'Claim immediately before expires',
        label: 'Urgency Language',
        severity: 'medium' as const,
        description: 'Forced timer designed to prompt immediate user click-through.'
      },
      {
        id: 's4',
        x: 12, y: 72, width: 76, height: 18,
        text: 'Credit card details for a $1.00 verification fee',
        label: 'Credential Harvesting / Card Fraud',
        severity: 'high' as const,
        description: 'Demands credit card credentials, billing, and CVV under the guise of an insignificant fee.'
      }
    ]
  },
  {
    id: 'login',
    label: '🔐 Login Page Harvester',
    imageName: 'paypal-security-compliance-login.png',
    title: 'PayPal Authentication Harvest',
    category: 'login',
    ocrText: 'PayPal Security & Compliance Center.\n\nUnauthorized login detected from IP block. Verification Required.\n\nPlease log in below. Confirm your Username, Passcode, and secondary Card Number to fully unlock account funds.\n\nSubmit: http://paypal-login-assistance.com.top/secure',
    riskScore: 89,
    confidenceScore: 92,
    boxes: [
      {
        id: 'l1',
        x: 8, y: 15, width: 84, height: 12,
        text: 'PayPal Security & Compliance',
        label: 'Fake Branding',
        severity: 'medium' as const,
        description: 'Impersonates official sign-on centers to harvest critical digital wallet credentials.'
      },
      {
        id: 'l2',
        x: 12, y: 35, width: 76, height: 20,
        text: 'Enter Username, Passcode, and Card Number',
        label: 'Credential Harvesting',
        severity: 'high' as const,
        description: 'Aggressively aggregates access passwords, credit cards, and sensitive identifiers.'
      },
      {
        id: 'l3',
        x: 10, y: 62, width: 80, height: 12,
        text: 'Unauthorized login. Verification Required.',
        label: 'Urgency Language',
        severity: 'medium' as const,
        description: 'Triggers alarm regarding personal account security and immediate lockups.'
      },
      {
        id: 'l4',
        x: 15, y: 80, width: 70, height: 12,
        text: 'http://paypal-login-assistance.com.top',
        label: 'Suspicious URL',
        severity: 'high' as const,
        description: 'Uses nested brand directories and low-reputation top-level-domain suffixes (.top).'
      }
    ]
  },
  {
    id: 'email',
    label: '📧 Phishing Email Alert',
    imageName: 'netflix-overdue-subscription-invoice.png',
    title: 'Netflix Overdue Payment Phish',
    category: 'email',
    ocrText: 'Subject: Urgent: Your Netflix subscription renewal billing failed!\n\nHi Netflix User, we were unable to process your monthly membership transaction. To avoid immediate disruption to your video services, please renew your Credit Card profile details immediately.\n\nUpdate billing online: http://netflix-billing-update-site.info/secure-portal',
    riskScore: 84,
    confidenceScore: 89,
    boxes: [
      {
        id: 'e1',
        x: 10, y: 10, width: 80, height: 12,
        text: 'Subject: Urgent: billing failed!',
        label: 'Payment Fraud Indicator',
        severity: 'medium' as const,
        description: 'Abnormal claim of billing failure. Standard method to force payment submission.'
      },
      {
        id: 'e2',
        x: 15, y: 30, width: 70, height: 14,
        text: 'Hi Netflix User',
        label: 'Unpersonalized Greeting',
        severity: 'low' as const,
        description: 'Uses a generic customer tag rather than your real registered name. Typical of broad spam.'
      },
      {
        id: 'e3',
        x: 12, y: 52, width: 76, height: 18,
        text: 'Avoid immediate disruption, update Credit Card info',
        label: 'Urgency Language',
        severity: 'high' as const,
        description: 'Creates anxiety about service cancellation to grab card digits before verification.'
      },
      {
        id: 'e4',
        x: 15, y: 78, width: 70, height: 12,
        text: 'http://netflix-billing-update-site.info',
        label: 'Suspicious URL',
        severity: 'high' as const,
        description: 'Low-reputation .info extension unassociated with Netflix official corporate properties.'
      }
    ]
  },
  {
    id: 'message',
    label: '💬 Urgent Smishing Text',
    imageName: 'usps-failed-package-redelivery-request.png',
    title: 'USPS Package Address Fraud',
    category: 'message',
    ocrText: 'USPS Notification: Your regional shipment was suspended and put on hold due to wrong address info. Redelivery requires a $1.50 processing fee.\n\nPlease verify billing card and address now: http://usps-address-correct.top',
    riskScore: 95,
    confidenceScore: 98,
    boxes: [
      {
        id: 'm1',
        x: 8, y: 15, width: 84, height: 12,
        text: 'USPS Notification: Shipment suspended on hold',
        label: 'Fake Branding',
        severity: 'high' as const,
        description: 'Impersonates national postal networks to capture a high volume of tracking clicks.'
      },
      {
        id: 'm2',
        x: 12, y: 35, width: 76, height: 15,
        text: '$1.50 redelivery processing fee',
        label: 'Payment Fraud Indicator',
        severity: 'high' as const,
        description: 'Lures victims with tiny, harmless fees to trigger authorization of credit card credentials.'
      },
      {
        id: 'm3',
        x: 15, y: 55, width: 70, height: 15,
        text: 'Verify billing card and address now',
        label: 'Credential Harvesting',
        severity: 'high' as const,
        description: 'Attempts to harvest full billing addresses, names, and visual card credentials.'
      },
      {
        id: 'm4',
        x: 10, y: 76, width: 80, height: 14,
        text: 'http://usps-address-correct.top',
        label: 'Suspicious URL',
        severity: 'high' as const,
        description: 'Unsecured top-level-domain (.top) designed for mass automated deployment.'
      }
    ]
  }
];

export default function ScreenshotAnalyzer({ onScanCompleted, onNavigateToExplainer }: ScreenshotAnalyzerProps) {
  const [selectedCaseId, setSelectedCaseId] = useState<string>('banking');
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeBoxId, setActiveBoxId] = useState<string | null>(null);
  
  // Custom uploaded file states
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [customCategory, setCustomCategory] = useState<'banking' | 'shopping' | 'login' | 'email' | 'message'>('banking');
  const [customOcrText, setCustomOcrText] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);

  // Results state
  const [scanResult, setScanResult] = useState<{
    riskScore: number;
    confidenceScore: number;
    threatLevel: ThreatLevel;
    boxes: OCRBox[];
    findingsList: { label: string; text: string; severity: string; description: string }[];
    remedies: string[];
    title: string;
    ocrText: string;
    category: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Run the analysis heuristics either on presets or on custom inputs
  const analyzeHeuristics = (ocrContent: string, currentCategory: string, titleName: string) => {
    const textLower = ocrContent.toLowerCase();
    const findingsList: { label: string; text: string; severity: string; description: string }[] = [];
    let riskScore = 15;

    // Detect Fake Branding
    const brands = [
      { name: 'Chase Bank', keys: ['chase', 'wells fargo', 'bofa', 'bank of america'] },
      { name: 'Amazon', keys: ['amazon'] },
      { name: 'PayPal', keys: ['paypal', 'venmo'] },
      { name: 'Netflix', keys: ['netflix', 'netf1ix'] },
      { name: 'USPS', keys: ['usps', 'ups', 'fedex', 'post office'] },
      { name: 'Apple', keys: ['apple', 'icloud'] },
      { name: 'Google', keys: ['google', 'gmail'] }
    ];

    let brandMatch = brands.find(b => b.keys.some(k => textLower.includes(k)));
    if (brandMatch) {
      findingsList.push({
        label: 'Fake Branding',
        text: `Brand Mention: "${brandMatch.name}"`,
        severity: 'medium',
        description: `Visual reference to trademarked brand "${brandMatch.name}" on an unverified domain is highly characteristic of phishing replicas.`
      });
      riskScore += 25;
    }

    // Detect Credential Harvesting
    const credentialKeywords = [
      { key: 'password', word: 'passcode / password', desc: 'Requests personal passwords to hijack digital accounts.' },
      { key: 'pin', word: 'card pin', desc: 'Requests financial ATM debit security pins.' },
      { key: 'ssn', word: 'social security number', desc: 'Harvests tax identifiers to commit identity theft.' },
      { key: 'username', word: 'login profile', desc: 'Requests account authentication IDs.' },
      { key: 'credentials', word: 'verification credentials', desc: 'Deters users into yielding active credentials.' },
      { key: 'mother\'s maiden', word: 'mother\'s maiden name', desc: 'Demands personal security recovery answers.' },
      { key: 're-enter', word: 're-enter login parameters', desc: 'Forces credentials verification.' }
    ];

    const foundCreds = credentialKeywords.filter(c => textLower.includes(c.key));
    if (foundCreds.length > 0) {
      findingsList.push({
        label: 'Credential Harvesting',
        text: `Harvest Key: "${foundCreds[0].word}"`,
        severity: 'high',
        description: `Requests highly sensitive credentials directly from a text layout. Real institutions never gather verification codes or passwords via generic alerts.`
      });
      riskScore += Math.min(35, foundCreds.length * 15);
    }

    // Detect Suspicious URLs
    const suspiciousUrls = [
      { key: '.xyz', label: '.xyz automated TLD', desc: 'Cheap, newly registered domain extensions commonly deployed in mass spams.' },
      { key: '.top', label: '.top automated TLD', desc: 'Frequently associated with phishing kits and automated redirect scripts.' },
      { key: '.club', label: '.club automated TLD', desc: 'Unusual, low-trust domain extension for corporate financial institutions.' },
      { key: '.info', label: '.info automated TLD', desc: 'Domain extension often utilized for deceptive support relays.' },
      { key: 'http://', label: 'Unsecured http:// protocol', desc: 'Sends data in unencrypted plain text, highly vulnerable to interception.' }
    ];

    const foundUrls = suspiciousUrls.filter(u => textLower.includes(u.key));
    if (foundUrls.length > 0) {
      findingsList.push({
        label: 'Suspicious URL',
        text: `URL Pattern: "${foundUrls[0].label}"`,
        severity: 'high',
        description: `Found unsecure protocols or low-reputation automated extensions unassociated with verified official corporate properties.`
      });
      riskScore += Math.min(30, foundUrls.length * 15);
    }

    // Detect Urgency Language
    const urgencyKeywords = [
      { key: 'immediately', label: 'Stress cues (immediately)', desc: 'Preassures the reader to prevent careful offline evaluation.' },
      { key: 'within 24 hours', label: 'Tight time-limit (24h)', desc: 'Urges action to bypass verification stages.' },
      { key: 'suspended', label: 'Suspension threat', desc: 'Threatens service cancellations to provoke immediate reaction.' },
      { key: 'locked', label: 'Lockup coercion', desc: 'Asserts access restrictions to grab bank login credentials.' },
      { key: 'failed', label: 'Billing transaction failure', desc: 'Claims overdue balances to coerce immediate payment updates.' },
      { key: 'expires', label: 'Short offer expiration', desc: 'Fakes countdown timers to promote fast click-throughs.' }
    ];

    const foundUrgency = urgencyKeywords.filter(u => textLower.includes(u.key));
    if (foundUrgency.length > 0) {
      findingsList.push({
        label: 'Urgency Language',
        text: `Pressure phrase: "${foundUrgency[0].label}"`,
        severity: 'medium',
        description: `High-pressure threats of account suspensions or reward expiration designed to force immediate submission.`
      });
      riskScore += Math.min(25, foundUrgency.length * 8);
    }

    // Detect Payment Fraud Indicators
    const fraudKeywords = [
      { key: 'processing fee', label: 'processing/redelivery fee', desc: 'Charges a nominal fee to capture card authentication codes.' },
      { key: 'delivery fee', label: 'nominal delivery fee', desc: 'Forces unsecure card entry under trivial pretexts.' },
      { key: 'credit card', label: 'card digits harvest', desc: 'Demands credit/debit card numbers directly on unverified pages.' },
      { key: 'cvv', label: 'card CVV code', desc: 'Harvests card CVV security codes to perform unauthorized charges.' },
      { key: 'won a', label: 'sweepstakes reward claim', desc: 'Fake visual reward trap used as financial baits.' },
      { key: 'btc', label: 'crypto reward', desc: 'Wallet-drainer smart contracts dangled as high-value rewards.' }
    ];

    const foundFraud = fraudKeywords.filter(f => textLower.includes(f.key));
    if (foundFraud.length > 0) {
      findingsList.push({
        label: 'Payment Fraud Indicator',
        text: `Financial hook: "${foundFraud[0].label}"`,
        severity: 'high',
        description: `Demands financial processing payments, credit card CVV details, or cryptocurrency transactions associated with reward schemes.`
      });
      riskScore += Math.min(35, foundFraud.length * 15);
    }

    // Score capping
    riskScore = Math.max(5, Math.min(100, riskScore));

    let threatLevel: ThreatLevel = 'safe';
    if (riskScore >= 70) threatLevel = 'malicious';
    else if (riskScore >= 30) threatLevel = 'suspicious';

    const confidenceScore = Math.round(Math.min(99.6, 70 + (findingsList.length * 6) + (riskScore * 0.15)));

    // Generate Bounding Boxes dynamically for visual canvas
    const boxes: OCRBox[] = findingsList.map((f, idx) => {
      const yCoords = [15, 38, 60, 78];
      const xCoords = [10, 15, 22, 12];
      const widths = [80, 70, 56, 76];
      const heights = [10, 14, 12, 10];
      const pos = idx % 4;

      return {
        id: `custom-box-${idx}`,
        x: xCoords[pos],
        y: yCoords[pos],
        width: widths[pos],
        height: heights[pos],
        text: f.text,
        label: f.label,
        severity: f.severity as any,
        description: f.description
      };
    });

    // Generate actionable remedies
    const remedies: string[] = [];
    if (threatLevel === 'malicious') {
      remedies.push('Do NOT submit any codes, payment credentials, or passwords on screens linked here.');
      remedies.push('Mark the underlying message as Spam/Phishing and delete immediately.');
      remedies.push('Double-check the authentic URL of the service directly through trusted app stores or bookmarks.');
    } else if (threatLevel === 'suspicious') {
      remedies.push('Inspect domain spelling closely. Newly registered top-level domains are high-risk indicators.');
      remedies.push('Contact customer service via official direct support lines to verify the alert.');
    } else {
      remedies.push('No obvious threat markers detected. Practice typical precautions with private screen uploads.');
    }

    return {
      riskScore,
      confidenceScore,
      threatLevel,
      boxes,
      findingsList,
      remedies,
      ocrText: ocrContent,
      category: currentCategory,
      title: titleName
    };
  };

  // Select Preset Scenario
  const handleSelectPreset = (presetId: string) => {
    setSelectedCaseId(presetId);
    setUploadedImageSrc(null);
    setUploadedFile(null);
    setScanResult(null);
  };

  // Triggers the simulated local Vision scanning and compilations
  const handleStartScan = () => {
    setIsScanning(true);
    setLogs([]);
    setScanResult(null);

    const preset = SCREENSHOT_PRESETS.find(p => p.id === selectedCaseId);
    const isCustom = selectedCaseId === 'custom-upload';
    
    const activeText = isCustom ? customOcrText : (preset?.ocrText || '');
    const activeCategory = isCustom ? customCategory : (preset?.category || 'banking');
    const activeTitle = isCustom ? (uploadedFile?.name || 'Custom Screenshot') : (preset?.title || 'Screenshot Analysis');

    const steps = [
      'Booting Local AI Vision Shield sandbox environment...',
      'Isolating screenshot dimensions, coordinates, and pixel matrices...',
      'Executing localized layout-sensitive OCR transcription modules...',
      'Matching visual text arrays against on-device spoofing registries...',
      'Analyzing typographical risk vectors, urgency patterns, and card fraud cues...',
      'Correlating local spatial bounding coordinates...',
      'Finalizing offline graphic audit records...'
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${step}`]);
        if (idx === steps.length - 1) {
          setIsScanning(false);
          let result;
          if (isCustom) {
            result = analyzeHeuristics(activeText, activeCategory, activeTitle);
          } else {
            // Preset cases use highly tailored preset data
            result = {
              riskScore: preset!.riskScore,
              confidenceScore: preset!.confidenceScore,
              threatLevel: (preset!.riskScore >= 70 ? 'malicious' : 'suspicious') as ThreatLevel,
              boxes: preset!.boxes,
              findingsList: preset!.boxes.map(b => ({
                label: b.label,
                text: b.text,
                severity: b.severity,
                description: b.description
              })),
              remedies: preset!.riskScore >= 70 ? [
                'Do NOT input any bank PIN codes, password keys, or credential details.',
                'Forward underlying fraud spams to network provider reporting lanes at 7726.',
                'Avoid downloading any attachments or third-party credential utilities.'
              ] : [
                'Inspect unverified links closely. Avoid click-throughs on unfamiliar domains.'
              ],
              ocrText: preset!.ocrText,
              category: preset!.category,
              title: preset!.title
            };
          }

          setScanResult(result);

          // Push to global context logs
          onScanCompleted({
            id: `scan-vision-${Math.random().toString(36).substring(2, 9)}`,
            type: 'screenshot',
            title: `Vision Shield: ${result.title}`,
            target: result.ocrText.substring(0, 50) + '...',
            timestamp: new Date().toISOString(),
            riskScore: result.riskScore,
            threatLevel: result.threatLevel,
            findings: result.boxes.map((b, i) => ({
              id: `vision-finding-${i}`,
              category: 'visual_spoofing',
              severity: b.severity,
              title: `${b.label}: "${b.text}"`,
              description: b.description,
              location: `OCR Box coordinate: [X:${b.x}%, Y:${b.y}%]`
            })),
            remedies: result.remedies,
            meta: {
              scanTimeMs: Math.floor(Math.random() * 90) + 60,
              modelUsed: `On-Device VisionShield OCR v2.5 (Local)`,
              rulesEvaluated: 18
            }
          });
        }
      }, (idx + 1) * 220);
    });
  };

  // Drag & drop handlers
  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const processUploadedFile = (file: File) => {
    const src = URL.createObjectURL(file);
    setUploadedImageSrc(src);
    setUploadedFile(file);
    setSelectedCaseId('custom-upload');
    setScanResult(null);

    // Default template text matches category
    const defaultText = getCategoryDefaultText(customCategory);
    setCustomOcrText(defaultText);
  };

  const getCategoryDefaultText = (cat: string) => {
    if (cat === 'banking') {
      return 'Chase Customer Security Update.\n\nAccount access has been restricted due to secure billing mismatch.\n\nPlease verify card digits, passcode, and ATM PIN now to recover balance: http://verification-chase-online-ssl.xyz/signin';
    } else if (cat === 'shopping') {
      return 'Amazon Rewards Claim Notification!\n\nCongratulations! You won a $1,000 Amazon Promo Gift Card. Claim immediately: http://amazon-rewards-claim.club\n\nEnter credit card billing data to release reward.';
    } else if (cat === 'login') {
      return 'PayPal Sign-in Blocked.\n\nTo unlock your balance, please verify your login username, password, and credit card credentials immediately: http://paypal-login-assistance.com.top/secure';
    } else if (cat === 'email') {
      return 'Subject: Action Required - Overdue subscription renewal!\n\nDear Netflix Customer, we were unable to process your payment billing details. Update billing card now: http://netflix-billing-update-site.info/secure-portal';
    } else {
      return 'USPS Notice: Package delivery suspended. Redelivery requires a $1.50 processing fee. Please verify your address card now: http://usps-address-correct.top';
    }
  };

  // Keep OCR Text sync when user shifts category on custom upload
  const handleCustomCategoryChange = (cat: 'banking' | 'shopping' | 'login' | 'email' | 'message') => {
    setCustomCategory(cat);
    setCustomOcrText(getCategoryDefaultText(cat));
    setScanResult(null);
  };

  const handleRemoveUploaded = () => {
    setUploadedImageSrc(null);
    setUploadedFile(null);
    setSelectedCaseId('banking');
    setScanResult(null);
  };

  // Circumference calculation for SVG circular dial Risk Meter (radius = 45 -> circumference = 282.7)
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const riskPercent = scanResult ? scanResult.riskScore : 0;
  const strokeDashoffset = circumference - (riskPercent / 100) * circumference;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 lg:px-8 py-6 text-gray-200">
      
      {/* Visual Header Grid Section */}
      <div className="glass-panel rounded-2xl border border-white/5 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs tracking-wider">
            <Cpu className="w-4 h-4 animate-pulse" />
            <span>ON-DEVICE IMAGE INTELLIGENCE NODE</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">
            Vision Shield Screenshot Scanner
          </h2>
          <p className="text-xs text-gray-400 max-w-2xl">
            Upload screenshot logs of banking portals, login prompts, shopping receipts, emails, 
            or messages. Analyzes visual typography coordinates, brands, and credential harvesting patterns completely offline.
          </p>
        </div>
      </div>

      {/* Grid Menu: Five Preloaded Scenario Selectors */}
      <div className="glass-panel rounded-xl p-4 border border-cyan-500/10 space-y-3 text-left">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-cyan-400 font-bold tracking-widest block uppercase">Visual Sandbox Scenarios</span>
          <span className="text-[10px] font-mono text-gray-500">Select standard screenshot benchmarks or upload files</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {SCREENSHOT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset.id)}
              className={`px-3 py-2.5 rounded-xl text-xs font-mono transition-all border text-left flex flex-col justify-between gap-1.5 cursor-pointer ${
                selectedCaseId === preset.id 
                  ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                  : 'bg-slate-900/40 hover:bg-slate-900/60 border-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <span className="text-white font-semibold truncate block w-full">{preset.label.split(' ')[0]} {preset.title.split(' ')[0]}</span>
              <span className="text-[10px] opacity-70 block capitalize">{preset.category}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Core Scanning Interface Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Interactive Canvas Panel: Col span 7 */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel rounded-2xl border border-white/5 p-5 space-y-4 text-left">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/5 text-xs font-mono">
              <div className="flex items-center gap-2 text-cyan-400">
                <Layers className="w-4 h-4" />
                <span className="font-bold">ON-DEVICE VISION CANVAS</span>
              </div>
              
              {/* Reset Upload state button */}
              {selectedCaseId === 'custom-upload' && uploadedImageSrc && (
                <button
                  onClick={handleRemoveUploaded}
                  className="text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove File</span>
                </button>
              )}
            </div>

            {/* Interactive Image Frame & Bounding Box Overlays */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`
                relative h-[440px] rounded-2xl border bg-slate-950/85 flex flex-col items-center justify-center overflow-hidden transition-all duration-300
                ${dragActive ? 'border-cyan-400 bg-cyan-950/10 shadow-[inset_0_0_20px_rgba(6,182,212,0.15)]' : 'border-white/5'}
              `}
              id="drop-screenshot-zone"
            >
              
              {/* Scanning laser beam effect */}
              {isScanning && (
                <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(6,182,212,0.8)] z-20 animate-laser"></div>
              )}

              {/* Render Selected Preset Vector Overlays */}
              {selectedCaseId !== 'custom-upload' ? (
                <div className="w-[300px] h-[380px] bg-slate-900 rounded-2xl border border-white/5 p-4 flex flex-col justify-between text-left relative overflow-hidden shadow-2xl">
                  {/* Mock Screenshot Header based on category */}
                  <div className="border-b border-white/5 pb-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-500/60"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
                    </div>
                    <span className="text-[9px] font-mono text-gray-500 bg-black/40 px-2 py-0.5 rounded border border-white/5 truncate max-w-[150px]">
                      {SCREENSHOT_PRESETS.find(p => p.id === selectedCaseId)?.imageName}
                    </span>
                  </div>

                  {/* Preloaded Content Area mockup */}
                  <div className="flex-1 py-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-cyan-950/50 border border-cyan-500/20 flex items-center justify-center">
                        {selectedCaseId === 'banking' && <Lock className="w-3.5 h-3.5 text-cyan-400" />}
                        {selectedCaseId === 'shopping' && <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />}
                        {selectedCaseId === 'login' && <Cpu className="w-3.5 h-3.5 text-cyan-400" />}
                        {selectedCaseId === 'email' && <Mail className="w-3.5 h-3.5 text-cyan-400" />}
                        {selectedCaseId === 'message' && <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                      <div>
                        <p className="text-xs text-white font-bold font-display leading-tight">
                          {selectedCaseId === 'banking' ? 'Chase Security' : 
                           selectedCaseId === 'shopping' ? 'Amazon Rewards' :
                           selectedCaseId === 'login' ? 'PayPal Auth Node' :
                           selectedCaseId === 'email' ? 'Netflix Accounts' : 'USPS Notification'}
                        </p>
                        <p className="text-[8px] font-mono text-gray-500">Secure Audit Scanner</p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-[11px] text-gray-300 leading-relaxed font-mono whitespace-pre-line max-h-[190px] overflow-hidden">
                      {SCREENSHOT_PRESETS.find(p => p.id === selectedCaseId)?.ocrText}
                    </div>
                  </div>

                  {/* Interactive Coordinate Boxes overlays for Presets */}
                  {scanResult && selectedCaseId !== 'custom-upload' && scanResult.boxes.map((box) => (
                    <div
                      key={box.id}
                      onMouseEnter={() => setActiveBoxId(box.id)}
                      onMouseLeave={() => setActiveBoxId(null)}
                      className={`
                        absolute border-2 cursor-pointer transition-all duration-200 z-10 rounded
                        ${activeBoxId === box.id 
                          ? 'border-rose-400 bg-rose-500/15 shadow-[0_0_12px_rgba(239,68,68,0.5)] scale-[1.01]' 
                          : box.severity === 'high' 
                          ? 'border-rose-500/35 bg-rose-500/5 hover:border-rose-400' 
                          : 'border-amber-500/35 bg-amber-500/5 hover:border-amber-400'}
                      `}
                      style={{
                        left: `${box.x}%`,
                        top: `${box.y}%`,
                        width: `${box.width}%`,
                        height: `${box.height}%`,
                      }}
                      title={`${box.label}: ${box.text}`}
                    />
                  ))}
                </div>
              ) : (
                /* Custom Upload State visual layout */
                <div className="w-full h-full flex flex-col items-center justify-center relative p-4">
                  {uploadedImageSrc ? (
                    <div className="w-full h-full flex flex-col items-center justify-center relative">
                      {/* Uploaded user screenshot rendering */}
                      <img 
                        src={uploadedImageSrc} 
                        className="max-h-[360px] max-w-full rounded-xl object-contain shadow-2xl border border-white/10" 
                        alt="Uploaded screenshot"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Interactive Bounding Boxes drawn over user screenshot */}
                      {scanResult && selectedCaseId === 'custom-upload' && scanResult.boxes.map((box) => (
                        <div
                          key={box.id}
                          onMouseEnter={() => setActiveBoxId(box.id)}
                          onMouseLeave={() => setActiveBoxId(null)}
                          className={`
                            absolute border-2 cursor-pointer transition-all duration-200 z-10 rounded
                            ${activeBoxId === box.id 
                              ? 'border-rose-400 bg-rose-500/15 shadow-[0_0_12px_rgba(239,68,68,0.5)] scale-[1.01]' 
                              : box.severity === 'high' 
                              ? 'border-rose-500/35 bg-rose-500/5 hover:border-rose-400' 
                              : 'border-amber-500/35 bg-amber-500/5 hover:border-amber-400'}
                          `}
                          style={{
                            left: `${box.x}%`,
                            top: `${box.y}%`,
                            width: `${box.width}%`,
                            height: `${box.height}%`,
                          }}
                          title={`${box.label}: ${box.text}`}
                        />
                      ))}
                    </div>
                  ) : (
                    /* Inactive Upload Zone placeholder click-to-upload */
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="text-center p-8 space-y-4 max-w-md cursor-pointer hover:bg-white/3 rounded-2xl border border-dashed border-white/10 hover:border-cyan-400/40 transition-all group"
                    >
                      <div className="w-16 h-16 bg-cyan-950/20 border border-cyan-500/10 group-hover:border-cyan-500/30 rounded-full flex items-center justify-center mx-auto transition-all">
                        <UploadCloud className="w-8 h-8 text-cyan-400 group-hover:scale-105 transition-transform" />
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                          Drag & Drop Screenshot here
                        </p>
                        <p className="text-xs text-gray-500 leading-relaxed font-sans">
                          Or click to browse files from your computer. Supports PNG, JPG, or GIF screens. Processing is executed 100% locally in browser memory.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Hidden HTML input file */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>

            {/* Custom Screenshot Variable Settings */}
            {selectedCaseId === 'custom-upload' && uploadedImageSrc && (
              <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5 space-y-4">
                
                {/* Category selectors for custom screenshots */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">1. Screenshot Type / Context Category</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1">
                    {[
                      { id: 'banking', label: '🏦 Banking' },
                      { id: 'shopping', label: '🛍️ Shopping' },
                      { id: 'login', label: '🔐 Login' },
                      { id: 'email', label: '📧 Email' },
                      { id: 'message', label: '💬 Message' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => handleCustomCategoryChange(tab.id as any)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-mono transition-all border ${
                          customCategory === tab.id
                            ? 'bg-cyan-500/25 border-cyan-500/30 text-cyan-300'
                            : 'bg-slate-950/40 border-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Simulated OCR Text area parser input */}
                <div className="space-y-1.5 text-left">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                      2. Extracted Screen Text (OCR Assistance)
                    </label>
                    <button
                      onClick={() => setCustomOcrText('')}
                      className="text-[9px] font-mono text-gray-500 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      Clear Content
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-500 font-sans">
                    Review and verify the text detected in your screenshot. Edit or paste details to refine local heuristics instantly.
                  </p>
                  <textarea
                    rows={4}
                    value={customOcrText}
                    onChange={(e) => {
                      setCustomOcrText(e.target.value);
                      setScanResult(null);
                    }}
                    placeholder="Enter or modify the text content found on this screen (URLs, brand names, financial cues, invoice demands)..."
                    className="w-full px-3 py-2 bg-slate-950/60 border border-white/5 rounded-xl text-xs text-gray-200 outline-none focus:border-cyan-400 transition-all font-mono leading-relaxed resize-none"
                  />
                </div>

              </div>
            )}

            {/* Launch Scan trigger button */}
            {(!scanResult && !isScanning) && (
              <button
                onClick={handleStartScan}
                disabled={selectedCaseId === 'custom-upload' && !uploadedImageSrc}
                className={`w-full py-4 rounded-xl font-display font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  selectedCaseId === 'custom-upload' && !uploadedImageSrc
                    ? 'bg-gray-800 text-gray-500 border border-transparent cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                }`}
                id="start-vision-audit-btn"
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>EXECUTE LOCAL VISION OCR AUDIT</span>
              </button>
            )}

            {/* Scanning details log feed */}
            {isScanning && (
              <div className="p-4 bg-black/60 rounded-xl border border-cyan-500/10 text-left space-y-1.5 font-mono">
                <div className="flex items-center gap-2 text-[10px] text-cyan-400 font-bold uppercase tracking-wider animate-pulse">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Vision Shield Sandbox Log Stream</span>
                </div>
                <div className="text-[10px] text-cyan-300 space-y-1 max-h-[140px] overflow-y-auto scrollbar-thin">
                  {logs.map((log, idx) => (
                    <div key={idx} className="truncate select-none">{log}</div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Metrics Panel: Risk Dial, Confidence, and Findings: Col span 5 */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Diagnostic Report Panel */}
          <AnimatePresence mode="wait">
            {scanResult ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className={`glass-panel rounded-2xl border p-5 text-left space-y-5 relative overflow-hidden ${
                  scanResult.threatLevel === 'malicious'
                    ? 'border-rose-500/25 bg-rose-950/5'
                    : scanResult.threatLevel === 'suspicious'
                    ? 'border-amber-500/25 bg-amber-950/5'
                    : 'border-emerald-500/25 bg-emerald-950/5'
                }`}
              >
                {/* Glow ring bg */}
                <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl pointer-events-none ${
                  scanResult.threatLevel === 'malicious' ? 'bg-rose-500/10' : scanResult.threatLevel === 'suspicious' ? 'bg-amber-500/10' : 'bg-emerald-500/10'
                }`}></div>

                {/* Report title and badge */}
                <div className="flex items-start justify-between pb-3 border-b border-white/5 z-10 relative">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono text-gray-500 tracking-wider block uppercase">Diagnostic Report</span>
                    <h4 className="font-display font-bold text-white text-md truncate max-w-[160px]">
                      {scanResult.title}
                    </h4>
                  </div>
                  
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-display font-bold tracking-wider uppercase border ${
                    scanResult.threatLevel === 'malicious'
                      ? 'bg-rose-950/40 border-rose-500/30 text-rose-400 animate-cyber-pulse'
                      : scanResult.threatLevel === 'suspicious'
                      ? 'bg-amber-950/40 border-amber-500/30 text-amber-400'
                      : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                  }`}>
                    {scanResult.threatLevel}
                  </span>
                </div>

                {/* Visual Risk Meter Arc Grid */}
                <div className="flex items-center gap-6 bg-slate-950/40 p-4 rounded-xl border border-white/5 relative z-10">
                  
                  {/* Circular Dial SVG */}
                  <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      {/* Gray track background */}
                      <circle
                        cx="48"
                        cy="48"
                        r={radius}
                        className="stroke-slate-800"
                        strokeWidth="7"
                        fill="transparent"
                      />
                      {/* Active glow gradient arc */}
                      <circle
                        cx="48"
                        cy="48"
                        r={radius}
                        className={`transition-all duration-1000 ${
                          scanResult.threatLevel === 'malicious' ? 'stroke-rose-500' : scanResult.threatLevel === 'suspicious' ? 'stroke-amber-500' : 'stroke-emerald-500'
                        }`}
                        strokeWidth="7"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                      />
                    </svg>
                    
                    {/* Centered risk text indicators */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-display font-bold text-white leading-none">
                        {scanResult.riskScore}
                      </span>
                      <span className="text-[8px] font-mono text-gray-400 tracking-wider uppercase mt-0.5">
                        Risk Score
                      </span>
                    </div>
                  </div>

                  {/* Meter Side Stats parameters */}
                  <div className="flex-1 space-y-2">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-mono text-cyan-400 tracking-wider uppercase block font-bold">On-Device Verdict</span>
                      <p className="text-xs text-gray-300 font-sans leading-relaxed">
                        {scanResult.threatLevel === 'malicious' 
                          ? 'Severe trust breaches matching visual card-theft and harvesting patterns.' 
                          : scanResult.threatLevel === 'suspicious'
                          ? 'Moderate concerns. Unverified domains require credential caution.' 
                          : 'Lexical structures present low visual signature hazards.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-2 text-[10px] font-mono">
                      <div>
                        <span className="text-gray-500 block">CONFIDENCE</span>
                        <span className="text-white font-bold">{scanResult.confidenceScore}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">MODEL TIME</span>
                        <span className="text-cyan-400 font-bold">84ms</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Interactive Suspicious Indicator Highlights List */}
                <div className="space-y-2.5 z-10 relative">
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block font-bold">
                    Highlighted Suspicious Indicators ({scanResult.boxes.length})
                  </span>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                    {scanResult.boxes.map((box) => (
                      <div
                        key={box.id}
                        onMouseEnter={() => setActiveBoxId(box.id)}
                        onMouseLeave={() => setActiveBoxId(null)}
                        className={`p-3 rounded-xl border transition-all text-left space-y-1.5 cursor-crosshair ${
                          activeBoxId === box.id
                            ? 'bg-rose-950/50 border-rose-500/50 scale-[1.01] shadow-[0_0_10px_rgba(239,68,68,0.15)]'
                            : box.severity === 'high'
                            ? 'bg-rose-950/20 border-rose-500/10 text-rose-300'
                            : box.severity === 'medium'
                            ? 'bg-amber-950/20 border-amber-500/10 text-amber-300'
                            : 'bg-cyan-950/15 border-cyan-500/10 text-cyan-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold font-display flex items-center gap-1.5 text-white">
                            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            {box.label}
                          </span>
                          <span className="text-[8px] font-mono text-gray-500 bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                            OCR Location
                          </span>
                        </div>
                        <p className="text-[11px] font-mono italic text-gray-300 leading-snug">
                          Found: "{box.text}"
                        </p>
                        <p className="text-[11px] opacity-80 text-gray-400 leading-relaxed font-sans">
                          {box.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Safeguard remedies */}
                <div className="p-3.5 bg-slate-950/40 rounded-xl border border-white/5 space-y-1.5 text-xs text-gray-300 z-10 relative">
                  <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase block tracking-wider">
                    Required Action Safeguards
                  </span>
                  <ul className="space-y-1.5 list-disc list-inside">
                    {scanResult.remedies.map((rem, idx) => (
                      <li key={idx} className="leading-relaxed pl-0.5 text-gray-300 font-sans text-[11px]">{rem}</li>
                    ))}
                  </ul>
                </div>

                {/* Explainer direct link */}
                <button
                  onClick={onNavigateToExplainer}
                  className="w-full py-2.5 bg-slate-950/50 hover:bg-slate-950/80 border border-white/5 hover:border-cyan-500/30 text-cyan-400 hover:text-cyan-300 text-xs font-mono rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Learn how local OCR detects visual spoofing</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

              </motion.div>
            ) : (
              /* Idle Placeholder state */
              <div className="glass-panel rounded-2xl border border-white/5 p-12 text-center flex flex-col items-center justify-center gap-4 h-[440px] text-gray-400">
                <div className="p-4 bg-white/3 rounded-full border border-white/5">
                  <Eye className="w-8 h-8 text-cyan-500 animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-display font-bold text-white text-sm">Awaiting Screenshot Scan</h4>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto font-sans">
                    Load one of our visual benchmarks above or drop a personal file into the Vision Scanner Canvas. Click "Execute" to render the interactive highlighted coordinate boxes locally.
                  </p>
                </div>
                {selectedCaseId === 'custom-upload' && !uploadedImageSrc && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-cyan-950/30 hover:bg-cyan-950/50 border border-cyan-500/20 hover:border-cyan-400 text-cyan-300 font-mono text-[11px] rounded-lg transition-all cursor-pointer"
                  >
                    Select Image File
                  </button>
                )}
              </div>
            )}
          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
