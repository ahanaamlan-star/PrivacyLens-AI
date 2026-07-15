# Privacy and Safety

## Privacy Principles

PrivacyLens AI follows a privacy-first architecture.

Sensitive user information remains on the user's device during analysis.

---

## Data Handling

The application processes:

- Email text
- SMS messages
- URLs
- QR Codes
- Screenshots

locally inside the browser.

---

## Storage

Threat history may be stored locally using:

- IndexedDB
- Browser Cache

No remote database is required for standard operation.

---

## Permissions

The application may request:

- Camera access (QR Scanner)
- File upload (Screenshot Scanner)

Permissions are optional and user-controlled.

---

## Security

The application:

- Uses HTTPS when deployed
- Executes AI locally
- Minimizes network communication

---

## Limitations

PrivacyLens AI is designed as a decision-support system.

Users should verify critical security decisions independently.
