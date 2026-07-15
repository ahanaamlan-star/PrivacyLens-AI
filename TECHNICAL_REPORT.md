# Technical Report

## Project

PrivacyLens AI

---

## Objective

Develop an offline cybersecurity assistant capable of detecting phishing attempts using on-device artificial intelligence without transmitting user data to external servers.

---

## Runtime

- Browser
- JavaScript
- WebAssembly

---

## AI Framework

- Transformers.js

Model:

- Xenova/distilbert-base-uncased-finetuned-sst-2-english

---

## Detection Modules

- Email Scanner
- SMS Scanner
- URL Scanner
- QR Scanner
- Screenshot OCR

---

## Optimization

- Browser model caching
- Lazy model loading
- Service Worker caching
- Offline inference

---

## Storage

- IndexedDB
- Browser Cache
- Local Storage

---

## Hardware Requirements

Minimum:

- Modern Chromium browser
- Firefox
- Edge

Recommended:

- 8 GB RAM
- Multi-core CPU

---

## Tested Environment

Browser:
Chrome Latest

Operating System:
Windows 11

---

## Known Constraints

Performance depends on:

- Browser resources
- Device CPU
- Available RAM

No GPU is required.

---

## Future Improvements

- Smaller quantized models
- Faster WASM execution
- Mobile optimization
- Native NPU acceleration
