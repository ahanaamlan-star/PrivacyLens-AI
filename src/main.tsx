import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register PWA Service Worker for offline support and background sync
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('[PWA] Service Worker registered successfully, scope:', registration.scope);
        
        // Register W3C standard Background Sync if supported
        const regAny = registration as any;
        if ('sync' in regAny) {
          regAny.sync.register('sync-phishing-logs')
            .then(() => console.log('[PWA] Background Sync registered successfully.'))
            .catch((err: any) => console.warn('[PWA] Background Sync registration warning:', err));
        }
      })
      .catch((err) => {
        console.error('[PWA] Service Worker registration failed:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
