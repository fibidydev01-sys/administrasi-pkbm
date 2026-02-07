"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface SendNotificationOptions {
  title: string;
  body: string;
  url?: string;
  playSound?: boolean;
}

export function useNotification() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Check support
    setIsSupported("Notification" in window && "serviceWorker" in navigator);

    // Get current permission
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }

    // Preload audio
    audioRef.current = new Audio("/notification/notification.mp3");
    audioRef.current.load();
  }, []);

  // Request permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === "granted";
    } catch {
      return false;
    }
  }, [isSupported]);

  // Play notification sound
  const playSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => { });
    }
  }, []);

  // Send notification
  const sendNotification = useCallback(
    async ({ title, body, url = "/", playSound: shouldPlaySound = true }: SendNotificationOptions) => {
      if (!isSupported || permission !== "granted") {
        console.log("Notification not supported or not granted");
        return false;
      }

      try {
        // Play sound
        if (shouldPlaySound) {
          playSound();
        }

        // Check if service worker is ready
        const registration = await navigator.serviceWorker.ready;

        // Show notification via service worker
        await registration.showNotification(title, {
          body,
          icon: "/icon/icon-192x192.png",
          badge: "/icon/icon-72x72.png",
          data: { url },
          tag: `notif-${Date.now()}`,
        });

        return true;
      } catch (error) {
        console.error("Error sending notification:", error);

        // Fallback to regular notification
        try {
          new Notification(title, {
            body,
            icon: "/icon/icon-192x192.png",
          });
          if (shouldPlaySound) playSound();
          return true;
        } catch {
          return false;
        }
      }
    },
    [isSupported, permission, playSound]
  );

  return {
    isSupported,
    permission,
    requestPermission,
    sendNotification,
    playSound,
  };
}