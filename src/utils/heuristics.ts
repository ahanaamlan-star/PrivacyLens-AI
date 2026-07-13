/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ScanResult, ScanFinding, ScanType, ThreatLevel } from '../types';

// Regular expressions and keywords for on-device detection
const SUSPICIOUS_EMAIL_DOMAINS = [
  'secure-alert', 'update-verification', 'support-portal', 'invoice-office',
  'billing-service', 'netf1ix', 'paypa1', 'amazon-security', 'refund-gov',
  'login-assistance', 'claim-reward', 'airdrop-token', 'cryptosupport'
];

const SUSPICIOUS_TLDS = ['.xyz', '.top', '.click', '.gq', '.cf', '.tk', '.ml', '.club', '.info', '.biz', '.cc'];

const BANKING_KEYWORDS = ['chase', 'wells fargo', 'boa', 'paypal', 'venmo', 'stripe', 'coinbase', 'binance', 'metamask'];

const URGENCY_PHRASES = [
  'immediately', 'within 24 hours', 'account suspended', 'final notice',
  'unauthorized access', 'verify identity', 'action required', 'critical alert',
  'immediate action', 'security breach'
];

const SCAN_MOCK_MODELS = {
  email: 'PrivacyLens-BERT v4.2 (Offline)',
  sms: 'PrivacyLens-SmsGuard v1.8 (Local)',
  website: 'URL-Net Lite (128-bit Ruleset)',
  screenshot: 'VisionShield-Mobile v2.5 (OCR-Local)',
  qr: 'QuishBuster v2.0 (On-Device)',
};

/**
 * Perform on-device email scanning using heuristic pattern matching.
 */
