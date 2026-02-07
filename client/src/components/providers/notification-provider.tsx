"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useNotification } from "@/hooks/use-notification";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores";

interface NotificationContextType {
  permission: NotificationPermission;
  isSupported: boolean;
  requestPermission: () => Promise<boolean>;
  sendNotification: (options: {
    title: string;
    body: string;
    url?: string;
    playSound?: boolean;
  }) => Promise<boolean>;
  playSound: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { permission, isSupported, requestPermission, sendNotification, playSound } = useNotification();
  const guru = useAuthStore((state) => state.guru);
  const [swRegistered, setSwRegistered] = useState(false);

  // Register service worker
  useEffect(() => {
    if ("serviceWorker" in navigator && !swRegistered) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered:", registration.scope);
          setSwRegistered(true);
        })
        .catch((error) => {
          console.log("SW registration failed:", error);
        });
    }
  }, [swRegistered]);

  // Listen for realtime absensi (admin only)
  useEffect(() => {
    if (!guru?.is_admin || permission !== "granted") return;

    const supabase = createClient();

    const channel = supabase
      .channel("absensi-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "absensi",
        },
        async (payload) => {
          const absensi = payload.new as any;

          // Skip if it's auto-complete
          if (absensi.status === "auto") return;

          // Fetch guru name
          const { data: guruData } = await supabase
            .from("guru")
            .select("nama")
            .eq("id", absensi.guru_id)
            .single();

          const namaGuru = guruData?.nama || "Guru";
          const tipe = absensi.tipe === "masuk" ? "Masuk" : "Pulang";
          const waktu = new Date(absensi.timestamp).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Jakarta",
          });

          sendNotification({
            title: `Absen ${tipe}`,
            body: `${namaGuru} telah absen ${tipe.toLowerCase()} pukul ${waktu}`,
            url: "/admin/rekap",
            playSound: true,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [guru?.is_admin, permission, sendNotification]);

  return (
    <NotificationContext.Provider
      value={{
        permission,
        isSupported,
        requestPermission,
        sendNotification,
        playSound,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    // Return default values if not in provider
    return {
      permission: "default" as NotificationPermission,
      isSupported: false,
      requestPermission: async () => false,
      sendNotification: async () => false,
      playSound: () => { },
    };
  }
  return context;
}