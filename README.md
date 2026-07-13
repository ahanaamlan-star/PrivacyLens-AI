# PrivacyLens AI — Offline Shield

> **PrivacyLens AI** is an advanced, enterprise-grade Offline-First cybersecurity scanning ecosystem and diagnostic dashboard. Running entirely in-browser with Zero Network dependencies, it shields endpoints by analyzing phishing payloads, smishing SMS text signatures, malicious QR codes, URL structure heuristics, and security screenshot scans using local on-device machine learning (Transformers.js / BERT) and advanced NLP parsing logic.

---

## Key Features & Capabilities

*   **⚡ Progressive Web App (PWA) Support**: 100% installable with responsive standalone launch capability, automatic service worker updates, and customizable branding assets.
*   **📡 Offline Cache Integrity**: Cache-First strategy for neural weights combined with Network-First fallback models for application files. The application runs and functions flawlessly without active internet connections.
*   **🧠 Local Model Pre-Caching**: Allows users to download and store the complete BERT transformer model weights (`Xenova/distilbert-base-uncased-finetuned-sst-2-english`) directly into their local browser cache.
*   **📊 Threat Intelligence Analytics Dashboard**: Robust visual graphics built with React & Recharts monitoring threat ratios, chronological scan counts, anomaly alerts, model inference confidence buckets, and engine F1 scores.
*   **📬 Multi-Vector Shield Engines**: Dedicated client scanners for Emails, SMS messages, Website domains, visual screens (OCR/Vision), and raw QR payloads.
*   **🔄 Background Synchronized Ledger**: Safe, delayed integration leveraging W3C Background Sync to push offline threat logs to a decentralized intelligence ledger when connectivity returns.

---

## Project Structure

The codebase is organized in a highly modular, clean, and extensible React with TypeScript architecture:

```text
├── .github/
│   └── workflows/
│       └── deploy.yml          # Automated CI/CD build & test workflow
├── public/
│   ├── icon.svg                # Modern, vector-based cybersecurity logo (maskable)
│   ├── manifest.json           # Web App Manifest for native OS-level installation
│   └── sw.js                   # Advanced Offline Service Worker (Caching, BG Sync, messaging)
├── src/
│   ├── components/
│   │   ├── AnimatedBackground.tsx # Tech-forward retro glowing cyber lines background
│   │   ├── Header.tsx          # Real-time connectivity banner, diagnostic pills, & install triggers
│   │   ├── RiskMeter.tsx       # Dynamic SVG meter representing percentage security threat level
│   │   └── Sidebar.tsx         # Responsive layout controller for navigation across scanner views
│   ├── views/
│   │   ├── AiResults.tsx       # Deep semantic analysis log detailing neural parameters
│   │   ├── Analytics.tsx       # Recharts-driven enterprise dashboard visualizing cyber threats
│   │   ├── Dashboard.tsx       # High-level aggregate widgets, speed indicators, and action triggers
│   │   ├── EmailScanner.tsx    # Email threat parsing and visual content analyzer
│   │   ├── LocalAiClassifier.tsx# BERT-powered local natural language heuristic processing
│   │   ├── QrScanner.tsx       # Direct QR code scan and payload parsing module
│   │   ├── ScanHistory.tsx     # Session activity log detailing flagged incidents
│   │   ├── ScreenshotAnalyzer.tsx # Visually spoofed screen analyzer
│   │   ├── Settings.tsx        # System settings, offline db controls, and model pre-cache buttons
│   │   ├── SmsScanner.tsx      # Core SMS smishing parsing module
│   │   └── WebsiteScanner.tsx  # Dynamic domain reputation heuristic evaluation
│   ├── App.tsx                 # Base controller, network state listener, and route registry
│   ├── index.css               # Global styling, modern font import, and tailwind theme setup
│   ├── main.tsx                # Client mounting file with registration script for Service Worker
│   └── types.ts                # Strict TypeScript system type definitions
├── .dockerignore               # Optimized Docker context exclusion list
├── Dockerfile                  # Multi-stage, low-footprint Docker configuration for local/cloud containers
├── LICENSE                     # MIT License specification file
├── package.json                # Project dependencies and deployment scripts
└── vite.config.ts              # Custom bundling configuration for React + Vite
```

