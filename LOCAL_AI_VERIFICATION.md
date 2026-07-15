# Local AI Verification

## Does PrivacyLens AI run locally?

Yes.

All primary threat detection executes entirely inside the user's browser.

---

## Components Executing On Device

✔ Email phishing detection

✔ SMS Smishing detection

✔ URL heuristic analysis

✔ QR payload inspection

✔ Screenshot OCR analysis

✔ Threat scoring

✔ Dashboard generation

---

## Internet Requirements

Internet is required only for:

- First application download
- Initial AI model download (if not already cached)
- Future application updates

No internet connection is required after the model has been cached.

---

## Data Transmission

PrivacyLens AI does not upload:

- Emails
- SMS content
- URLs
- Images
- Screenshots
- QR payloads

during local inference.

---

## Model Execution

Model:

Xenova/distilbert-base-uncased-finetuned-sst-2-english

Framework:

Transformers.js

Runtime:

Browser WebAssembly

---

## Offline Support

Supported through:

- Service Worker
- IndexedDB
- Browser Cache
