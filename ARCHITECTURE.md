# PrivacyLens AI Architecture

## Overview

PrivacyLens AI is an offline-first cybersecurity application designed to detect phishing attempts, malicious URLs, scam SMS messages, fraudulent QR codes, and suspicious screenshots using on-device Artificial Intelligence. Unlike traditional cloud-based cybersecurity solutions, PrivacyLens AI performs threat analysis entirely inside the user's browser, ensuring that sensitive user information never leaves the device during normal inference.

The application combines browser-based machine learning, heuristic analysis, Progressive Web App (PWA) capabilities, and local storage technologies to provide a privacy-preserving cybersecurity assistant that remains functional even without an internet connection.

---

# High-Level System Architecture

```
                          +-----------------------+
                          |      User Input       |
                          |-----------------------|
                          |  Email               |
                          |  SMS                 |
                          |  Website URL         |
                          |  QR Code             |
                          |  Screenshot          |
                          +----------+-----------+
                                     |
                                     v
                        +--------------------------+
                        |     React Frontend       |
                        |--------------------------|
                        |  UI Components           |
                        |  Dashboard               |
                        |  User Interaction        |
                        +-----------+--------------+
                                    |
                                    v
                     +-------------------------------+
                     | Local AI Processing Pipeline  |
                     |-------------------------------|
                     | Transformers.js              |
                     | DistilBERT Model             |
                     | URL Heuristics              |
                     | OCR Analysis                |
                     | Pattern Matching            |
                     +-----------+------------------+
                                 |
                +----------------+----------------+
                |                                 |
                v                                 v
     Local Browser Storage             Analytics Dashboard
 (IndexedDB / Cache Storage)         (Charts & Reports)
```

---

# System Components

## 1. User Interface

The frontend is built using React and TypeScript with a responsive cybersecurity-themed dashboard.

Responsibilities include:

- User interaction
- Scanner interfaces
- Dashboard visualization
- Threat summaries
- Offline status monitoring
- Installation as a Progressive Web App

---

## 2. Local AI Processing Layer

This layer performs the core intelligence of the application.

Responsibilities include:

- Email phishing detection
- SMS smishing detection
- Website URL analysis
- QR payload inspection
- Screenshot OCR analysis
- Threat classification
- Risk scoring

Inference is executed entirely inside the browser.

---

## 3. Threat Detection Engine

The threat engine combines multiple techniques to classify suspicious content.

Detection methods include:

- Transformer-based language understanding
- Keyword analysis
- URL heuristic evaluation
- Domain structure inspection
- Pattern matching
- OCR text extraction
- Confidence scoring

---

## 4. Offline Storage Layer

PrivacyLens AI stores only local application data.

Storage technologies include:

- IndexedDB
- Browser Cache Storage
- Local Storage
- Service Worker Cache

This enables:

- Offline usage
- Faster application startup
- AI model caching
- Local scan history

---

## 5. Analytics Layer

The analytics dashboard summarizes scan activity and provides visual insights.

It includes:

- Threat distribution
- Incident history
- Confidence metrics
- Detection statistics
- Security posture indicators

---

# AI Processing Pipeline

The AI pipeline follows the sequence below.

```
User Input

      │

      ▼

Input Validation

      │

      ▼

Local Feature Extraction

      │

      ▼

Transformers.js Runtime

      │

      ▼

DistilBERT Inference

      │

      ▼

Heuristic Rule Evaluation

      │

      ▼

Threat Classification

      │

      ▼

Risk Score Generation

      │

      ▼

Dashboard Visualization

      │

      ▼

Optional Local Storage
```

---

# Data Flow

The application processes user input locally without transmitting sensitive content to external servers.

```
User

↓

React Interface

↓

On-device AI

↓

Threat Detection

↓

Risk Assessment

↓

Dashboard

↓

IndexedDB (optional)
```

---

# Local vs Cloud Components

| Component | Local | Cloud |
|-----------|:-----:|:-----:|
| React UI | ✅ | ❌ |
| Email Scanner | ✅ | ❌ |
| SMS Scanner | ✅ | ❌ |
| URL Scanner | ✅ | ❌ |
| QR Scanner | ✅ | ❌ |
| Screenshot OCR | ✅ | ❌ |
| DistilBERT Model | ✅ | ❌ |
| Threat Dashboard | ✅ | ❌ |
| Service Worker | ✅ | ❌ |
| Initial Application Download | ❌ | ✅ |
| Initial Model Download | ❌ | ✅ |

---

# Storage Architecture

PrivacyLens AI uses browser-native storage mechanisms.

## IndexedDB

Used for:

- Local scan history
- Threat logs
- User preferences

---

## Cache Storage

Used for:

- Application assets
- AI model files
- Static resources

---

## Service Worker

Provides:

- Offline functionality
- Asset caching
- Background synchronization
- Progressive Web App support

---

# Design Decisions

Several design decisions were made during development.

### Offline-first

The application is designed to remain functional without internet connectivity once the required resources have been cached.

### Privacy-first

Threat analysis executes entirely on the user's device, minimizing exposure of sensitive information.

### Modular Architecture

Each scanner is implemented as an independent React component, making the system easier to maintain and extend.

### Progressive Web App

The application supports installation as a native-like application using standard browser capabilities.

### Browser-native AI

Instead of relying on cloud APIs for inference, PrivacyLens AI performs inference using browser-compatible machine learning runtimes.

---

# Scalability

The modular architecture allows future extensions, including:

- Voice phishing detection
- Malware attachment analysis
- Browser extension support
- Enterprise reporting
- Additional transformer models

---

# Future Architecture Improvements

Future versions may introduce:

- Quantized transformer models
- ONNX Runtime Web optimizations
- WebGPU acceleration
- Hardware NPU support
- Federated learning approaches
- Expanded offline security modules

---

# Architecture Summary

PrivacyLens AI demonstrates how modern browser technologies, local AI inference, and privacy-preserving design principles can be combined to build an offline cybersecurity platform. By executing threat detection entirely on-device, the system minimizes privacy risks while maintaining responsive, real-time analysis and an intuitive user experience.