---

## Installation Guide

Follow these simple commands to setup the development environment on your local machine:

### Prerequisites

*   **Node.js**: `v18.0.0` or higher
*   **npm**: `v9.0.0` or higher

### Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/privacylens-ai.git
   cd privacylens-ai
   ```

2. **Install node dependencies**:
   ```bash
   npm install
   ```

3. **Launch the development server**:
   ```bash
   npm run dev
   ```
   *The server will boot up and bind to `http://localhost:3000`.*

---

## Usage Guide

1. **First-Time Visit**: Launch the app. The core service worker will intercept resources and pre-cache all static HTML, CSS, and JS components to prepare for offline capability.
2. **Install to Device**: Look for the glowing **"INSTALL APP"** pill in the top header (or click "Install Native Client" in Settings) to install PrivacyLens directly onto your mobile home-screen or desktop application dock.
3. **Download Model Layers**: Navigate to **Settings** and trigger **"Pre-cache Offline AI Model"**. This will download the ONNX weights of the DistilBERT transformer layer directly into your browser's persistent cache.
4. **Inspect Heuristics & Scans**: Input text, upload screens, paste emails, or analyze urls. Toggle internet connection off. All scanners continue to output results, score threat likelihood, and classify payloads instantaneously with Zero-latency.
5. **Analyze Incidents**: Head to the **Threat Intelligence Command** tab (Analytics) to monitor detailed, beautiful, interactive diagrams indicating threat sources, risk distributions, and WASM runtime latency metrics.

---

## Deployment Instructions

### Standard Production Build

Compile static, minified files directly with Vite:
```bash
npm run build
```
This produces optimized production assets inside the `/dist` directory, fully prepared for server hosting on Cloud Run, Vercel, Netlify, or Github Pages.

### Dockerized Deployment (Production Containers)

Run PrivacyLens inside a lightweight, highly secure, custom Alpine-based Nginx container:

1. **Build the container image**:
   ```bash
   docker build -t privacylens-ai:latest .
   ```

2. **Run the container**:
   ```bash
   docker run -d -p 8080:80 --name privacylens-app privacylens-ai:latest
   ```
   *Access the running web portal by navigating to `http://localhost:8080`.*

---

## Demo Section

Below is a brief functional sequence highlighting on-device offline security processing:

```text
[ USER INPUT (OFFLINE MODE) ]
      │
      ▼
[ LOCAL MODEL COMPILER ] ───► Local Vocab Index matches "paypal-login-secure.com" (PHISHING)
      │
      ▼
[ TRANSFOMERS.JS BERT INFERENCE ] ───► Classifies: "Urgent response required..." (94% threat score)
      │
      ▼
[ INSTANT RISK RATING METER ] ───► Displays alert: "CRITICAL INCIDENT DEFLECTED"
      │
      ▼
[ OFFLINE LEDGER QUEUE ] ───► Stores telemetry in cache, triggers Background Sync
```

---

## Screenshots Section

| Dashboard & Interface | Cybersecurity Metrics |
| :---: | :---: |
| **PWA App Icon Branding** | **Threat Command Analytics** |
| ![Modern Privacy Lens Icon](/public/icon.svg) | *Recharts dynamic Area and Doughnut diagrams representing active real-time cyber threats.* |

---

## Future Scope

1.  **🔍 WebAssembly-Powered YARA Rules**: Run advanced, standard security signature scans against files and packages in complete sandboxed client storage.
2.  **🛰️ Distributed P2P Threat Ledger**: Decentralized offline peer networks syncing threat alerts without central web-servers.
3.  **🎤 Local Vocal Spoof Detection**: Transcribe and analyze incoming spam voice files or phone audio tracks locally to flag audio cloning/phishing.

---

## License

This project is open-source and released under the terms of the [MIT License](/LICENSE).
