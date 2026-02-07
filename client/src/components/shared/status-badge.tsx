import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Timer,
} from "lucide-react";
import type { AbsenStatus } from "@/types";

interface StatusBadgeProps {
  status: AbsenStatus;
  className?: string;
}

const statusConfig: Record<
  AbsenStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }
> = {
  valid: { label: "Valid", variant: "default", icon: CheckCircle },
  invalid: { label: "Invalid", variant: "destructive", icon: XCircle },
  suspicious: { label: "Mencurigakan", variant: "secondary", icon: AlertCircle },
  auto: { label: "Auto", variant: "outline", icon: Timer },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={cn("gap-1", className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

interface AbsenTypeBadgeProps {
  tipe: "masuk" | "pulang";
  className?: string;
}

export function AbsenTypeBadge({ tipe, className }: AbsenTypeBadgeProps) {
  return (
    <Badge
      variant={tipe === "masuk" ? "default" : "secondary"}
      className={className}
    >
      {tipe === "masuk" ? "Masuk" : "Pulang"}
    </Badge>
  );
}

interface JadwalStatusBadgeProps {
  isActive: boolean;
  isWithinWindow?: boolean;
  className?: string;
}

export function JadwalStatusBadge({
  isActive,
  isWithinWindow,
  className,
}: JadwalStatusBadgeProps) {
  if (!isActive) {
    return (
      <Badge variant="secondary" className={cn("gap-1", className)}>
        <XCircle className="h-3 w-3" />
        Nonaktif
      </Badge>
    );
  }

  if (isWithinWindow) {
    return (
      <Badge variant="default" className={cn("gap-1 bg-green-600", className)}>
        <Clock className="h-3 w-3" />
        Aktif
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={cn("gap-1", className)}>
      <Clock className="h-3 w-3" />
      Terjadwal
    </Badge>
  );
}