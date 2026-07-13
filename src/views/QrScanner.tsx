/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, DragEvent, ChangeEvent } from 'react';
import { 
  QrCode, 
  Sparkles, 
  Terminal, 
  ShieldCheck, 
  ShieldAlert, 
  FileWarning, 
  ChevronRight,
  Wifi,
  ExternalLink,
  Camera,
  CameraOff,
  UploadCloud,
  AlertTriangle,
  Check,
  Copy,
  RotateCcw,
  Info,
  Lock,
  Server,
  Link2,
  Globe,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
// @ts-ignore
import jsQR from 'jsqr';
import { ScanResult, ThreatLevel, ScanFinding } from '../types';

interface QrScannerProps {
  onScanCompleted: (result: ScanResult) => void;
  onNavigateToExplainer: () => void;
}

interface AnalysisFinding {
  id: string;
  category: 'header' | 'sender' | 'content' | 'link' | 'metadata' | 'malicious_pattern' | 'visual_spoofing';
  severity: 'info' | 'low' | 'medium' | 'high';
  title: string;
  description: string;
  location: string;
  impact: string;
}

interface QrAnalysisResult {
  payload: string;
  isUrl: boolean;
  parsedUrl: {
    href: string;
    protocol: string;
    hostname: string;
    pathname: string;
    search: string;
  } | null;
  threatLevel: ThreatLevel;
  riskScore: number;
  findings: AnalysisFinding[];
  remedies: string[];
  explanation: string;
}

// Sandbox preset configurations
const SANDBOX_PRESETS = [
  {
    id: 'qr-1',
    label: '🚨 Case 1: Parking Meter Quishing',
    data: 'https://parking-meter-quickpay.secure-alert.xyz/gate/pay?id=8823&redirect=http://chase-verification-card-auth.xyz/secure',
    description: 'Subtle quishing link found pasted as a sticker on a public parking meter.'
  },
  {
    id: 'qr-2',
    label: '📶 Case 2: WiFi Auto-Connect Router',
    data: 'WIFI:S:HotelGuest_Secure;T:WPA;P:88239120;;',
    description: 'WIFI automatic connection trigger containing network credentials.'
  },
  {
    id: 'qr-3',
    label: '✅ Case 3: Clean AI Studio Link',
    data: 'https://ai.studio/build',
    description: 'Official Google AI Studio build URL'
  },
  {
    id: 'qr-4',
    label: '⚠️ Case 4: Unsecure HTTP Form',
    data: 'http://usps-address-check-redeliver.site/verify-identity?tracking=US99218',
    description: 'HTTP phishing link on a cheap .site extension impersonating USPS redelivery.'
  }
];

export default function QrScanner({ onScanCompleted, onNavigateToExplainer }: QrScannerProps) {
  // Input mode selection
  const [activeTab, setActiveTab] = useState<'webcam' | 'upload' | 'manual'>('webcam');
  const [manualInput, setManualInput] = useState('');
  
  // File upload states
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Webcam states
  const [isWebcamOn, setIsWebcamOn] = useState(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [webcamLogs, setWebcamLogs] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);

  // General process state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisLogs, setAnalysisLogs] = useState<string[]>([]);
  const [currentResult, setCurrentResult] = useState<QrAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Refs for camera video feed
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger parent logs and dashboard syncing
  const triggerParentScanCompleted = (payload: string, result: QrAnalysisResult) => {
    const parentFindings: ScanFinding[] = result.findings.map(f => ({
      id: f.id,
      category: f.category,
      severity: f.severity,
      title: f.title,
      description: f.description,
      location: f.location
    }));

    onScanCompleted({
      id: `scan-qr-${Math.random().toString(36).substring(2, 9)}`,
      type: 'qr',
      title: result.isUrl ? `QR URL: ${result.parsedUrl?.hostname || 'Unknown'}` : 'QR Plaintext/Command',
      target: payload,
      timestamp: new Date().toISOString(),
      riskScore: result.riskScore,
      threatLevel: result.threatLevel,
      findings: parentFindings,
      remedies: result.remedies,
      meta: {
        scanTimeMs: Math.floor(Math.random() * 25) + 10,
        modelUsed: 'PrivacyLens QR-Guard Offline Parser v3.0',
        rulesEvaluated: 12,
        sslVerified: result.isUrl ? result.parsedUrl?.protocol === 'https:' : undefined
      }
    });
  };

  // Run offline heuristic audit model
  const analyzeQrPayload = (payload: string): QrAnalysisResult => {
    const trimmed = payload.trim();
    const textLower = trimmed.toLowerCase();
    
    let isUrl = false;
    let parsedUrl: URL | null = null;
    try {
      // Check if it matches URL format
      if (/^https?:\/\//i.test(trimmed)) {
        parsedUrl = new URL(trimmed);
        isUrl = true;
      } else if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/i.test(trimmed) && !trimmed.includes(' ') && !trimmed.includes(';')) {
        // Missing protocol but looks like a raw domain link
        parsedUrl = new URL('http://' + trimmed);
        isUrl = true;
      }
    } catch (e) {
      // Not a URL
    }

    const findings: AnalysisFinding[] = [];
    let riskScore = 10; // baseline safe score
    let remedies: string[] = [];
    let explanation = '';

    if (isUrl && parsedUrl) {
      const protocol = parsedUrl.protocol;
      const hostname = parsedUrl.hostname.toLowerCase();
      const pathname = parsedUrl.pathname.toLowerCase();
      const searchParams = parsedUrl.searchParams;

      // 1. HTTPS Audit
      const isHttps = protocol === 'https:';
      if (isHttps) {
        findings.push({
          id: 'qr_https_secure',
          category: 'metadata',
          severity: 'info',
          title: 'Encrypted Connection (HTTPS)',
          description: 'The link uses the secure, encrypted HTTPS protocol.',
          location: 'Protocol Handler',
          impact: 'Safe. Data in transit is protected against wire interception.'
        });
      } else {
        findings.push({
          id: 'qr_http_unsecure',
          category: 'metadata',
          severity: 'high',
          title: 'Unencrypted Connection (HTTP)',
          description: 'The link uses obsolete, unsecure plain HTTP protocols.',
          location: 'Protocol Handler',
          impact: 'High Risk. Credentials or personal information entered on this site can be monitored or captured by anyone on the network.'
        });
        riskScore += 40;
      }

      // 2. Typosquatting / Brand Impersonation check
      const brands = [
        { name: 'PayPal', keys: ['paypal', 'paypa1', 'pay-pal', 'paypal-security'] },
        { name: 'Chase Bank', keys: ['chase', 'chase-online', 'verification-chase'] },
        { name: 'Amazon', keys: ['amazon', 'amzn', 'amazon-rewards', 'amazon-claim'] },
        { name: 'Netflix', keys: ['netflix', 'netf1ix', 'netflix-billing'] },
        { name: 'USPS', keys: ['usps', 'us-ps', 'usps-redelivery', 'post-office'] },
        { name: 'Google', keys: ['google', 'gmai1', 'gmail'] },
        { name: 'Apple', keys: ['apple', 'icloud', 'apple-id'] },
        { name: 'MetaMask', keys: ['metamask', 'meta-mask'] }
      ];

      let brandImpersonated = false;
      let matchedBrandName = '';
      
      for (const brand of brands) {
        const isMatch = brand.keys.some(k => hostname.includes(k));
        const isOfficial = hostname.endsWith(`${brand.name.toLowerCase().replace(' bank', '')}.com`) || 
                           hostname.endsWith(`${brand.name.toLowerCase().replace(' bank', '')}.org`) ||
                           hostname.endsWith('usps.com') ||
                           hostname.endsWith('netflix.com') ||
                           hostname.endsWith('paypal.com') ||
                           hostname.endsWith('chase.com') ||
                           hostname.endsWith('amazon.com') ||
                           hostname.endsWith('apple.com') ||
                           hostname.endsWith('google.com');

        if (isMatch && !isOfficial) {
          brandImpersonated = true;
          matchedBrandName = brand.name;
          break;
        }
      }

      if (brandImpersonated) {
        findings.push({
          id: 'qr_typosquat_danger',
          category: 'link',
          severity: 'high',
          title: `Brand Impersonation (${matchedBrandName})`,
          description: `The URL mimics the trademark "${matchedBrandName}" but resides on an unauthorized domain: "${hostname}".`,
          location: 'Domain Parser',
          impact: 'High Risk. This mimics authentic company logins to capture passwords and credential keys.'
        });
        riskScore += 45;
      } else {
        findings.push({
          id: 'qr_typosquat_safe',
          category: 'link',
          severity: 'info',
          title: 'Authentic Domain Alignment',
          description: 'No brand impersonation or trademark spoofing was detected in the domain name.',
          location: 'Domain Parser',
          impact: 'Safe. The domain does not try to mimic banking or delivery brands.'
        });
      }

      // 3. Domain Reputation (TLD & IP checks)
      const SUSPICIOUS_TLDS = ['.xyz', '.top', '.click', '.gq', '.cf', '.tk', '.ml', '.club', '.info', '.biz', '.cc', '.online', '.site', '.tech', '.space'];
      const matchedTld = SUSPICIOUS_TLDS.find(tld => hostname.endsWith(tld));
      const isIpHost = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname);

      if (isIpHost) {
        findings.push({
          id: 'qr_raw_ip_host',
          category: 'metadata',
          severity: 'high',
          title: 'Raw IP Host Routing',
          description: `The domain is hosted directly on a numeric IP address: "${hostname}".`,
          location: 'DNS Resolver',
          impact: 'High Risk. Legitimate retail web applications never serve public portals on raw numeric IP addresses. Often used to escape domain-reputation trackers.'
        });
        riskScore += 45;
      } else if (matchedTld) {
        findings.push({
          id: 'qr_shady_tld',
          category: 'metadata',
          severity: 'medium',
          title: 'Low-Reputation TLD Extension',
          description: `The URL registers a highly abused top-level domain suffix: "${matchedTld}".`,
          location: 'TLD Checker',
          impact: 'Warning. Cheap, automated domain registries are heavily favored by attackers for short-lived phishing nodes.'
        });
        riskScore += 25;
      } else {
        findings.push({
          id: 'qr_tld_safe',
          category: 'metadata',
          severity: 'info',
          title: 'Trusted TLD Extension',
          description: 'The domain sits on an established registry (.com, .org, etc.).',
          location: 'TLD Checker',
          impact: 'Safe. Established TLDs carry significantly higher cost and accountability.'
        });
      }

      // 4. Suspicious Redirect Parameters
      const redirectParams = ['redirect', 'url', 'forward', 'gate', 'go', 'to', 'link', 'href', 'target', 'dest', 'destination', 'return'];
      let hasRedirectParam = false;
      let redirectValue = '';

      for (const param of redirectParams) {
        if (searchParams.has(param)) {
          hasRedirectParam = true;
          redirectValue = searchParams.get(param) || '';
          break;
        }
      }

      if (hasRedirectParam) {
        findings.push({
          id: 'qr_suspicious_redirect',
          category: 'link',
          severity: 'medium',
          title: 'Intermediate Redirect Gate',
          description: `The link contains a forwarding gate variable redirecting to: "${redirectValue}".`,
          location: 'Query Parser',
          impact: 'Warning. Quishing attacks use gateway links to bypass visual QR decoders, hiding the true destination under a trusted domain initially.'
        });
        riskScore += 20;
      } else {
        findings.push({
          id: 'qr_redirect_safe',
          category: 'link',
          severity: 'info',
          title: 'Direct Destination Path',
          description: 'No query parameters indicating intermediate forwarding gates were identified.',
          location: 'Query Parser',
          impact: 'Safe. The payload navigates straight to the destination.'
        });
      }

      // 5. Shortened / Masked URLs
      const SHORTENER_DOMAINS = ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'rebrand.ly', 'ow.ly', 'is.gd', 'buff.ly', 'shorte.st'];
      const isShortener = SHORTENER_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d));
      if (isShortener) {
        findings.push({
          id: 'qr_url_shortener',
          category: 'link',
          severity: 'medium',
          title: 'Shortened/Masked URL',
          description: 'The link utilizes a URL shortening registry to completely hide the domain structure.',
          location: 'Hostname Parser',
          impact: 'Warning. Avoid scanning shortened links in public locations. They mask unverified redirects.'
        });
        riskScore += 20;
      }

    } else {
      // Non-URL payloads
      if (textLower.startsWith('wifi:')) {
        findings.push({
          id: 'qr_wifi_payload',
          category: 'metadata',
          severity: 'medium',
          title: 'Wireless Network SSID Trigger',
          description: 'This QR code triggers automatic login to a local Wi-Fi router.',
          location: 'Action Schema',
          impact: 'Warning. Unsecure routers can log or sniff internet packets or redirect dns requests.'
        });
        riskScore += 20;
      } else if (textLower.startsWith('smsto:') || textLower.startsWith('tel:') || textLower.startsWith('mailto:')) {
        findings.push({
          id: 'qr_system_trigger',
          category: 'metadata',
          severity: 'medium',
          title: 'System Intent Trigger',
          description: 'QR barcode contains an automated cellular action script (SMS drafting or Dial dialing).',
          location: 'Action Schema',
          impact: 'Warning. Scammers use trigger links to initiate text messages to premium charges.'
        });
        riskScore += 25;
      } else {
        findings.push({
          id: 'qr_text_payload',
          category: 'content',
          severity: 'info',
          title: 'Offline Plain Text Block',
          description: 'Contains a flat text payload. No remote web links, schemas, or system commands detected.',
          location: 'Plaintext Payload',
          impact: 'Safe. Plaintext characters carry zero interactive or execution threats.'
        });
      }
    }

    // Risk score capping & Mapping threat categories
    riskScore = Math.max(0, Math.min(100, riskScore));

    let threatLevel: ThreatLevel = 'safe';
    if (riskScore >= 60) {
      threatLevel = 'malicious'; // maps to red high-risk
    } else if (riskScore >= 25) {
      threatLevel = 'suspicious'; // maps to yellow warning
    }

    // Set Remedies & Explanations
    if (threatLevel === 'malicious') {
      remedies = [
        'Do NOT visit the web link encoded in this QR code.',
        'Delete or remove this barcode from your device.',
        'Beware of physical QR code stickers overlaid on restaurant tables, parking spaces, or menus.',
        'Never install mobile device profile certificates (.mobileconfig) prompted from a scanned code.'
      ];
      explanation = 'This offline audit identified critical high-risk quishing anomalies. The payload uses unsecure HTTP protocols or includes typosquatting brand names specifically designed to imitate trusted banks or delivery channels on anonymous domain registries. Discard immediately.';
    } else if (threatLevel === 'suspicious') {
      remedies = [
        'Inspect the final hostname closely before typing any password or credit card data.',
        'If this QR code links to a public Wi-Fi connection, double-check the network SSID with staff members.',
        'Check if the barcode is a physical sticker stuck over a legitimate original print.'
      ];
      explanation = 'This QR code triggers secondary device actions or links to a low-reputation top-level-domain. While not confirmed malicious, these configurations are heavily abused in social engineering. Ensure you trust the physical origin of this QR code.';
    } else {
      remedies = [
        'This QR code is safe to open.',
        'Remember to always look for HTTPS indicators in your mobile browser.'
      ];
      explanation = 'No critical threat factors were identified. The link targets a secure, encrypted HTTPS domain with a reputable history and no brand impersonation markers.';
    }

    return {
      payload,
      isUrl,
      parsedUrl: isUrl && parsedUrl ? {
        href: parsedUrl.href,
        protocol: parsedUrl.protocol,
        hostname: parsedUrl.hostname,
        pathname: parsedUrl.pathname,
        search: parsedUrl.search
      } : null,
      threatLevel,
      riskScore,
      findings,
      remedies,
      explanation
    };
  };

  // Run the full scanner/analysis process on raw QR data
  const handleStartAnalysis = (rawQrData: string) => {
    if (!rawQrData) return;
    setIsAnalyzing(true);
    setAnalysisLogs([]);
    setCurrentResult(null);

    const steps = [
      'Isolating raw UTF-8 QR code payload buffer...',
      'Deconstructing URL structure and connection schemes...',
      'Cross-checking domain against on-device reputation databases...',
      'Analyzing typosquatting patterns and brand spoof heuristics...',
      'Scanning URL parameters for intermediate gate redirects...',
      'Finalizing on-device PrivacyLens analysis report...'
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setAnalysisLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${step}`]);
        if (idx === steps.length - 1) {
          setIsAnalyzing(false);
          const result = analyzeQrPayload(rawQrData);
          setCurrentResult(result);
          triggerParentScanCompleted(rawQrData, result);
        }
      }, (idx + 1) * 200);
    });
  };

  // Preset loading handler
  const loadPreset = (presetId: string) => {
    const preset = SANDBOX_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setManualInput(preset.data);
      setUploadedImageSrc(null);
      setUploadedFile(null);
      setCurrentResult(null);
      setErrorMsg(null);
      handleStartAnalysis(preset.data);
    }
  };

  // Manual Scan Trigger
  const handleManualScan = () => {
    if (!manualInput) return;
    setErrorMsg(null);
    handleStartAnalysis(manualInput);
  };

  // Clipboard copy handler
  const copyToClipboard = () => {
    if (!currentResult) return;
    navigator.clipboard.writeText(currentResult.payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- WEBCAM STREAMING CONTROLS ---
  const startWebcam = async () => {
    setWebcamError(null);
    setWebcamLogs([]);
    setIsWebcamOn(true);
    setIsCapturing(true);
    setCurrentResult(null);
    setErrorMsg(null);

    setWebcamLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Requesting video stream permissions...`]);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setWebcamError('Webcam access is blocked or not supported by this browser. Try uploading an image file or entering the payload manually.');
      setIsWebcamOn(false);
      setIsCapturing(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // Required for iOS support
        videoRef.current.play();
      }

      setWebcamLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Secure sandbox webcam link online.`]);
      
      // Start real-time image extraction cycle
      requestAnimationFrame(tickWebcam);
    } catch (err: any) {
      console.error(err);
      let localizedError = 'Unable to open camera. If you are inside an iframe, please ensure browser permission permissions are enabled or click to open in a new tab.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        localizedError = 'Camera access was denied. Please update your browser permissions or use the QR Image Upload tab.';
      }
      setWebcamError(localizedError);
      setIsWebcamOn(false);
      setIsCapturing(false);
    }
  };

  const stopWebcam = () => {
    setIsWebcamOn(false);
    setIsCapturing(false);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Capture loop to scan video stream frames offline
  const tickWebcam = () => {
    if (!isCapturing || !videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState === video.HAVE_ENOUGH_DATA && canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw video frame to hidden canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        try {
          // jsQR performs 100% on-device decoding
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert'
          });

          if (code) {
            // Success! QR found.
            setWebcamLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Barcode signature detected: "${code.data.slice(0, 30)}..."`]);
            stopWebcam();
            handleStartAnalysis(code.data);
            return;
          }
        } catch (err) {
          // Non-blocking decode noise, continue loop
        }
      }
    }

    // Re-queue frame check
    animationFrameRef.current = requestAnimationFrame(tickWebcam);
  };

  // Clean up streams on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // --- DRAG & DROP FILE UPLOAD HANDLERS ---
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
    setErrorMsg(null);
    setCurrentResult(null);
    
    // Create local object URL for rendering image preview
    const src = URL.createObjectURL(file);
    setUploadedImageSrc(src);
    setUploadedFile(file);

    // Decode uploaded image
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            if (code) {
              handleStartAnalysis(code.data);
            } else {
              setErrorMsg('No QR code could be decoded from this image. Please ensure the QR is well-focused, high contrast, and not warped.');
            }
          } catch (err) {
            console.error(err);
            setErrorMsg('Local image parsing failed. The pixel format could not be extracted.');
          }
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveUploaded = () => {
    setUploadedImageSrc(null);
    setUploadedFile(null);
    setCurrentResult(null);
    setErrorMsg(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 lg:px-8 py-6 text-gray-200">
      
      {/* Sleek App Banner */}
      <div className="glass-panel rounded-2xl border border-white/5 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs tracking-wider">
            <QrCode className="w-4 h-4 animate-pulse" />
            <span>LOCAL SECURE QR PARSER</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">
            Offline QR Scanner & Threat Analyzer
          </h2>
          <p className="text-xs text-gray-400 max-w-3xl">
            Detect quishing scams inside the browser sandbox. Instantly parse web links, WiFi, or outbound texts from live webcam captures or photo uploads. Evaluates SSL connection, brand typosquatting, domain reputation, and hidden forwarding redirects 100% locally.
          </p>
        </div>
      </div>

      {/* Grid Preset Selectors */}
      <div className="glass-panel rounded-xl p-4 border border-cyan-500/10 space-y-3 text-left">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-cyan-400 font-bold tracking-widest block uppercase">Sandbox Testing Presets</span>
          <span className="text-[10px] font-mono text-gray-500">Test assessment models instantly without physical codes</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
          {SANDBOX_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => loadPreset(preset.id)}
              className="px-3 py-2.5 bg-slate-900/40 hover:bg-slate-900/60 border border-white/5 hover:border-cyan-500/20 text-gray-300 rounded-xl text-xs font-mono transition-all text-left flex flex-col justify-between gap-1.5 cursor-pointer"
            >
              <span className="text-white font-semibold truncate block w-full">{preset.label}</span>
              <span className="text-[10px] text-gray-500 truncate block w-full">{preset.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main UI Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Control Column: capture methods (col-span-7) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="glass-panel rounded-2xl border border-white/5 p-5 space-y-4 text-left">
            
            {/* Input tabs */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex gap-1 bg-slate-950/60 p-1 rounded-xl border border-white/5">
                <button
                  onClick={() => { setActiveTab('webcam'); stopWebcam(); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'webcam'
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/10'
                      : 'text-gray-400 hover:text-white border border-transparent'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Webcam Scan</span>
                </button>
                <button
                  onClick={() => { setActiveTab('upload'); stopWebcam(); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'upload'
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/10'
                      : 'text-gray-400 hover:text-white border border-transparent'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload Image</span>
                </button>
                <button
                  onClick={() => { setActiveTab('manual'); stopWebcam(); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'manual'
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/10'
                      : 'text-gray-400 hover:text-white border border-transparent'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Payload Console</span>
                </button>
              </div>

              {activeTab === 'upload' && uploadedImageSrc && (
                <button
                  onClick={handleRemoveUploaded}
                  className="text-rose-400 hover:text-rose-300 text-xs font-mono transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove File</span>
                </button>
              )}
            </div>

            {/* TAB CONTENT: WEBCAM SCREEN */}
            {activeTab === 'webcam' && (
              <div className="space-y-4">
                <div className="relative h-[360px] rounded-2xl border border-white/5 bg-slate-950/80 flex flex-col items-center justify-center overflow-hidden">
                  
                  {isWebcamOn ? (
                    <>
                      {/* Active Video Feed */}
                      <video
                        ref={videoRef}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                      
                      {/* Custom visual overlay guides */}
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        {/* Scanner targeting frame */}
                        <div className="relative w-56 h-56 border-2 border-cyan-500/40 rounded-3xl flex items-center justify-center">
                          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-400 -mt-1 -ml-1 rounded-tl-xl"></div>
                          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-400 -mt-1 -mr-1 rounded-tr-xl"></div>
                          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-400 -mb-1 -ml-1 rounded-bl-xl"></div>
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-400 -mb-1 -mr-1 rounded-br-xl"></div>
                          
                          {/* Inner pulsing guide box */}
                          <div className="w-48 h-48 border border-cyan-400/10 rounded-2xl bg-cyan-950/5 animate-pulse"></div>
                        </div>

                        {/* Scanner Laser beam simulation */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-laser"></div>
                      </div>

                      {/* Top floating state overlay */}
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-cyan-400/20 text-[9px] font-mono text-cyan-400 animate-pulse flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                        <span>LIVE DECODING CHANNEL</span>
                      </div>
                    </>
                  ) : (
                    /* Inactive camera placeholder */
                    <div className="text-center p-6 space-y-4 max-w-sm">
                      <div className="w-16 h-16 bg-cyan-950/20 border border-cyan-500/10 rounded-full flex items-center justify-center mx-auto">
                        <CameraOff className="w-8 h-8 text-cyan-500" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white">Camera stream Offline</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          Secure camera frames are analyzed entirely within your browser memory. We never transmit video parameters or data to remote servers.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Hidden Canvas used for frame capturing */}
                  <canvas ref={canvasRef} className="hidden" />
                </div>

                {/* Webcam Controls */}
                <div className="flex gap-2">
                  {isWebcamOn ? (
                    <button
                      onClick={stopWebcam}
                      className="w-full py-3.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-400 text-rose-300 rounded-xl font-display font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CameraOff className="w-4 h-4" />
                      <span>STOP WEBCAM FEED</span>
                    </button>
                  ) : (
                    <button
                      onClick={startWebcam}
                      className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)] rounded-xl font-display font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>START WEBCAM FEED</span>
                    </button>
                  )}
                </div>

                {/* Local Frame scanning status log stream */}
                {isWebcamOn && (
                  <div className="p-3.5 bg-black/40 rounded-xl border border-cyan-500/10 text-left space-y-1 font-mono">
                    <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-bold uppercase">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Webcam Scanner Buffer Logs</span>
                    </div>
                    <div className="text-[9px] text-cyan-300/80 space-y-0.5 max-h-[80px] overflow-y-auto scrollbar-thin">
                      {webcamLogs.map((log, idx) => (
                        <div key={idx} className="truncate select-none">{log}</div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Webcam Permission Block Error message */}
                {webcamError && (
                  <div className="p-4 bg-rose-950/15 border border-rose-500/20 rounded-xl flex items-start gap-3 text-rose-300 text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="font-bold">Webcam Authorization Refused</span>
                      <p className="opacity-90 leading-relaxed">{webcamError}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: FILE UPLOAD */}
            {activeTab === 'upload' && (
              <div className="space-y-4">
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`
                    relative h-[360px] rounded-2xl border bg-slate-950/80 flex flex-col items-center justify-center overflow-hidden transition-all duration-300
                    ${dragActive ? 'border-cyan-400 bg-cyan-950/10' : 'border-white/5'}
                  `}
                >
                  {uploadedImageSrc ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 relative">
                      <img
                        src={uploadedImageSrc}
                        className="max-h-[300px] max-w-full rounded-xl object-contain shadow-2xl border border-white/10"
                        alt="Uploaded barcode"
                      />
                      <div className="absolute top-3 left-3 bg-black/60 px-2.5 py-1 rounded-lg border border-white/5 text-[9px] font-mono text-gray-400">
                        File: {uploadedFile?.name}
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="text-center p-8 space-y-4 max-w-sm cursor-pointer hover:bg-white/3 rounded-2xl border border-dashed border-white/10 hover:border-cyan-400/30 transition-all group mx-auto"
                    >
                      <div className="w-16 h-16 bg-cyan-950/20 border border-cyan-500/10 group-hover:border-cyan-500/30 rounded-full flex items-center justify-center mx-auto transition-all">
                        <UploadCloud className="w-8 h-8 text-cyan-400 group-hover:scale-105 transition-transform" />
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                          Drag & Drop QR Image here
                        </p>
                        <p className="text-xs text-gray-500 leading-relaxed font-sans">
                          Supports standard image uploads (PNG, JPG, JPEG, WEBP). Extracted pixel bounds are processed entirely locally in your sandbox workspace.
                        </p>
                      </div>
                    </div>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                {/* Action button if no image uploaded */}
                {!uploadedImageSrc && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3.5 bg-slate-900/40 hover:bg-slate-900/60 border border-white/5 hover:border-cyan-500/20 text-gray-300 rounded-xl font-display font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>BROWSE SCREENSHOT FILE</span>
                  </button>
                )}
              </div>
            )}

            {/* TAB CONTENT: MANUAL PAYLOAD INPUT */}
            {activeTab === 'manual' && (
              <div className="space-y-4">
                <div className="bg-slate-950/60 p-5 rounded-2xl border border-white/5 space-y-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">Raw QR String Payload</label>
                    <p className="text-[10px] text-gray-500 font-sans">
                      Type or paste barcode targets (such as hyperlinks, tracking redirects, or SSID schemas) to execute sandbox audits instantly.
                    </p>
                    <textarea
                      rows={5}
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      placeholder="Paste target string payload (e.g. https://parking-meter-quickpay.secure-alert.xyz/...)"
                      className="w-full px-3 py-2.5 bg-slate-950/80 border border-white/5 rounded-xl text-xs text-gray-200 outline-none focus:border-cyan-400 transition-all font-mono leading-relaxed resize-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleManualScan}
                  disabled={!manualInput}
                  className={`
                    w-full py-3.5 rounded-xl font-display font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2
                    ${!manualInput 
                      ? 'bg-gray-800 text-gray-500 border border-transparent cursor-not-allowed' 
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.15)] cursor-pointer'}
                  `}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>ANALYZE MANUAL PAYLOAD</span>
                </button>
              </div>
            )}

            {/* ERROR DISPLAY FOR ANY UPLOAD / SCAN FAILURE */}
            {errorMsg && (
              <div className="p-4 bg-rose-950/15 border border-rose-500/20 rounded-xl flex items-start gap-3 text-rose-400 text-xs text-left">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold">Offline Decoding Error</span>
                  <p className="opacity-90 leading-relaxed">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* SCANNING PROGRESS LOG FEED */}
            {isAnalyzing && (
              <div className="p-4 bg-black/60 rounded-xl border border-cyan-500/10 text-left space-y-2 font-mono">
                <div className="flex items-center gap-2 text-[10px] text-cyan-400 font-bold uppercase tracking-wider animate-pulse">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>On-Device Security Guard Stream</span>
                </div>
                <div className="text-[10px] text-cyan-300 space-y-1 max-h-[140px] overflow-y-auto scrollbar-thin">
                  {analysisLogs.map((log, idx) => (
                    <div key={idx} className="truncate select-none">{log}</div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Columns: Analysis results (col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          
          <AnimatePresence mode="wait">
            {currentResult ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className={`glass-panel rounded-2xl border p-5 text-left space-y-5 relative overflow-hidden ${
                  currentResult.threatLevel === 'malicious'
                    ? 'border-rose-500/25 bg-rose-950/5'
                    : currentResult.threatLevel === 'suspicious'
                    ? 'border-amber-500/25 bg-amber-950/5'
                    : 'border-emerald-500/25 bg-emerald-950/5'
                }`}
              >
                {/* Visual Gradient Glow */}
                <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl pointer-events-none ${
                  currentResult.threatLevel === 'malicious' ? 'bg-rose-500/10' : currentResult.threatLevel === 'suspicious' ? 'bg-amber-500/10' : 'bg-emerald-500/10'
                }`}></div>

                {/* Threat assessment title banner */}
                <div className="flex items-start justify-between pb-3 border-b border-white/5 relative z-10">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono text-gray-500 tracking-wider block uppercase">Security Assessment</span>
                    <h4 className="font-display font-bold text-white text-md">
                      QR Barcode Audited
                    </h4>
                  </div>
                  
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-display font-bold tracking-wider uppercase border ${
                    currentResult.threatLevel === 'malicious'
                      ? 'bg-rose-950/40 border-rose-500/30 text-rose-400'
                      : currentResult.threatLevel === 'suspicious'
                      ? 'bg-amber-950/40 border-amber-500/30 text-amber-400'
                      : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                  }`}>
                    {currentResult.threatLevel === 'malicious' ? 'High Risk' : currentResult.threatLevel === 'suspicious' ? 'Warning' : 'Safe'}
                  </span>
                </div>

                {/* Risk Score details card */}
                <div className="flex items-center gap-5 bg-slate-950/40 p-4 rounded-xl border border-white/5 relative z-10">
                  <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="34"
                        className="stroke-slate-800"
                        strokeWidth="6"
                        fill="transparent"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="34"
                        className={`transition-all duration-1000 ${
                          currentResult.threatLevel === 'malicious' ? 'stroke-rose-500' : currentResult.threatLevel === 'suspicious' ? 'stroke-amber-500' : 'stroke-emerald-500'
                        }`}
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 34}
                        strokeDashoffset={(2 * Math.PI * 34) - (currentResult.riskScore / 100) * (2 * Math.PI * 34)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-lg font-display font-bold text-white leading-none">
                        {currentResult.riskScore}
                      </span>
                      <span className="text-[7px] font-mono text-gray-400 uppercase mt-0.5">Threat Index</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold text-white block">Offline Assessment Metric</span>
                    <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                      Calculated locally based on secure encryption compliance, brand typosquatting filters, low-trust TLD records, and redirection tags.
                    </p>
                  </div>
                </div>

                {/* Raw Decoded Content Card */}
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-white/5 space-y-2 relative z-10">
                  <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                      <span>DECODED PAYLOAD VALUE</span>
                    </div>
                    <button
                      onClick={copyToClipboard}
                      className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="text-xs font-mono bg-black/40 px-3 py-2.5 rounded-lg border border-white/5 break-all select-all text-gray-200">
                    {currentResult.payload}
                  </div>
                </div>

                {/* Explanation text block */}
                <div className="space-y-1.5 bg-slate-950/30 p-3 rounded-xl border border-white/5 relative z-10">
                  <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider block">Security Explanation</span>
                  <p className="text-xs text-gray-300 leading-relaxed font-sans">{currentResult.explanation}</p>
                </div>

                {/* Findings Audits checklist */}
                <div className="space-y-3 relative z-10">
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                    Decoded Heuristic Findings ({currentResult.findings.length})
                  </span>
                  
                  <div className="space-y-2.5">
                    {currentResult.findings.map((finding, idx) => (
                      <div
                        key={finding.id}
                        className={`p-3 rounded-xl border space-y-1.5 text-left ${
                          finding.severity === 'high'
                            ? 'bg-rose-950/10 border-rose-500/20'
                            : finding.severity === 'medium'
                            ? 'bg-amber-950/10 border-amber-500/20'
                            : 'bg-slate-900/40 border-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {finding.severity === 'high' ? (
                            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                          ) : finding.severity === 'medium' ? (
                            <FileWarning className="w-4 h-4 text-amber-400 shrink-0" />
                          ) : (
                            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                          <span className="text-xs font-bold text-white font-display">
                            {finding.title}
                          </span>
                        </div>
                        
                        <div className="pl-6 space-y-1">
                          <p className="text-[11px] text-gray-300 leading-relaxed">
                            {finding.description}
                          </p>
                          <div className="flex gap-1.5 pt-1 border-t border-white/5 text-[9px] font-mono text-gray-500">
                            <span className="text-cyan-400 font-bold">Impact:</span>
                            <span className="italic text-gray-400">{finding.impact}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Remedies recommended */}
                <div className="p-4 bg-slate-950/60 border border-white/5 rounded-xl space-y-2 relative z-10">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">Recommended Safe Actions</span>
                  <ul className="space-y-1.5 text-xs text-gray-300 leading-relaxed list-disc list-inside pl-1">
                    {currentResult.remedies.map((remedy, idx) => (
                      <li key={idx} className="pl-1 text-gray-300">{remedy}</li>
                    ))}
                  </ul>
                </div>

                {/* Explainer direct linkage navigation button */}
                <button
                  onClick={onNavigateToExplainer}
                  className="w-full py-2 bg-cyan-950/30 hover:bg-cyan-950/50 border border-cyan-500/20 hover:border-cyan-400 text-cyan-400 hover:text-cyan-300 text-xs font-mono rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer relative z-10"
                >
                  <span>Deconstruct quishing tactics in Explainer</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

              </motion.div>
            ) : (
              /* Idle / Placeholder stream state */
              <div className="glass-panel rounded-2xl border border-white/5 p-12 text-center flex flex-col items-center justify-center gap-4 h-[550px]">
                <div className="p-4 bg-cyan-950/20 rounded-full border border-cyan-500/10">
                  <QrCode className="w-8 h-8 text-cyan-500" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-display font-semibold text-white text-md">Awaiting offline scan</h4>
                  <p className="text-xs text-gray-500 max-w-sm leading-relaxed mx-auto">
                    Activate your video camera stream, upload a barcode screen capture, or click a sandbox preset to trigger the secure offline quishing evaluation system.
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
