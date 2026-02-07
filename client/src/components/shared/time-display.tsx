"use client";

import { useCurrentTime } from "@/hooks";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface TimeDisplayProps {
  className?: string;
  showIcon?: boolean;
  showDate?: boolean;
}

export function TimeDisplay({
  className,
  showIcon = true,
  showDate = false,
}: TimeDisplayProps) {
  const time = useCurrentTime();

  const timeString = time.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const dateString = time.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className={cn("text-center", className)}>
      <div className="flex items-center justify-center gap-2">
        {showIcon && <Clock className="h-5 w-5 text-muted-foreground" />}
        <span className="text-2xl font-bold tabular-nums">{timeString}</span>
        <span className="text-sm text-muted-foreground">WIB</span>
      </div>
      {showDate && (
        <p className="mt-1 text-sm text-muted-foreground">{dateString}</p>
      )}
    </div>
  );
}

interface CountdownDisplayProps {
  targetTime: string;
  label?: string;
  className?: string;
}

export function CountdownDisplay({
  targetTime,
  label,
  className,
}: CountdownDisplayProps) {
  const time = useCurrentTime();

  const [hours, minutes] = targetTime.split(":").map(Number);
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);

  const diff = Math.max(0, Math.floor((target.getTime() - time.getTime()) / 1000));
  const mins = Math.floor(diff / 60);
  const secs = diff % 60;

  const isExpired = diff <= 0;

  return (
    <div className={cn("text-center", className)}>
      {label && <p className="text-sm text-muted-foreground mb-1">{label}</p>}
      <span
        className={cn(
          "text-xl font-bold tabular-nums",
          isExpired ? "text-destructive" : mins <= 5 ? "text-yellow-600" : ""
        )}
      >
        {isExpired
          ? "00:00"
          : `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`}
      </span>
    </div>
  );
}