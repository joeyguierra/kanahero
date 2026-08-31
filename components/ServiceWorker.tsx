"use client";

// Registers the generated service worker. Production only: in dev there is no
// sw.js, and a stale precache is the last thing a dev loop needs.
//
// Service workers need a secure context — HTTPS or localhost. Served over a
// plain LAN IP this silently does nothing and the app has no offline story.

import { useEffect } from "react";

export default function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // no offline shell this launch; the app still runs from the network
    });
  }, []);

  return null;
}
