// src/components/shared/pwa-install-prompt.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Download, Share, Plus } from "lucide-react";
import Image from "next/image";
import { detectBrowser } from "@/lib/browser-detection";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * PWA Install Prompt Component (Enhanced)
 * Shows platform-specific install instructions
 *
 * Features:
 * - Auto-detect browser & platform using browser-detection helper
 * - Native install button for Chrome/Edge/Android
 * - Manual instructions for iOS Safari
 * - Generic message for unsupported browsers
 * - Dismiss for 7 days (was 3 days)
 * - Enhanced UI with better icons
 * - SOLID background (NO transparency!)
 */
export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [browserInfo, setBrowserInfo] = useState(detectBrowser());

  useEffect(() => {
    const browser = detectBrowser();
    setBrowserInfo(browser);

    // Don't show if already installed
    if (browser.isInStandaloneMode) return;

    // Check if dismissed recently
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysSince = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) return; // Don't show for 7 days after dismiss
    }

    // Listen for beforeinstallprompt (Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show after 15 seconds (increased from 10s)
      setTimeout(() => {
        setShowPrompt(true);
      }, 15000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // For iOS Safari - show manual instructions
    if (browser.isIOS && browser.isSafari) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 15000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("✅ PWA installed");
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
    setShowPrompt(false);
  };

  if (!showPrompt || browserInfo.isInStandaloneMode) return null;

  return (
    <div
      className="fixed bottom-20 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-96 animate-in slide-in-from-bottom-5 duration-300"
      style={{ pointerEvents: 'auto' }}
    >
      <div
        className="rounded-xl shadow-2xl border-2 border-green-200 p-4"
        style={{
          backgroundColor: '#ffffff',
          opacity: 1,
        }}
      >
        <div className="flex gap-3">
          {/* App Icon */}
          <div className="flex-shrink-0">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-green-50 flex items-center justify-center border border-green-200">
              <Image
                src="/icon/icon-192x192.png"
                alt="App Icon"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-sm text-gray-900">Install Aplikasi</p>
                <p className="text-xs text-gray-600">
                  Absensi Yayasan Al Barakah
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Chrome/Android/Desktop - Auto Install */}
            {deferredPrompt && !browserInfo.isIOS && (
              <>
                <p className="text-xs text-gray-600 mb-3">
                  Akses lebih cepat tanpa browser, gunakan offline, dan dapatkan notifikasi
                </p>
                <Button
                  onClick={handleInstallClick}
                  size="sm"
                  className="w-full gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Download className="h-4 w-4" />
                  Install Sekarang
                </Button>
              </>
            )}

            {/* iOS Safari - Manual Instructions */}
            {browserInfo.isIOS && browserInfo.isSafari && (
              <div className="space-y-3">
                <p className="text-xs text-gray-600">
                  Untuk install di iPhone/iPad:
                </p>
                <ol className="space-y-2">
                  <li className="flex items-start gap-2 text-xs">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-green-700">1</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700">
                        Tap tombol <Share className="h-3 w-3 inline mx-1" />
                        <strong className="text-gray-900">Share</strong> di bawah
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 text-xs">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-green-700">2</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700">
                        Scroll dan pilih{" "}
                        <Plus className="h-3 w-3 inline mx-1" />
                        <strong className="text-gray-900">"Add to Home Screen"</strong>
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 text-xs">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-green-700">3</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700">
                        Tap <strong className="text-gray-900">"Add"</strong> di kanan atas
                      </p>
                    </div>
                  </li>
                </ol>
                <Button
                  onClick={handleDismiss}
                  size="sm"
                  variant="outline"
                  className="w-full mt-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Mengerti
                </Button>
              </div>
            )}

            {/* Other browsers - Generic message */}
            {!deferredPrompt && !browserInfo.isIOS && (
              <>
                <p className="text-xs text-gray-600 mb-3">
                  Gunakan Chrome, Edge, atau Safari untuk install aplikasi ini
                </p>
                <Button
                  onClick={handleDismiss}
                  size="sm"
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Mengerti
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
