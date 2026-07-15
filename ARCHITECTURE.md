# PrivacyLens AI Architecture

## Overview

PrivacyLens AI is an offline-first cybersecurity application that performs phishing and threat analysis directly inside the user's browser using on-device AI. The application is designed so that user data never leaves the device during normal threat analysis.

---

## High Level Architecture

                    +----------------------+
                    |      User Input      |
                    |----------------------|
                    | Email               |
                    | SMS                 |
                    | Website URL         |
                    | Screenshot          |
                    | QR Code             |
                    +----------+----------+
                               |
                               v
                    +----------------------+
                    | React Frontend (UI) |
                    +----------+----------+
                               |
                               v
                  +---------------------------+
                  | Local AI Processing Layer |
                  |---------------------------|
                  | Transformers.js           |
                  | DistilBERT                |
                  | Heuristic Rules           |
                  | URL Analysis              |
                  | OCR Processing            |
                  +----------+----------------+
                             |
              +--------------+--------------+
              |                             |
              v                             v
      Local Storage                 Visualization Layer
    (IndexedDB / Cache)         (Charts & Threat Dashboard)

---

## System Components

### User Interface

- React
- TypeScript
- Tailwind CSS
- Responsive Dashboard

---

### AI Processing Layer

Responsible for:

- Email phishing detection
- SMS Smishing detection
- URL heuristic analysis
- Screenshot OCR analysis
- QR payload inspection

Inference executes entirely inside the browser.

---

### Offline Layer

- Service Worker
- Browser Cache
- IndexedDB
- Background Sync

Allows continued operation without internet connectivity.

---

### Analytics Layer

Provides:

- Threat dashboard
- Detection history
- Confidence metrics
- Incident summaries

---

## Data Flow

User Input

↓

Local Processing

↓

On-device AI Inference

↓

Threat Classification

↓

Local Storage

↓

Dashboard Visualization

---

## Design Decisions

- Offline-first architecture
- Zero cloud inference
- Privacy-preserving design
- Modular React components
- Progressive Web App support
- Local model caching
