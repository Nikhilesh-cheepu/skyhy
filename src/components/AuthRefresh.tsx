"use client";

import { useEffect } from "react";

const REFRESH_INTERVAL_MS = 12 * 60 * 60 * 1000; // 12 hours

/**
 * Keeps the session alive with sliding expiry:
 * - On mount: ping /api/auth/refresh (extends session if < 7 days left).
 * - Every 12 hours: same ping while the tab is open.
 */
export default function AuthRefresh() {
  useEffect(() => {
    function refresh() {
      fetch("/api/auth/refresh", { credentials: "include" }).catch(() => {});
    }

    refresh();
    const id = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return null;
}
