import { register } from 'register-service-worker';

// The ready(), registered(), cached(), updatefound() and updated()
// events passes a ServiceWorkerRegistration instance in their arguments.
// ServiceWorkerRegistration: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration

register(process.env.SERVICE_WORKER_FILE, {
  // registrationOptions: { scope: './' },

  ready(registration) {
    // Mark the app as installed in localStorage so we can detect a clean reinstall.
    if (!localStorage.getItem('app_installed')) {
      localStorage.setItem('app_installed', '1');
      localStorage.setItem('app_install_time', Date.now().toString());
    }

    // Listen for the 'appinstalled' event (fired when PWA is added to home screen).
    window.addEventListener('appinstalled', () => {
      localStorage.setItem('app_installed', '1');
      localStorage.setItem('app_install_time', Date.now().toString());
    });

    // Request the SW to clear all data if a CLEAR_ALL_DATA command is needed
    // externally (e.g. via a "Reset App" button in Settings).
    (window as Window & { clearAppData?: () => void }).clearAppData = async () => {
      const sw = registration.active ?? registration.waiting ?? registration.installing;
      if (sw) {
        sw.postMessage({ type: 'CLEAR_ALL_DATA' });
      } else {
        // Fallback: clear directly if SW is not available
        localStorage.clear();
        if ('caches' in window) {
          const names = await caches.keys();
          await Promise.all(names.map((n) => caches.delete(n)));
        }
      }
    };
  },

  registered(/* registration */) {
    // console.log('Service worker has been registered.')
  },

  cached(/* registration */) {
    // console.log('Content has been cached for offline use.')
  },

  updatefound(/* registration */) {
    // console.log('New content is downloading.')
  },

  updated(/* registration */) {
    // console.log('New content is available; please refresh.')
  },

  offline() {
    // console.log('No internet connection found. App is running in offline mode.')
  },

  error(/* err */) {
    // console.error('Error during service worker registration:', err)
  },
});
