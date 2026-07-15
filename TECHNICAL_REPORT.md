# Technical Report

# PrivacyLens AI – Technical Report

## Project Overview

PrivacyLens AI is an offline-first cybersecurity assistant designed to detect phishing emails, malicious URLs, fraudulent QR codes, scam SMS messages, and suspicious screenshots using browser-based Artificial Intelligence. The primary objective is to provide privacy-preserving threat detection by executing AI inference locally on the user's device rather than relying on cloud-hosted AI services.

The application combines modern frontend technologies with browser-compatible machine learning frameworks to deliver secure, low-latency cybersecurity assistance while maintaining user privacy.

---

# Objectives

The project was designed with the following objectives:

- Detect common phishing attacks using on-device AI.
- Preserve user privacy by avoiding cloud inference.
- Provide offline functionality through Progressive Web App technologies.
- Deliver explainable threat analysis and risk scoring.
- Maintain a responsive user experience on commodity hardware.

---

# AI Runtime

PrivacyLens AI performs inference directly inside the browser.

## Runtime

- Browser JavaScript Runtime
- WebAssembly (WASM)
- Transformers.js Runtime

The browser executes the AI model locally after it has been downloaded and cached.

---

# AI Model

## Model

Xenova/distilbert-base-uncased-finetuned-sst-2-english

## Framework

Transformers.js

## Inference Location

Client-side (Browser)

No cloud inference is required during normal application usage after the model has been cached.

---

# Supported Detection Modules

PrivacyLens AI currently includes the following modules:

- Email Phishing Analyzer
- SMS Smishing Shield
- Website Typosquat Scanner
- QR Quishing Guard
- Screenshot Vision OCR
- Threat Intelligence Dashboard

Each module performs local analysis and contributes to the overall threat assessment.

---

# Browser Technologies

The project leverages several modern browser capabilities.

| Technology | Purpose |
|------------|---------|
| Service Worker | Offline support |
| IndexedDB | Local storage |
| Cache API | Model and asset caching |
| Progressive Web App | Installable application |
| WebAssembly | Efficient AI execution |

---

# Optimization Techniques

The application includes several optimizations to improve responsiveness.

## Local Model Caching

AI models are downloaded once and stored locally, reducing repeated network requests.

---

## Offline Asset Caching

Static resources are cached through the Service Worker, allowing the application to continue functioning without internet connectivity.

---

## Modular Component Design

Independent React components minimize unnecessary rendering and improve maintainability.

---

## Lazy Loading

Application modules are loaded as required, reducing initial load time.

---

# Model Size

The application uses a pretrained transformer model distributed through Transformers.js.

The exact download size depends on the model version and packaging used by the runtime.

No modifications are made to the pretrained weights.

---

# Inference Performance

Formal benchmarking has **not** been performed.

Observed performance during development indicates that threat analysis completes within an interactive time frame on modern desktop browsers.

Actual inference time depends on:

- Browser
- CPU performance
- Available memory
- Input size
- Device capabilities

---

# Hardware Utilization

PrivacyLens AI primarily utilizes:

- CPU
- Browser JavaScript Engine
- WebAssembly Runtime

No dedicated GPU or NPU is required for standard operation.

Future versions may support WebGPU acceleration where available.

---

# Peak Memory Usage

Formal memory profiling has not yet been conducted.

Memory consumption depends primarily on:

- Loaded AI model
- Browser implementation
- Input size
- Cached application assets

---

# Test Environment

Development and functional testing were performed using the following environment.

## Operating System

- Windows 11

## Browser

- Google Chrome (Latest Stable Release)

Additional browser compatibility is expected for:

- Microsoft Edge
- Mozilla Firefox
- Chromium-based browsers

---

# Application Workflow

```
User Input

↓

Input Validation

↓

Local AI Processing

↓

Threat Detection

↓

Risk Score Generation

↓

Explainable AI Output

↓

Dashboard Visualization

↓

Optional Local Storage
```

---

# Offline Capability

The application supports offline execution after the required resources have been cached.

Available offline:

- Email Scanner
- SMS Scanner
- URL Scanner
- QR Scanner
- Screenshot Scanner
- Threat Dashboard
- Local Scan History

Internet connectivity is required only for:

- Initial application download
- Initial AI model download
- Future application updates

---

# Current Limitations

Current limitations include:

- Performance depends on client hardware.
- OCR accuracy depends on screenshot quality.
- Browser resource availability influences inference speed.
- Detection is limited to supported phishing patterns and heuristics.
- Formal benchmark evaluation has not yet been completed.

---

# Future Optimizations

Future development may include:

- Quantized transformer models
- ONNX Runtime Web integration
- WebGPU acceleration
- Browser NPU utilization
- Incremental model loading
- Improved OCR pipeline
- Additional multilingual models

---

# Engineering Highlights

PrivacyLens AI demonstrates several engineering principles:

- Offline-first architecture
- Browser-native AI inference
- Privacy-preserving computation
- Modular React architecture
- Progressive Web App support
- Local model execution
- Explainable threat analysis

---

# Conclusion

PrivacyLens AI demonstrates that modern browser technologies can support practical cybersecurity applications powered by on-device Artificial Intelligence. By combining browser-based machine learning, offline capabilities, and privacy-first design principles, the system provides an efficient and secure alternative to cloud-dependent phishing detection platforms while ensuring that sensitive user information remains under the user's control.
