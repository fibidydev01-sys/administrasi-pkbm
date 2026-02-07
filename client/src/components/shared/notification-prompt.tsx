"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, X } from "lucide-react";
import { useNotificationContext } from "@/components/providers";

export function NotificationPrompt() {
  const { permission, isSupported, requestPermission } = useNotificationContext();
  const [dismissed, setDismissed] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const wasDismissed = localStorage.getItem("notif-prompt-dismissed");
    if (wasDismissed) {
      setDismissed(true);
    }

    const timer = setTimeout(() => {
      if (isSupported && permission === "default" && !wasDismissed) {
        setShow(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isSupported, permission]);

  const handleEnable = async () => {
    await requestPermission();
    setShow(false);
  };

  const handleDismiss = () => {
    localStorage.setItem("notif-prompt-dismissed", "true");
    setDismissed(true);
    setShow(false);
  };

  if (!show || dismissed || permission !== "default") return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-80">
      <Card className="shadow-lg border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Bell className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-green-900">
                Aktifkan Notifikasi
              </p>
              <p className="text-xs text-green-700 mt-0.5">
                Dapatkan notifikasi saat ada guru yang absen
              </p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={handleEnable} className="bg-green-600 hover:bg-green-700">
                  Aktifkan
                </Button>
                <Button size="sm" variant="ghost" onClick={handleDismiss}>
                  Nanti
                </Button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-green-600 hover:text-green-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}