import { Capacitor } from "@capacitor/core";

const PUBLIC_APP_ORIGIN = "https://www.qrmingle.com";

export function getPublicAppOrigin(): string {
  if (typeof window === "undefined") return PUBLIC_APP_ORIGIN;

  const { hostname, origin, protocol } = window.location;
  const isNative = Capacitor.isNativePlatform();
  const isBundledOrigin = protocol === "capacitor:" || protocol === "file:" || !origin || origin === "null";

  if (isNative || isBundledOrigin) return PUBLIC_APP_ORIGIN;
  if (hostname === "qrmingle.com" || hostname === "www.qrmingle.com") return PUBLIC_APP_ORIGIN;

  return origin.replace(/\/$/, "");
}

export function getPublicProfileUrl(slug: string): string {
  const cleanSlug = String(slug || "")
    .replace(/^\/+/, "")
    .replace(/^p\//, "");

  return `${getPublicAppOrigin()}/p/${encodeURIComponent(cleanSlug)}`;
}