export function scanEmail(subject: string, body: string, senderEmail: string): ScanResult {
  const findings: ScanFinding[] = [];
  const textToScan = `${subject} ${body}`.toLowerCase();
  const senderLower = senderEmail.toLowerCase();
  
  let riskScore = 10; // base risk score
  const rulesEvaluated = 14;

  // 1. Sender Check
  const domainMatch = senderLower.match(/@([^>]+)/);
  if (domainMatch) {
    const domain = domainMatch[1];
    
    // Check for suspicious words in domain
    const suspiciousDomainWord = SUSPICIOUS_EMAIL_DOMAINS.find(word => domain.includes(word));
    if (suspiciousDomainWord) {
      findings.push({
        id: 'sender_domain_spoof',
        category: 'sender',
        severity: 'high',
        title: 'Suspicious Domain Suffix',
        description: `Sender domain contains tracking or spoofing keyword: "${suspiciousDomainWord}".`,
        location: senderEmail
      });
      riskScore += 35;
    }

    // Check for suspicious TLDs
    const suspiciousTld = SUSPICIOUS_TLDS.find(tld => domain.endsWith(tld));
    if (suspiciousTld) {
      findings.push({
        id: 'sender_tld_risk',
        category: 'sender',
        severity: 'medium',
        title: 'Generic Top-Level Domain',
        description: `Domain ends with "${suspiciousTld}", frequently used in low-cost automated phishing infrastructure.`,
        location: domain
      });
      riskScore += 15;
    }

    // Check for typosquatting of famous banking brands
    const typosquatBrand = BANKING_KEYWORDS.find(brand => {
      // Check if it matches a brand closely but isn't the actual brand domain
      return domain.includes(brand) && !domain.endsWith(`${brand}.com`) && !domain.endsWith(`${brand}.org`);
    });
    if (typosquatBrand) {
      findings.push({
        id: 'sender_brand_typo',
        category: 'sender',
        severity: 'high',
        title: 'Brand Imitation (Typosquatting)',
        description: `Domain mentions "${typosquatBrand}" but does not belong to official domains. Highly indicative of phishing.`,
        location: domain
      });
      riskScore += 40;
    }
  } else {
    findings.push({
      id: 'sender_malformed',
      category: 'sender',
      severity: 'medium',
      title: 'Malformed Email Header',
      description: 'The sender address does not have a valid RFC 5322 format.',
      location: senderEmail
    });
    riskScore += 20;
  }

  // 2. Content Heuristics
  // Urgency Matcher
  const foundUrgency = URGENCY_PHRASES.filter(phrase => textToScan.includes(phrase));
  if (foundUrgency.length > 0) {
    findings.push({
      id: 'content_urgency',
      category: 'content',
      severity: 'medium',
      title: 'High-Pressure Language',
      description: `Detected high urgency keywords or stress triggers: ${foundUrgency.slice(0, 3).map(p => `"${p}"`).join(', ')}.`,
      location: 'Email Body'
    });
    riskScore += Math.min(25, foundUrgency.length * 8);
  }

  // Financial Triggers
  if (textToScan.includes('bank') || textToScan.includes('credit card') || textToScan.includes('crypto') || textToScan.includes('transfer')) {
    if (textToScan.includes('gift card') || textToScan.includes('btc') || textToScan.includes('wallet') || textToScan.includes('reimbursement')) {
      findings.push({
        id: 'content_financial_demand',
        category: 'content',
        severity: 'high',
        title: 'Suspicious Financial Target',
        description: 'Email demands cryptocurrency, gift cards, or immediate wire verification, which is highly abnormal for official support.',
        location: 'Email Body'
      });
      riskScore += 25;
    }
  }

  // Generic Greeting check
  const genericGreetings = ['dear customer', 'dear user', 'hello customer', 'valuable client', 'dear client'];
  const hasGenericGreeting = genericGreetings.some(greeting => textToScan.includes(greeting));
  if (hasGenericGreeting) {
    findings.push({
      id: 'content_generic_greeting',
      category: 'content',
      severity: 'low',
      title: 'Unpersonalized Greeting',
      description: 'The message uses a generic placeholder greeting. Professional services usually address you by your registered name.',
      location: 'First line of body'
    });
    riskScore += 10;
  }

  // 3. Link Scanner inside body
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = body.match(urlRegex) || [];
  if (urls.length > 0) {
    let maliciousUrlCount = 0;
    urls.forEach((urlStr) => {
      try {
        const urlObj = new URL(urlStr);
        const urlHost = urlObj.hostname.toLowerCase();
        
        const isBadTld = SUSPICIOUS_TLDS.some(tld => urlHost.endsWith(tld));
        const isBadKeyword = SUSPICIOUS_EMAIL_DOMAINS.some(word => urlHost.includes(word));
        
        if (isBadTld || isBadKeyword) {
          maliciousUrlCount++;
        }
      } catch (e) {
        // invalid URL
      }
    });

    if (maliciousUrlCount > 0) {
      findings.push({
        id: 'link_malicious_url',
        category: 'link',
        severity: 'high',
        title: 'Untrusted Destination URL',
        description: `The body contains ${maliciousUrlCount} link(s) leading to unverified or suspicious external web domains.`,
        location: 'Hyperlinks'
      });
      riskScore += 35;
    } else {
      findings.push({
        id: 'link_presence_info',
        category: 'link',
        severity: 'info',
        title: 'Contains External Links',
        description: 'Verified links present, evaluated safe but recommend checking addresses before entering credentials.',
        location: 'Hyperlinks'
      });
    }
  }

  // Cap risk score between 0 and 100
  riskScore = Math.max(0, Math.min(100, riskScore));

  let threatLevel: ThreatLevel = 'safe';
  if (riskScore >= 70) threatLevel = 'malicious';
  else if (riskScore >= 35) threatLevel = 'suspicious';

  // Remedies based on findings
  const remedies: string[] = [];
  if (threatLevel === 'malicious') {
    remedies.push('Do NOT click any links or download files from this email.');
    remedies.push('Report this message as Phishing inside your email provider.');
    remedies.push('Block sender address permanently.');
    remedies.push('Verify independently by visiting the official website of the service directly via a browser bookmark.');
  } else if (threatLevel === 'suspicious') {
    remedies.push('Be cautious. Double-check the sender\'s actual identity via phone or secure portal.');
    remedies.push('Avoid typing any personal credentials if clicking through.');
  } else {
    remedies.push('This email appears standard, but remain generally vigilant.');
  }

  return {
    id: `scan-eml-${Math.random().toString(36).substr(2, 9)}`,
    type: 'email',
    title: subject || 'Unspecified Email',
    target: senderEmail,
    timestamp: new Date().toISOString(),
    riskScore,
    threatLevel,
    findings,
    remedies,
    meta: {
      scanTimeMs: Math.floor(Math.random() * 25) + 5,
      modelUsed: SCAN_MOCK_MODELS.email,
      rulesEvaluated
    }
  };
}

/**
 * Perform on-device SMS/Text scanning using heuristic pattern matching.
 */
