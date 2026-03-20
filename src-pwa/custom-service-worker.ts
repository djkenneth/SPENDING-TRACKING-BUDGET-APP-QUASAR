/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.config file > pwa > workboxMode is set to "InjectManifest"
 */

declare const self: ServiceWorkerGlobalScope &
  typeof globalThis & {
    skipWaiting(): Promise<void>;
    clients: {
      matchAll(options?: { includeUncontrolled?: boolean; type?: string }): Promise<
        Array<{ postMessage(message: unknown): void }>
      >;
    };
  };

import { clientsClaim } from 'workbox-core';
import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
} from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';

void self.skipWaiting();
clientsClaim();

// Use with precache injection
precacheAndRoute(self.__WB_MANIFEST);

cleanupOutdatedCaches();

// Non-SSR fallbacks to index.html
// Production SSR fallbacks to offline.html (except for dev)
if (process.env.MODE !== 'ssr' || process.env.PROD) {
  registerRoute(
    new NavigationRoute(
      createHandlerBoundToURL(process.env.PWA_FALLBACK_HTML),
      { denylist: [new RegExp(process.env.PWA_SERVICE_WORKER_REGEX), /workbox-(.)*\.js$/] }
    )
  );
}

// ─── App Data Cleanup ─────────────────────────────────────────────────────────

/**
 * Clears all caches managed by this service worker and notifies all open
 * clients to clear their localStorage.  Called when the page sends a
 * CLEAR_ALL_DATA message (e.g. user-initiated reset or app uninstall flow).
 */
async function clearAllData() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map((name) => caches.delete(name)));

  const clientList = await self.clients.matchAll({ includeUncontrolled: true });
  clientList.forEach((client) => client.postMessage({ type: 'CLEAR_LOCAL_STORAGE' }));
}

self.addEventListener('message', (event) => {
  const swEvent = event as unknown as { data?: { type: string }; waitUntil(p: Promise<unknown>): void };
  if (swEvent.data?.type === 'CLEAR_ALL_DATA') {
    swEvent.waitUntil(clearAllData());
  }
});
