// src/lib/browser-detection.ts
/**
 * Browser Detection & Capability Helper
 * Detects browser type, platform, and PWA capabilities
 */

export interface BrowserInfo {
  name: string;
  isIOS: boolean;
  isAndroid: boolean;
  isSafari: boolean;
  isChrome: boolean;
  isFirefox: boolean;
  isEdge: boolean;
  isInStandaloneMode: boolean;
  canInstall: boolean;
}

/**
 * Detect browser type and capabilities
 * @returns BrowserInfo object with detection results
 */
export function detectBrowser(): BrowserInfo {
  // Server-side rendering check
  if (typeof window === "undefined") {
    return {
      name: "unknown",
      isIOS: false,
      isAndroid: false,
      isSafari: false,
      isChrome: false,
      isFirefox: false,
      isEdge: false,
      isInStandaloneMode: false,
      canInstall: false,
    };
  }

  const userAgent = window.navigator.userAgent.toLowerCase();

  // Platform detection
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);

  // Browser detection
  const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
  const isChrome = /chrome/i.test(userAgent) && !/edge/i.test(userAgent);
  const isFirefox = /firefox/i.test(userAgent);
  const isEdge = /edg/i.test(userAgent);

  // Check if already installed (PWA standalone mode)
  const isInStandaloneMode =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true;

  // Determine browser name
  let name = "unknown";
  if (isChrome) name = "Chrome";
  else if (isSafari) name = "Safari";
  else if (isFirefox) name = "Firefox";
  else if (isEdge) name = "Edge";

  // Can install PWA (not iOS Safari, not already installed)
  const canInstall = !isInStandaloneMode && (!isIOS || !isSafari);

  return {
    name,
    isIOS,
    isAndroid,
    isSafari,
    isChrome,
    isFirefox,
    isEdge,
    isInStandaloneMode,
    canInstall,
  };
}

/**
 * Check if browser supports PWA features
 */
export function isPWASupported(): boolean {
  if (typeof window === "undefined") return false;

  return (
    "serviceWorker" in navigator &&
    "caches" in window &&
    "PushManager" in window
  );
}

/**
 * Check if device is mobile
 */
export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;

  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    navigator.userAgent.toLowerCase()
  );
}

/**
 * Get platform name for display
 */
export function getPlatformName(): string {
  const browser = detectBrowser();

  if (browser.isIOS) return "iOS";
  if (browser.isAndroid) return "Android";
  return "Desktop";
}