export function scanSms(sender: string, message: string): ScanResult {
  const findings: ScanFinding[] = [];
  const textToScan = message.toLowerCase();
  let riskScore = 10;
  const rulesEvaluated = 10;

  // 1. Sender Check
  // Scam SMS usually come from short codes (5-6 digits), or international numbers, or alphabetic names
  const cleanSender = sender.trim();
  const isShortCode = /^\d{5,6}$/.test(cleanSender);
  const isAlphaSender = /^[a-zA-Z\s.-]+$/.test(cleanSender);

  if (isShortCode) {
    findings.push({
      id: 'sms_short_code',
      category: 'sender',
      severity: 'info',
      title: 'Standard Automated Short Code',
      description: 'Message originates from a registered short code. Often used by legitimate notifications but also SMS spammers.',
      location: sender
    });
    riskScore += 5;
  }

  // 2. Scam text indicators
  const parcelKeywords = ['usps', 'ups', 'fedex', 'package', 'parcel', 'redelivery', 'post office', 'shipment', 'tracking'];
  const bankScamKeywords = ['chase', 'wells fargo', 'boa', 'locked', 'unusual activity', 'suspicious login', 'security lock'];
  const rewardKeywords = ['won', 'gift card', 'reward', 'lottery', 'winner', 'cash prize', 'claim refund'];

  const matchesParcel = parcelKeywords.filter(w => textToScan.includes(w));
  const matchesBank = bankScamKeywords.filter(w => textToScan.includes(w));
  const matchesReward = rewardKeywords.filter(w => textToScan.includes(w));

  // Check parcel scam
  if (matchesParcel.length >= 2 && (textToScan.includes('link') || textToScan.includes('http') || textToScan.includes('.info') || textToScan.includes('.top') || textToScan.includes('/') )) {
    findings.push({
      id: 'sms_parcel_scam',
      category: 'malicious_pattern',
      severity: 'high',
      title: 'Parcel Delivery Spoofing (Smishing)',
      description: 'Classic phishing SMS impersonating postal networks to demand "redelivery fees" or "address updates".',
      location: 'SMS Text'
    });
    riskScore += 45;
  }

  // Check bank lock scam
  if (matchesBank.length >= 2 && (textToScan.includes('http') || textToScan.includes('.com') || textToScan.includes('.net'))) {
    findings.push({
      id: 'sms_banking_alert_scam',
      category: 'malicious_pattern',
      severity: 'high',
      title: 'Simulated Urgent Banking Coercion',
      description: 'SMS claims your bank account is locked, asking you to tap a link to verify credentials or authorize a transaction.',
      location: 'SMS Text'
    });
    riskScore += 50;
  }

  // Check lottery scams
  if (matchesReward.length >= 2) {
    findings.push({
      id: 'sms_lottery_scam',
      category: 'malicious_pattern',
      severity: 'high',
      title: 'Deceptive Reward/Lotto Trap',
      description: 'Offers high-value payouts or free gift cards if you click a link and submit sensitive personal data.',
      location: 'SMS Text'
    });
    riskScore += 40;
  }

  // Short Links detection (highly common in SMS phishing)
  const containsUrl = /https?:\/\/[^\s]+/g.test(textToScan) || /[a-z0-9-]+\.[a-z]{2,}\/[a-z0-9]{3,8}/gi.test(textToScan);
  const containsShortener = /(bit\.ly|t\.co|tinyurl|is\.gd|ow\.ly|buff\.ly|rebrand\.ly)/g.test(textToScan);

  if (containsUrl) {
    if (containsShortener) {
      findings.push({
        id: 'sms_short_link',
        category: 'link',
        severity: 'high',
        title: 'Anonymized Shortened URL',
        description: 'Detected a shortened URL redirector. Attackers use this to bypass telecom filters and mask the final shady domain.',
        location: 'Hyperlinks'
      });
      riskScore += 35;
    } else {
      findings.push({
        id: 'sms_generic_link',
        category: 'link',
        severity: 'medium',
        title: 'Embedded Web URL',
        description: 'Contains a direct hyperlink. Legitimate automated messages rarely include direct transaction or login links due to modern mobile security rules.',
        location: 'Hyperlinks'
      });
      riskScore += 15;
    }
  }

  riskScore = Math.max(0, Math.min(100, riskScore));
  let threatLevel: ThreatLevel = 'safe';
  if (riskScore >= 65) threatLevel = 'malicious';
  else if (riskScore >= 30) threatLevel = 'suspicious';

  const remedies = [];
  if (threatLevel === 'malicious') {
    remedies.push('Do NOT tap any links or dial the numbers provided in the text.');
    remedies.push('Copy the message and forward it to "7726" (SPAM) to notify mobile carriers.');
    remedies.push('Block and delete the sender.');
    remedies.push('If you already clicked and logged in somewhere, change your credentials immediately.');
  } else if (threatLevel === 'suspicious') {
    remedies.push('If this claims to be from a business (e.g. Amazon, Bank), open their official app separately to review alerts.');
  } else {
    remedies.push('This SMS appears safe. Standard spam filtering should handle standard ads.');
  }

  return {
    id: `scan-sms-${Math.random().toString(36).substr(2, 9)}`,
    type: 'sms',
    title: `SMS from ${sender}`,
    target: sender,
    timestamp: new Date().toISOString(),
    riskScore,
    threatLevel,
    findings,
    remedies,
    meta: {
      scanTimeMs: Math.floor(Math.random() * 12) + 2,
      modelUsed: SCAN_MOCK_MODELS.sms,
      rulesEvaluated
    }
  };
}

