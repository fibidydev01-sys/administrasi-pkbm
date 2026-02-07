"use client";

import { cn } from "@/lib/utils";
import { LucideIcon, FileX, Calendar, Users, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

// ✅ Dynamic import Lottie player (SSR-safe, React 19 compatible)
const DotLottieReact = dynamic(
  () => import("@lottiefiles/dotlottie-react").then((mod) => mod.DotLottieReact),
  { ssr: false }
);

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon = FileX,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 text-center",
        className
      )}
    >
      <div className="rounded-full bg-muted p-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} className="mt-4">
          {action.label}
        </Button>
      )}
    </div>
  );
}

// ✅ EmptyJadwal with Lottie (LARGER SIZE)
export function EmptyJadwal() {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      {/* ✅ BIGGER: 400px max-width, 400px height */}
      <div className="w-full max-w-[400px] h-[400px] mb-2">
        <DotLottieReact
          src="/lottie/waiting.lottie"
          loop
          autoplay
        />
      </div>

      {/* Text */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Belum Ada Jadwal
      </h3>
    </div>
  );
}

export function EmptyGuru() {
  return (
    <EmptyState
      icon={Users}
      title="Tidak Ada Guru"
      description="Belum ada data guru yang terdaftar."
    />
  );
}

// ✅ EmptyAbsensi with Lottie (LARGER SIZE)
export function EmptyAbsensi() {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      {/* ✅ BIGGER: 400px max-width, 400px height */}
      <div className="w-full max-w-[800px] h-[800px] mb-2">
        <DotLottieReact
          src="/lottie/waiting.lottie"
          loop
          autoplay
        />
      </div>

      {/* Text */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Belum Ada Riwayat
      </h3>
    </div>
  );
}