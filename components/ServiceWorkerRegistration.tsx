"use client";

import { useEffect } from "react";
import { withBasePath } from "@/lib/paths";

// Registers the offline service worker in production only, so dev builds are never served stale.
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register(withBasePath("/sw.js")).catch(() => {
      // The app works without offline support.
    });
  }, []);

  return null;
}