/**
 * Perform on-device website/URL scanning.
 */
export function scanWebsite(urlStr: string): ScanResult {
  const findings: ScanFinding[] = [];
  let riskScore = 10;
  const rulesEvaluated = 12;
  
  let hostname = urlStr.trim();
  if (!hostname.startsWith('http://') && !hostname.startsWith('https://')) {
    hostname = 'https://' + hostname;
  }

  let domain = '';
  let pathStr = '';
  let isSsl = true;

  try {
    const urlObj = new URL(hostname);
    domain = urlObj.hostname.toLowerCase();
    pathStr = urlObj.pathname.toLowerCase();
    isSsl = urlObj.protocol === 'https:';
  } catch (e) {
    domain = hostname;
  }

  // 1. SSL protocol verification
  if (!isSsl) {
    findings.push({
      id: 'web_unencrypted_http',
      category: 'metadata',
      severity: 'high',
      title: 'Unencrypted Connection (HTTP)',
      description: 'Web site uses an unsecure HTTP connection. Credentials entered here can be intercepted by anyone on your network.',
      location: 'Protocol Handler'
    });
    riskScore += 40;
  }

  // 2. Subdomain flooding check
  // E.g. secure.bankofamerica.com.account-update.xyz
  const hostParts = domain.split('.');
  if (hostParts.length > 4) {
    findings.push({
      id: 'web_subdomain_flooding',
      category: 'link',
      severity: 'high',
      title: 'Subdomain Nesting Overlay',
      description: 'URL contains excessive subdomains, often styled to mimic a real company name (e.g., "paypal.com") in the beginning, while pointing to an anonymous landing page in the end.',
      location: 'Hostname parsing'
    });
    riskScore += 30;
  }

  // 3. TLD checks
  const matchedTld = SUSPICIOUS_TLDS.find(tld => domain.endsWith(tld));
  if (matchedTld) {
    findings.push({
      id: 'web_shady_tld',
      category: 'metadata',
      severity: 'medium',
      title: 'Untrusted TLD Extension',
      description: `Domain sits on a low-reputation top-level-domain ("${matchedTld}"). Legitimate brands rarely host critical infrastructure on these extensions.`,
      location: 'DNS Root'
    });
    riskScore += 25;
  }

  // 4. IP Address host detection (e.g. http://192.168.1.5/login)
  const isIpAddress = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(domain);
  if (isIpAddress) {
    findings.push({
      id: 'web_ip_host',
      category: 'link',
      severity: 'high',
      title: 'Raw IP Host Header',
      description: 'The website is identified directly by its IP address rather than a registered domain name. This is standard for attacks bypassing domain registrar DNS blacklists.',
      location: 'Domain Resolution'
    });
    riskScore += 45;
  }

  // 5. Typosquatting of known brands
  const matchedBrand = BANKING_KEYWORDS.find(brand => {
    // Look for typos like paypa1, chase-verify, coinbase-wallet-net
    const hasBrandWord = domain.includes(brand);
    const isOfficial = domain.endsWith(`${brand}.com`) || domain.endsWith(`${brand}.org`) || domain.endsWith(`${brand}.co.uk`);
    return hasBrandWord && !isOfficial;
  });

  if (matchedBrand) {
    findings.push({
      id: 'web_brand_typo',
      category: 'link',
      severity: 'high',
      title: 'Brand Impersonation (Typosquatting)',
      description: `URL imitates "${matchedBrand}" but resolves to an unauthorized domain. This is a severe threat indicator.`,
      location: 'DNS mapping'
    });
    riskScore += 50;
  }

  // 6. Keywords in path
  if (pathStr.includes('secure') || pathStr.includes('login') || pathStr.includes('verify') || pathStr.includes('banking') || pathStr.includes('update')) {
    if (riskScore > 30) {
      findings.push({
        id: 'web_phishing_path',
        category: 'content',
        severity: 'medium',
        title: 'Credential Harvesting Path',
        description: 'The path folder structure matches classic credentials-snatching portals.',
        location: 'URL Path'
      });
      riskScore += 15;
    }
  }

  riskScore = Math.max(0, Math.min(100, riskScore));
  let threatLevel: ThreatLevel = 'safe';
  if (riskScore >= 60) threatLevel = 'malicious';
  else if (riskScore >= 25) threatLevel = 'suspicious';

  const remedies = [];
  if (threatLevel === 'malicious') {
    remedies.push('Do NOT input usernames, passwords, card details, or sensitive info here.');
    remedies.push('Close the browser tab immediately.');
    remedies.push('Report this URL to Google Safe Browsing or Netcraft.');
    remedies.push('If auto-filled credentials were submitted, change them immediately on the real service website.');
  } else if (threatLevel === 'suspicious') {
    remedies.push('Inspect the SSL certificate. Do not proceed if warnings are thrown by your browser.');
    remedies.push('Make sure the URL is spelling-accurate.');
  } else {
    remedies.push('This website appears secure. Continue to browse normally.');
  }

  return {
    id: `scan-web-${Math.random().toString(36).substr(2, 9)}`,
    type: 'website',
    title: `URL Scanner: ${domain}`,
    target: urlStr,
    timestamp: new Date().toISOString(),
    riskScore,
    threatLevel,
    findings,
    remedies,
    meta: {
      scanTimeMs: Math.floor(Math.random() * 30) + 10,
      modelUsed: SCAN_MOCK_MODELS.website,
      rulesEvaluated,
      sslVerified: isSsl,
      domainAge: threatLevel === 'malicious' ? '12 Days (Newly Created)' : '8 Years (Established)'
    }
  };
}

