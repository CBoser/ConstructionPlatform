import { useState, useEffect } from 'react';

/**
 * PWA Update Prompt Component
 * Shows a notification when a new version of the app is available
 *
 * Note: This component works with the service worker registered in App.tsx.
 * When a new version is detected, it will show this prompt to the user.
 */
export function PWAUpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleControllerChange = () => {
      // New service worker has taken control, reload for fresh content
      window.location.reload();
    };

    const handleStateChange = (registration: ServiceWorkerRegistration) => {
      if (registration.waiting) {
        setWaitingWorker(registration.waiting);
        setShowPrompt(true);
      }
    };

    // Check for updates on existing registrations
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (!registration) return;

      // Check if there's already a waiting worker
      if (registration.waiting) {
        setWaitingWorker(registration.waiting);
        setShowPrompt(true);
      }

      // Listen for new waiting worker
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              handleStateChange(registration);
            }
          });
        }
      });
    });

    // Listen for controller change
    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div
      className="pwa-update-prompt"
      role="alertdialog"
      aria-labelledby="pwa-update-title"
      aria-describedby="pwa-update-desc"
    >
      <p id="pwa-update-title" className="pwa-update-title">
        Update Available
      </p>
      <p id="pwa-update-desc" className="pwa-update-desc">
        A new version is available. Update now for the latest features.
      </p>
      <div className="pwa-update-actions">
        <button
          type="button"
          onClick={handleUpdate}
          className="btn btn-primary btn-sm"
        >
          Update Now
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="btn btn-ghost btn-sm"
        >
          Later
        </button>
      </div>
    </div>
  );
}

export default PWAUpdatePrompt;
