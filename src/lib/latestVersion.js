import { useEffect, useState } from "react";
import { fetchWithAuth, parseApiResponse } from "./api";

const LATEST_VERSION_ENDPOINT = import.meta.env.VITE_LATEST_VERSION_ENDPOINT || "/api/latest-version";
const latestCache = new Map();

function buildLatestVersionUrl(channel) {
  if (!channel) return LATEST_VERSION_ENDPOINT;
  const url = new URL(LATEST_VERSION_ENDPOINT, window.location.origin);
  url.searchParams.set("channel", channel);
  return url.toString().replace(window.location.origin, "");
}

async function fetchLatestVersion(useAuth, channel) {
  if (!LATEST_VERSION_ENDPOINT) {
    return { version: null, url: null };
  }
  const cacheKey = channel || "stable";
  if (latestCache.has(cacheKey)) return latestCache.get(cacheKey);
  const endpoint = buildLatestVersionUrl(channel);
  const res = useAuth
    ? await fetchWithAuth(endpoint)
    : await fetch(endpoint);
  const parsed = await parseApiResponse(res);
  if (!parsed.ok || parsed.data?.ok === false) {
    return { version: null, url: null };
  }
  const payload = parsed.data?.data || parsed.data || {};
  const result = {
    version: payload.version || payload.tag || null,
    url: payload.url || payload.download_url || null,
    channel: payload.channel || channel || null,
  };
  latestCache.set(cacheKey, result);
  return result;
}

export function useLatestVersion({ useAuth = false, enabled = true, channel } = {}) {
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !LATEST_VERSION_ENDPOINT) {
      setLatest(null);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    fetchLatestVersion(useAuth, channel)
      .then((data) => {
        if (active) setLatest(data);
      })
      .catch(() => {
        if (active) setLatest(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [useAuth, enabled, channel]);

  return { latest, loading };
}