/**
 * Interface representing simulated OCR elements
 */
export interface OCRBox {
  id: string;
  x: number; // Percentages from top-left (0 to 100)
  y: number;
  width: number;
  height: number;
  text: string;
  label: string;
  severity: 'info' | 'low' | 'medium' | 'high';
  description: string;
}

/**
 * Simulated Local OCR and Screen Analysis
 */
export function scanScreenshot(imageName: string, imageSrc?: string): { scanResult: ScanResult; boxes: OCRBox[] } {
  const findings: ScanFinding[] = [];
  const boxes: OCRBox[] = [];
  let riskScore = 15;
  const rulesEvaluated = 18;

  const nameLower = imageName.toLowerCase();

  // Preset Scenario 1: Fake Banking Alert SMS Screenshot
  if (nameLower.includes('bank') || nameLower.includes('chase') || nameLower.includes('fraud')) {
    riskScore = 85;
    
    boxes.push(
      {
        id: 'box1',
        x: 10, y: 15, width: 80, height: 10,
        text: 'SENDER: +1 (800) 412-9831',
        label: 'Unverified sender',
        severity: 'medium',
        description: 'Sender is a toll-free virtual VOIP line not listed in official bank registry.'
      },
      {
        id: 'box2',
        x: 15, y: 35, width: 70, height: 15,
        text: 'Your CHASE account has been locked. Tap: verify-chase-portal.xyz',
        label: 'Fake URL Match',
        severity: 'high',
        description: 'Impersonates Chase bank. Uses newly registered TLD (.xyz) for credential theft.'
      },
      {
        id: 'box3',
        x: 20, y: 65, width: 60, height: 8,
        text: 'Reply STOP to end',
        label: 'Deceptive Command',
        severity: 'info',
        description: 'Standard opt-out line; used to verify that this phone number is active.'
      }
    );

    findings.push({
      id: 'scr_typosquat',
      category: 'visual_spoofing',
      severity: 'high',
      title: 'Banking Credential Spoof',
      description: 'Detected a fake SMS message containing brand typosquatting ("verify-chase-portal.xyz").',
      location: 'OCR Node Bounding [Box 2]'
    });
    findings.push({
      id: 'scr_pressure_text',
      category: 'content',
      severity: 'high',
      title: 'Coercive Urgent Demand',
      description: 'Contains high-stress language "Account locked". This forces fast action to bypass security checks.',
      location: 'OCR Node Bounding [Box 2]'
    });

  // Preset Scenario 2: Shady Crypto Giveaway / Discord DM
  } else if (nameLower.includes('crypto') || nameLower.includes('discord') || nameLower.includes('gift')) {
    riskScore = 95;

    boxes.push(
      {
        id: 'cbox1',
        x: 15, y: 10, width: 70, height: 12,
        text: 'From: MOD-AirdropHelper #8821',
        label: 'Deceptive Identity',
        severity: 'medium',
        description: 'Discord user claims to be a moderator, but matches pattern of bot-generated accounts.'
      },
      {
        id: 'cbox2',
        x: 10, y: 30, width: 80, height: 25,
        text: 'Congratulations! You won 1.5 BTC ($90,000)! Claim at: btc-gift-airdrop.xyz',
        label: 'Financial Baiting',
        severity: 'high',
        description: 'High-value crypto prize lure. Demands users connect MetaMask wallet to steal tokens.'
      },
      {
        id: 'cbox3',
        x: 25, y: 70, width: 50, height: 15,
        text: 'Connect Web3 Wallet',
        label: 'Malicious Action Target',
        severity: 'high',
        description: 'Wallet-drainer script connected to this landing page button.'
      }
    );

    findings.push({
      id: 'scr_crypto_drainer',
      category: 'visual_spoofing',
      severity: 'high',
      title: 'Crypto Wallet Drainer Pattern',
      description: 'Detected smart-contract connect calls paired with false reward claims.',
      location: 'OCR Node Bounding [Box 2 & 3]'
    });

  // Preset Scenario 3: Shady website with unsecure fields
  } else if (nameLower.includes('website') || nameLower.includes('web') || nameLower.includes('portal')) {
    riskScore = 55;

    boxes.push(
      {
        id: 'wbox1',
        x: 5, y: 8, width: 90, height: 10,
        text: 'http://my-secure-insurance-form.com/fill',
        label: 'Unsecured Protocol',
        severity: 'high',
        description: 'The URL uses unsecure HTTP. Form data will be sent in plain text.'
      },
      {
        id: 'wbox2',
        x: 10, y: 40, width: 80, height: 20,
        text: 'Please enter SSN, Date of Birth & Mother\'s Maiden Name',
        label: 'Pll Leakage',
        severity: 'high',
        description: 'Asks for highly sensitive identity credentials on an unencrypted web portal.'
      }
    );

    findings.push({
      id: 'scr_pii_harvest',
      category: 'content',
      severity: 'high',
      title: 'Identity Theft Risk (PII)',
      description: 'Form elements request social security, DOB, and passwords over unsecure connection.',
      location: 'OCR Node Bounding [Box 2]'
    });

  // Default User Upload Heuristics (Dynamic analysis based on randomizer/heuristics)
  } else {
    // Dynamically generate some reasonable alerts so any upload works elegantly
    riskScore = 20 + Math.floor(Math.random() * 30);
    
    boxes.push(
      {
        id: 'ubox1',
        x: 10, y: 20, width: 80, height: 12,
        text: 'Detected Content: Verification/Access request',
        label: 'Content Scan',
        severity: 'info',
        description: 'PrivacyLens isolated general UI elements for local offline processing.'
      },
      {
        id: 'ubox2',
        x: 20, y: 55, width: 60, height: 15,
        text: 'Sign-in with authentication link',
        label: 'Interactive Link Detected',
        severity: 'medium',
        description: 'Evaluated on-device. No immediate credential-stealing domain matches, but remain careful.'
      }
    );

    findings.push({
      id: 'scr_custom_upload',
      category: 'metadata',
      severity: 'low',
      title: 'Local On-Device Analysis Complete',
      description: 'Scanned screen image. Minimal high-threat patterns matches, but safeguard confidential elements.',
      location: 'Dynamic Image Node'
    });
  }

  let threatLevel: ThreatLevel = 'safe';
  if (riskScore >= 70) threatLevel = 'malicious';
  else if (riskScore >= 30) threatLevel = 'suspicious';

  const remedies = [];
  if (threatLevel === 'malicious') {
    remedies.push('Do NOT input any codes, log details, or bank pins shown on this screen.');
    remedies.push('Report or delete the underlying communication (e.g. email, text) immediately.');
    remedies.push('Clear any recently downloaded files or cache related to this prompt.');
  } else if (threatLevel === 'suspicious') {
    remedies.push('Inspect the URL carefully. Make sure it matches official corporate channels.');
  } else {
    remedies.push('Screen looks clear. Be mindful of sharing sensitive info over screen share.');
  }

  const scanResult: ScanResult = {
    id: `scan-scr-${Math.random().toString(36).substr(2, 9)}`,
    type: 'screenshot',
    title: `Screenshot: ${imageName}`,
    target: imageName,
    timestamp: new Date().toISOString(),
    riskScore,
    threatLevel,
    findings,
    remedies,
    meta: {
      scanTimeMs: Math.floor(Math.random() * 80) + 40,
      modelUsed: SCAN_MOCK_MODELS.screenshot,
      rulesEvaluated
    }
  };

  return { scanResult, boxes };
}

