"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// ✅ Dynamic import Lottie player
const DotLottieReact = dynamic(
  () => import("@lottiefiles/dotlottie-react").then((mod) => mod.DotLottieReact),
  { ssr: false }
);

interface AbsenSuccessProps {
  tipe: "masuk" | "pulang";
  onDone?: () => void;
}

export function AbsenSuccess({ tipe, onDone }: AbsenSuccessProps) {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // ✅ Show button after animation completes (3 seconds)
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 3000); // 3 detik - sesuai durasi animasi

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="mx-auto max-w-lg py-8">
      <Card className="shadow-lg border-green-200">
        <CardContent className="pt-8 pb-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            {/* ✅ Lottie Success Animation - BIG! */}
            <div className="w-full max-w-[320px] h-[320px]">
              <DotLottieReact
                src="/lottie/approve.lottie"
                loop={false}
                autoplay
                speed={0.8} // ✅ Slightly slower for better visual
              />
            </div>

            {/* Success Message */}
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold text-gray-900">
                Absen {tipe === "masuk" ? "Masuk" : "Pulang"} Tercatat
              </p>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Terima kasih sudah melakukan absensi tepat waktu
              </p>
            </div>

            {/* ✅ Action Button - Show after animation */}
            {onDone && (
              <div className={`w-full max-w-sm mt-6 transition-all duration-500 ${showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>
                <Button
                  onClick={onDone}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  Kembali ke Dashboard
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}