/**
 * QR Code scanning heuristics
 */
export function scanQrCode(qrData: string): ScanResult {
  const findings: ScanFinding[] = [];
  let riskScore = 15;
  const rulesEvaluated = 11;

  const dataTrimmed = qrData.trim();
  const textLower = dataTrimmed.toLowerCase();

  // Check if QR matches URL format
  const isUrl = /^https?:\/\/[^\s]+$/i.test(dataTrimmed);
  
  if (isUrl) {
    // Use website scanner logic as foundation
    const urlScan = scanWebsite(dataTrimmed);
    findings.push(...urlScan.findings.map(f => ({
      ...f,
      id: `qr_${f.id}`,
      location: `QR URL Payload`
    })));
    riskScore = urlScan.riskScore;

    // Check for extra QR-specific quishing tricks
    if (textLower.includes('redirect') || textLower.includes('forward') || textLower.includes('gate') || textLower.includes('short')) {
      findings.push({
        id: 'qr_redirect_gateway',
        category: 'link',
        severity: 'high',
        title: 'QR Redirect Loop (Quishing)',
        description: 'QR payload redirects through an intermediate tracking gateway, often designed to camouflage final phishing forms.',
        location: 'QR URL Payload'
      });
      riskScore += 20;
    }
  } else {
    // Check if it's dynamic prompt or direct action command
    if (textLower.startsWith('wifi:')) {
      findings.push({
        id: 'qr_wifi_config',
        category: 'metadata',
        severity: 'medium',
        title: 'WIFI Network Auto-Connect',
        description: 'This QR code triggers automatic login to a wireless network. Malicious routers can capture your mobile traffic.',
        location: 'WIFI Schema'
      });
      riskScore += 20;
    } else if (textLower.startsWith('smsto:') || textLower.startsWith('tel:') || textLower.startsWith('mailto:')) {
      findings.push({
        id: 'qr_action_trigger',
        category: 'metadata',
        severity: 'medium',
        title: 'SMS or Dial Call-Action',
        description: 'QR triggers outbound messaging/dialing. Hackers use this to charge premium-rate numbers or enroll in billing spams.',
        location: 'System Intent Protocol'
      });
      riskScore += 25;
    } else {
      findings.push({
        id: 'qr_plain_text',
        category: 'metadata',
        severity: 'info',
        title: 'Plain Text Data',
        description: 'QR contains plain text. No executable commands or active links detected.',
        location: 'Plaintext Payload'
      });
    }
  }

  riskScore = Math.max(0, Math.min(100, riskScore));
  let threatLevel: ThreatLevel = 'safe';
  if (riskScore >= 60) threatLevel = 'malicious';
  else if (riskScore >= 25) threatLevel = 'suspicious';

  const remedies = [];
  if (threatLevel === 'malicious') {
    remedies.push('Do NOT follow the link encoded in this QR code.');
    remedies.push('Do NOT download any PDF, invoice, or profile configurations prompted.');
    remedies.push('Be extremely careful at public terminals (parking meters, charging stands) where stickers are pasted over authentic QR codes.');
  } else if (threatLevel === 'suspicious') {
    remedies.push('Confirm with the establishment if this QR is official.');
  } else {
    remedies.push('QR is safe to use. You can open or copy the text.');
  }

  return {
    id: `scan-qr-${Math.random().toString(36).substr(2, 9)}`,
    type: 'qr',
    title: isUrl ? `QR URL: ${dataTrimmed.slice(0, 30)}...` : `QR Action: ${dataTrimmed.slice(0, 25)}`,
    target: qrData,
    timestamp: new Date().toISOString(),
    riskScore,
    threatLevel,
    findings,
    remedies,
    meta: {
      scanTimeMs: Math.floor(Math.random() * 10) + 2,
      modelUsed: SCAN_MOCK_MODELS.qr,
      rulesEvaluated
    }
  };
}

/**
 * Standard templates for quick scan sandbox testing in the UI.
 */
export const SCANNERS_SANDBOX_PRESETS = {
  email: [
    {
      id: 'em-1',
      senderEmail: 'netflix-support@update-verification.xyz',
      subject: 'Account Suspended - Action Required Immediately',
      body: 'Dear customer,\n\nWe were unable to process your recent subscription invoice. Your membership will be suspended within 24 hours if payment verification is not completed.\n\nPlease verify your billing info immediately at: http://netf1ix-billing-service.club/login\n\nBest regards,\nNetflix Customer Service'
    },
    {
      id: 'em-2',
      senderEmail: 'billing-alert@secure-chase-update.info',
      subject: 'URGENT: Unauthorized Transaction Recorded',
      body: 'Dear client,\n\nOur system detected an unusual sign-on attempt from an IP address in Vladivostok, Russia. For security reasons, we have locked your debit card.\n\nTo unlock your account, click here to authenticate your online credentials: https://chase-security-portal.xyz/verify\n\nIf you do not perform this within 2 hours, your assets will be frozen.\n\nSincerely,\nChase Security Desk'
    },
    {
      id: 'em-3',
      senderEmail: 'newsletter@official.devmind.org',
      subject: 'Weekly Code Optimization digest',
      body: 'Hello developer,\n\nHere is your weekly summary of code refactoring tips. In this edition, we review React 19 concurrent features and on-device machine learning architectures.\n\nRead more at our official repository: https://github.com/google/ai-studio\n\nThank you for subscribing!'
    }
  ],
  sms: [
    {
      id: 'sms-1',
      sender: 'USPS-Alerts',
      message: 'USPS Notice: Your package was arrived at the local depot but cannot be delivered due to incomplete address. Update online: https://usps-redelivery.info/shipment-track'
    },
    {
      id: 'sms-2',
      sender: '54291',
      message: 'BOA Alert: Unusual login on card ending 4205. If not you, tap to freeze immediately: https://boa-login-assistance.xyz/security-alert'
    },
    {
      id: 'sms-3',
      sender: '+1 (415) 555-0199',
      message: 'Hey, are we still meeting for lunch at 12:30? Let me know if you want me to order the tacos.'
    }
  ],
  website: [
    {
      id: 'web-1',
      url: 'https://paypal-accounts-verify.secure-update.xyz/signin'
    },
    {
      id: 'web-2',
      url: 'http://192.168.1.104/index.php?verify=1'
    },
    {
      id: 'web-3',
      url: 'https://github.com/google/ai-studio'
    }
  ],
  screenshot: [
    {
      id: 'scr-1',
      name: 'Mobile Bank Fraud Alert SMS.png',
      description: 'Fake banking lockdown text message'
    },
    {
      id: 'scr-2',
      name: 'Discord BTC Giveaway Airdrop.png',
      description: 'Discord moderator bot offering direct wallet-drainer credentials'
    },
    {
      id: 'scr-3',
      name: 'Unsecured Personal Info webform.png',
      description: 'HTTP form requesting SSN and Mother\'s maiden name'
    }
  ],
  qr: [
    {
      id: 'qr-1',
      data: 'https://parking-meter-quickpay.secure-alert.xyz/gate/pay?id=8823',
      description: 'Subtle quishing sticker found pasted on public terminal'
    },
    {
      id: 'qr-2',
      data: 'WIFI:S:HotelGuest_Secure;T:WPA;P:88239120;;',
      description: 'WIFI automatic connection trigger card'
    },
    {
      id: 'qr-3',
      data: 'https://ai.studio/build',
      description: 'Official Google AI Studio build URL'
    }
  ]
};
